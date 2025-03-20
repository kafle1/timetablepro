<!-- src/routes/(app)/admin/dashboard/+page.svelte -->
<script lang="ts">
    import { scheduleService } from '$lib/services/schedule';
    import { roomService } from '$lib/services/room';
    import { userStore } from '$lib/stores/user';
    import type { Schedule, Room } from '$lib/types';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { Plus, Calendar, Building2, AlertTriangle } from 'lucide-svelte';
    import ScheduleForm from '$lib/components/ScheduleForm.svelte';
    import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';
    import { goto } from '$app/navigation';
    import { authService } from '$lib/services/auth';

    let loading = true;
    let error = '';
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

    // Statistics
    let stats = {
        totalRooms: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalSchedules: 0,
        conflictingSchedules: 0
    };

    // Recent items
    let recentSchedules: Schedule[] = [];

    onMount(async () => {
        try {
            // Check if user is admin
            if (!$userStore || $userStore.role !== 'ADMIN') {
                goto('/dashboard');
                return;
            }
            
            // Load statistics
            await loadStatistics();
            
            // Load recent items
            await loadRecentSchedules();
        } catch (err: any) {
            error = err.message || 'Failed to load dashboard data';
            console.error('Error loading dashboard data:', err);
        } finally {
            loading = false;
        }
    });

    async function loadStatistics() {
        try {
            // Get room count
            const roomsResponse = await roomService.list();
            stats.totalRooms = roomsResponse.total;
            
            // Get user counts
            const usersResponse = await authService.getUsers();
            const users = usersResponse;
            stats.totalTeachers = users.filter(user => user.role === 'TEACHER').length;
            stats.totalStudents = users.filter(user => user.role === 'STUDENT').length;
            
            // Get schedule counts
            const schedulesResponse = await scheduleService.listSchedules();
            stats.totalSchedules = schedulesResponse.total;
            stats.conflictingSchedules = schedulesResponse.documents.filter(
                schedule => schedule.conflictStatus === 'conflict'
            ).length;
        } catch (err: any) {
            console.error('Error loading statistics:', err);
        }
    }

    async function loadRecentSchedules() {
        try {
            const response = await scheduleService.listSchedules();
            recentSchedules = response.documents.slice(0, 5) as Schedule[];
        } catch (err: any) {
            console.error('Error loading recent schedules:', err);
        }
    }

    function navigateTo(path: string) {
        goto(path);
    }

    async function loadData() {
        loading = true;
        error = '';

        try {
            const [schedulesData, roomsData] = await Promise.all([
                scheduleService.listSchedules(),
                roomService.list()
            ]);

            schedules = schedulesData.documents as Schedule[];
            rooms = roomsData.documents as Room[];

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

<div class="container px-4 py-8 mx-auto">
    <h1 class="mb-6 text-3xl font-bold">Admin Dashboard</h1>
    
    {#if error}
        <div class="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
        </div>
    {/if}
    
    {#if loading}
        <div class="flex items-center justify-center p-8">
            <svg class="w-8 h-8 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    {:else}
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
            <div class="p-6 bg-white rounded-lg shadow">
                <div class="flex items-center">
                    <div class="p-3 mr-4 text-white bg-indigo-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <p class="mb-2 text-sm font-medium text-gray-600">Total Rooms</p>
                        <p class="text-lg font-semibold text-gray-700">{stats.totalRooms}</p>
                    </div>
                </div>
                <button 
                    class="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    on:click={() => navigateTo('/rooms')}
                >
                    Manage Rooms
                </button>
            </div>
            
            <div class="p-6 bg-white rounded-lg shadow">
                <div class="flex items-center">
                    <div class="p-3 mr-4 text-white bg-green-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div>
                        <p class="mb-2 text-sm font-medium text-gray-600">Teachers</p>
                        <p class="text-lg font-semibold text-gray-700">{stats.totalTeachers}</p>
                    </div>
                </div>
                <button 
                    class="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    on:click={() => navigateTo('/teachers')}
                >
                    Manage Teachers
                </button>
            </div>
            
            <div class="p-6 bg-white rounded-lg shadow">
                <div class="flex items-center">
                    <div class="p-3 mr-4 text-white bg-blue-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                    </div>
                    <div>
                        <p class="mb-2 text-sm font-medium text-gray-600">Students</p>
                        <p class="text-lg font-semibold text-gray-700">{stats.totalStudents}</p>
                    </div>
                </div>
                <button 
                    class="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    on:click={() => navigateTo('/students')}
                >
                    Manage Students
                </button>
            </div>
            
            <div class="p-6 bg-white rounded-lg shadow">
                <div class="flex items-center">
                    <div class="p-3 mr-4 text-white bg-purple-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p class="mb-2 text-sm font-medium text-gray-600">Schedules</p>
                        <p class="text-lg font-semibold text-gray-700">{stats.totalSchedules}</p>
                    </div>
                </div>
                <button 
                    class="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    on:click={() => navigateTo('/schedule')}
                >
                    Manage Schedules
                </button>
            </div>
            
            <div class="p-6 bg-white rounded-lg shadow">
                <div class="flex items-center">
                    <div class="p-3 mr-4 text-white bg-red-500 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p class="mb-2 text-sm font-medium text-gray-600">Conflicts</p>
                        <p class="text-lg font-semibold text-gray-700">{stats.conflictingSchedules}</p>
                    </div>
                </div>
                <button 
                    class="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    on:click={() => navigateTo('/schedule?conflicts=true')}
                >
                    View Conflicts
                </button>
            </div>
        </div>
        
        <!-- Recent Items -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Recent Schedules -->
            <div class="p-6 bg-white rounded-lg shadow">
                <h2 class="mb-4 text-xl font-semibold">Recent Schedules</h2>
                {#if recentSchedules.length === 0}
                    <p class="text-gray-500">No recent schedules found.</p>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Class
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Day
                                    </th>
                                    <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                        Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                {#each recentSchedules as schedule}
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm font-medium text-gray-900">{schedule.className}</div>
                                            <div class="text-sm text-gray-500">{schedule.subject}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">{schedule.dayOfWeek}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900">{schedule.startTime} - {schedule.endTime}</div>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-4 text-right">
                        <a href="/schedule" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            View all schedules →
                        </a>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
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