<!-- src/routes/(app)/admin/dashboard/+page.svelte -->
<script lang="ts">
    import { scheduleService } from '$lib/services/schedule';
    import { roomService } from '$lib/services/room';
    import { notificationService } from '$lib/services/notification';
    import { userStore } from '$lib/stores/userStore';
    import type { Schedule, Room } from '$lib/types';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { Plus, Calendar, Building2, AlertTriangle } from 'lucide-svelte';
    import ScheduleForm from '$lib/components/ScheduleForm.svelte';
    import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';

    let loading = false;
    let error: string | null = null;
    let schedules: Schedule[] = [];
    let rooms: Room[] = [];
    let showScheduleDialog = false;
    let selectedSchedule: Schedule | null = null;
    let activeTab = 'calendar';

    // Analytics data
    let totalSchedules = 0;
    let totalRooms = 0;
    let conflictCount = 0;
    let roomUtilization: Record<string, number> = {};

    onMount(async () => {
        await loadData();
    });

    async function loadData() {
        loading = true;
        error = null;

        try {
            const [schedulesData, roomsData] = await Promise.all([
                scheduleService.listSchedules(),
                roomService.listRooms()
            ]);

            schedules = schedulesData;
            rooms = roomsData;

            // Calculate analytics
            totalSchedules = schedules.length;
            totalRooms = rooms.length;
            conflictCount = schedules.filter(s => s.conflictStatus === 'conflict').length;

            // Calculate room utilization
            roomUtilization = rooms.reduce((acc, room) => {
                const roomSchedules = schedules.filter(s => s.roomId === room.$id);
                const totalMinutes = roomSchedules.reduce((sum, s) => sum + s.duration, 0);
                acc[room.$id] = Math.round((totalMinutes / (24 * 60)) * 100);
                return acc;
            }, {} as Record<string, number>);
        } catch (err) {
            error = 'Failed to load dashboard data';
            console.error('Error loading dashboard data:', err);
        } finally {
            loading = false;
        }
    }

    function handleScheduleClick(schedule: Schedule) {
        selectedSchedule = schedule;
        showScheduleDialog = true;
    }

    async function handleScheduleSubmit(schedule: Schedule) {
        showScheduleDialog = false;
        await loadData();
    }

    function handleScheduleCancel() {
        selectedSchedule = null;
        showScheduleDialog = false;
    }

    function handleNewSchedule() {
        selectedSchedule = null;
        showScheduleDialog = true;
    }
</script>

<div class="container mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Admin Dashboard</h1>
        <Button on:click={handleNewSchedule}>
            <Plus class="w-4 h-4 mr-2" />
            New Schedule
        </Button>
    </div>

    {#if error}
        <div class="p-4 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/50 dark:text-red-100">
            {error}
        </div>
    {/if}

    <!-- Analytics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card class="p-6">
            <div class="flex items-center space-x-4">
                <Calendar class="w-8 h-8 text-primary-500" />
                <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Schedules</h3>
                    <p class="text-2xl font-bold">{totalSchedules}</p>
                </div>
            </div>
        </Card>

        <Card class="p-6">
            <div class="flex items-center space-x-4">
                <Building2 class="w-8 h-8 text-primary-500" />
                <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rooms</h3>
                    <p class="text-2xl font-bold">{totalRooms}</p>
                </div>
            </div>
        </Card>

        <Card class="p-6">
            <div class="flex items-center space-x-4">
                <AlertTriangle class="w-8 h-8 text-red-500" />
                <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Conflicts</h3>
                    <p class="text-2xl font-bold">{conflictCount}</p>
                </div>
            </div>
        </Card>

        <Card class="p-6">
            <div>
                <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Room Utilization</h3>
                <div class="space-y-2">
                    {#each rooms as room}
                        <div class="flex items-center justify-between text-sm">
                            <span class="truncate">{room.roomName}</span>
                            <span class="font-medium">{roomUtilization[room.$id] || 0}%</span>
                        </div>
                    {/each}
                </div>
            </div>
        </Card>
    </div>

    <!-- Main Content -->
    <Tabs value={activeTab} onValueChange={value => activeTab = value}>
        <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
            <Card class="p-6">
                <ScheduleCalendar {onScheduleClick} />
            </Card>
        </TabsContent>

        <TabsContent value="list">
            <Card class="p-6">
                <div class="space-y-4">
                    {#each schedules as schedule}
                        <Card
                            class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors {schedule.conflictStatus === 'conflict' ? 'bg-red-50 dark:bg-red-900/50' : ''}"
                            on:click={() => handleScheduleClick(schedule)}
                        >
                            <div class="flex items-start justify-between">
                                <div>
                                    <h3 class="font-medium">{schedule.className}</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(schedule.startTime).toLocaleString()} ({schedule.duration} minutes)
                                    </p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                        Room: {rooms.find(r => r.$id === schedule.roomId)?.roomName || 'Unknown'}
                                    </p>
                                </div>
                                {#if schedule.conflictStatus === 'conflict'}
                                    <AlertTriangle class="w-5 h-5 text-red-500" />
                                {/if}
                            </div>
                        </Card>
                    {/each}
                </div>
            </Card>
        </TabsContent>
    </Tabs>
</div>

<!-- Schedule Dialog -->
<Dialog bind:open={showScheduleDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>
                {selectedSchedule ? 'Edit Schedule' : 'New Schedule'}
            </DialogTitle>
        </DialogHeader>
        <ScheduleForm
            schedule={selectedSchedule}
            onSubmit={handleScheduleSubmit}
            onCancel={handleScheduleCancel}
        />
    </DialogContent>
</Dialog> 