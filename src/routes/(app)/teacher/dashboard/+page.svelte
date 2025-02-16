<!-- src/routes/(app)/teacher/dashboard/+page.svelte -->
<script lang="ts">
    import { scheduleService } from '$lib/services/schedule';
    import { userStore } from '$lib/stores/userStore';
    import type { Schedule } from '$lib/types';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { Calendar, Clock } from 'lucide-svelte';
    import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';
    import ScheduleList from '$lib/components/ScheduleList.svelte';

    let loading = false;
    let error: string | null = null;
    let schedules: Schedule[] = [];
    let showScheduleDialog = false;
    let selectedSchedule: Schedule | null = null;
    let activeTab = 'calendar';

    // Analytics data
    let totalClasses = 0;
    let upcomingClasses = 0;
    let weeklyHours = 0;

    onMount(async () => {
        const user = $userStore;
        if (user) {
            await loadData(user.userId);
        }
    });

    async function loadData(userId: string) {
        loading = true;
        error = null;

        try {
            // Load teacher's schedules
            schedules = await scheduleService.listSchedules({ teacherId: userId });

            // Calculate analytics
            totalClasses = schedules.length;
            
            const now = new Date();
            upcomingClasses = schedules.filter(s => new Date(s.startTime) > now).length;
            
            // Calculate weekly hours
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);

            const weeklySchedules = schedules.filter(s => {
                const scheduleDate = new Date(s.startTime);
                return scheduleDate >= weekStart && scheduleDate < weekEnd;
            });

            weeklyHours = Math.round(
                weeklySchedules.reduce((sum, s) => sum + s.duration, 0) / 60
            );
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

    function handleDialogClose() {
        selectedSchedule = null;
        showScheduleDialog = false;
    }

    function formatDateTime(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
</script>

<div class="container p-6 mx-auto space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Teacher Dashboard</h1>
    </div>

    {#if error}
        <div class="p-4 text-sm text-red-600 rounded-md bg-red-50 dark:bg-red-900/50 dark:text-red-100">
            {error}
        </div>
    {/if}

    <!-- Analytics Cards -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card class="p-6">
            <div class="flex items-center space-x-4">
                <Calendar class="w-8 h-8 text-primary-500" />
                <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Classes</h3>
                    <p class="text-2xl font-bold">{totalClasses}</p>
                </div>
            </div>
        </Card>

        <Card class="p-6">
            <div class="flex items-center space-x-4">
                <Calendar class="w-8 h-8 text-primary-500" />
                <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Classes</h3>
                    <p class="text-2xl font-bold">{upcomingClasses}</p>
                </div>
            </div>
        </Card>

        <Card class="p-6">
            <div class="flex items-center space-x-4">
                <Clock class="w-8 h-8 text-primary-500" />
                <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Weekly Hours</h3>
                    <p class="text-2xl font-bold">{weeklyHours}</p>
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
                <ScheduleCalendar
                    userId={$userStore?.userId}
                    {handleScheduleClick}
                />
            </Card>
        </TabsContent>

        <TabsContent value="list">
            <Card class="p-6">
                <div class="space-y-4">
                    {#each schedules.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) as schedule}
                        <Card
                            class="p-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 {schedule.conflictStatus === 'conflict' ? 'bg-red-50 dark:bg-red-900/50' : ''}"
                            on:click={() => handleScheduleClick(schedule)}
                        >
                            <div class="flex items-start justify-between">
                                <div>
                                    <h3 class="font-medium">{schedule.className}</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTime(schedule.startTime)}
                                    </p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                        Duration: {schedule.duration} minutes
                                    </p>
                                </div>
                            </div>
                        </Card>
                    {/each}
                </div>
            </Card>
        </TabsContent>
    </Tabs>
</div>

<!-- Schedule Details Dialog -->
<Dialog bind:open={showScheduleDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Class Details</DialogTitle>
        </DialogHeader>
        {#if selectedSchedule}
            <div class="space-y-4">
                <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Class Name</h3>
                    <p class="mt-1">{selectedSchedule.className}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</h3>
                    <p class="mt-1">{formatDateTime(selectedSchedule.startTime)}</p>
                </div>
                <div>
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</h3>
                    <p class="mt-1">{selectedSchedule.duration} minutes</p>
                </div>
                {#if selectedSchedule.conflictStatus === 'conflict'}
                    <div class="p-4 text-sm text-red-600 rounded-md bg-red-50 dark:bg-red-900/50 dark:text-red-100">
                        This class has a scheduling conflict. Please contact the administrator.
                    </div>
                {/if}
            </div>
        {/if}
        <div class="flex justify-end mt-6">
            <Button on:click={handleDialogClose}>Close</Button>
        </div>
    </DialogContent>
</Dialog> 