<!-- src/routes/(app)/student/dashboard/+page.svelte -->
<script lang="ts">
    import { scheduleService } from '$lib/services/schedule';
    import { userStore } from '$lib/stores/userStore';
    import type { Schedule } from '$lib/types';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { Calendar, Clock, BookOpen } from 'lucide-svelte';
    import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';

    let loading = false;
    let error: string | null = null;
    let schedules: Schedule[] = [];
    let showScheduleDialog = false;
    let selectedSchedule: Schedule | null = null;
    let activeTab = 'calendar';

    // Analytics data
    let totalClasses = 0;
    let todayClasses = 0;
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
            // Load student's schedules
            schedules = await scheduleService.listSchedules({ studentId: userId });

            // Calculate analytics
            totalClasses = schedules.length;
            
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            todayClasses = schedules.filter(s => {
                const scheduleDate = new Date(s.startTime);
                return scheduleDate >= today && scheduleDate < tomorrow;
            }).length;
            
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

    function getUpcomingClasses(): Schedule[] {
        const now = new Date();
        return schedules
            .filter(s => new Date(s.startTime) > now)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 5);
    }
</script>

<div class="container mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Student Dashboard</h1>
    </div>

    {#if error}
        <div class="p-4 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/50 dark:text-red-100">
            {error}
        </div>
    {/if}

    <!-- Analytics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card class="p-6">
            <div class="flex items-center space-x-4">
                <BookOpen class="w-8 h-8 text-primary-500" />
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
                    <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Classes</h3>
                    <p class="text-2xl font-bold">{todayClasses}</p>
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

    <!-- Upcoming Classes -->
    <Card class="p-6">
        <h2 class="text-xl font-semibold mb-4">Upcoming Classes</h2>
        <div class="space-y-4">
            {#each getUpcomingClasses() as schedule}
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                        <h3 class="font-medium">{schedule.className}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(schedule.startTime)}
                        </p>
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                        {schedule.duration} minutes
                    </div>
                </div>
            {/each}
        </div>
    </Card>

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
                    {onScheduleClick}
                />
            </Card>
        </TabsContent>

        <TabsContent value="list">
            <Card class="p-6">
                <div class="space-y-4">
                    {#each schedules.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) as schedule}
                        <Card
                            class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
            </div>
        {/if}
        <div class="mt-6 flex justify-end">
            <Button on:click={handleDialogClose}>Close</Button>
        </div>
    </DialogContent>
</Dialog> 