<!-- src/routes/(app)/admin/dashboard/+page.svelte -->
<script lang="ts">
    import { scheduleService } from '$lib/services/schedule';
    import { roomService } from '$lib/services/room';
    import { userStore } from '$lib/stores/user';
    import type { Schedule, Room } from '$lib/types';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { Plus, Calendar, Building2, AlertTriangle, Users, Building, BarChart, Settings, Bell, Activity } from 'lucide-svelte';
    import ScheduleForm from '$lib/components/ScheduleForm.svelte';
    import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';
    import { goto } from '$app/navigation';
    import { authService } from '$lib/services/auth';
    import { ROUTES } from '$lib/config';

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
        conflictingSchedules: 0,
        teachers: 0,
        students: 0,
        rooms: 0,
        upcomingEvents: 0,
        scheduleConflicts: 0,
        recentActivityCount: 0
    };

    // Recent items
    let recentSchedules: Schedule[] = [];

    // Get admin name for welcome message
    $: adminName = $userStore?.name || 'Admin';

    onMount(async () => {
        try {
            // Check if user is admin
            if (!$userStore || $userStore.role !== 'ADMIN') {
                goto('/dashboard');
                return;
            }
            
            // Load all data in parallel
            await Promise.all([
                loadStatistics(),
                loadRecentSchedules(),
                loadData()
            ]);
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
            stats.totalRooms = roomsResponse.documents.length;
            
            // Get user counts
            const usersResponse = await authService.getUsers();
            const users = Array.isArray(usersResponse) ? usersResponse : [];
            stats.totalTeachers = users.filter((user: any) => user.role === 'TEACHER').length;
            stats.totalStudents = users.filter((user: any) => user.role === 'STUDENT').length;
            
            // Get schedule counts
            const schedulesResponse = await scheduleService.listSchedules();
            stats.totalSchedules = schedulesResponse.documents.length;
            const documents = Array.isArray(schedulesResponse.documents) ? schedulesResponse.documents : [];
            stats.conflictingSchedules = documents.filter(
                (schedule: any) => schedule.conflictStatus === 'conflict'
            ).length;
        } catch (err: any) {
            console.error('Error loading statistics:', err);
            error = err.message || 'Failed to load statistics';
        }
    }

    async function loadRecentSchedules() {
        try {
            const response = await scheduleService.listSchedules();
            const documents = Array.isArray(response.documents) ? response.documents : [];
            recentSchedules = documents
                .sort((a: any, b: any) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
                .slice(0, 5) as Schedule[];
        } catch (err: any) {
            console.error('Error loading recent schedules:', err);
            error = err.message || 'Failed to load recent schedules';
        }
    }

    async function loadData() {
        try {
            const [schedulesData, roomsData] = await Promise.all([
                scheduleService.listSchedules(),
                roomService.list()
            ]);

            schedules = Array.isArray(schedulesData.documents) ? 
                schedulesData.documents as Schedule[] : [];
            rooms = Array.isArray(roomsData.documents) ? 
                roomsData.documents as Room[] : [];

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
        }
    }

    function navigateTo(path: string) {
        goto(path);
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

<div class="container px-4 py-8 mx-auto space-y-8">
    <h1 class="text-3xl font-bold">Welcome back, {adminName}!</h1>

    <!-- Stats Cards - Wrapped with <a> tags -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <a href={ROUTES.ADMIN.TEACHERS} class="block transition-shadow rounded-lg hover:shadow-md">
            <Card>
                <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle class="text-sm font-medium">Total Teachers</CardTitle>
                    <Users class="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {#if loading}
                        <div class="w-16 h-8 rounded bg-muted animate-pulse"></div>
                    {:else}
                        <div class="text-2xl font-bold">{stats.totalTeachers}</div>
                        <p class="text-xs text-muted-foreground">Managed Teachers</p>
                    {/if}
                </CardContent>
            </Card>
        </a>
        <a href={ROUTES.ADMIN.STUDENTS} class="block transition-shadow rounded-lg hover:shadow-md">
            <Card>
                <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle class="text-sm font-medium">Total Students</CardTitle>
                    <Users class="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {#if loading}
                        <div class="w-16 h-8 rounded bg-muted animate-pulse"></div>
                    {:else}
                        <div class="text-2xl font-bold">{stats.totalStudents}</div>
                        <p class="text-xs text-muted-foreground">Enrolled Students</p>
                    {/if}
                </CardContent>
            </Card>
        </a>
        <a href={ROUTES.ADMIN.ROOMS} class="block transition-shadow rounded-lg hover:shadow-md">
            <Card>
                <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle class="text-sm font-medium">Total Rooms</CardTitle>
                    <Building class="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {#if loading}
                        <div class="w-16 h-8 rounded bg-muted animate-pulse"></div>
                    {:else}
                        <div class="text-2xl font-bold">{stats.totalRooms}</div>
                        <p class="text-xs text-muted-foreground">Available Rooms/Labs</p>
                    {/if}
                </CardContent>
            </Card>
        </a>
        <a href={ROUTES.ADMIN.SCHEDULES + '?status=conflict'} class="block transition-shadow rounded-lg hover:shadow-md">
            <Card>
                <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle class="text-sm font-medium">Schedule Conflicts</CardTitle>
                    <Calendar class="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {#if loading}
                        <div class="w-16 h-8 rounded bg-muted animate-pulse"></div>
                    {:else}
                        <div class="text-2xl font-bold text-destructive">{stats.conflictingSchedules}</div>
                        <p class="text-xs text-muted-foreground">Detected Conflicts</p>
                    {/if}
                </CardContent>
            </Card>
        </a>
        <Card>
            <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle class="text-sm font-medium">Recent Activities</CardTitle>
                <Activity class="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {#if loading}
                    <div class="w-16 h-8 rounded bg-muted animate-pulse"></div>
                {:else}
                    <div class="text-2xl font-bold">{stats.recentActivityCount}</div>
                    <p class="text-xs text-muted-foreground">Activities logged</p>
                {/if}
            </CardContent>
        </Card>
    </div>

    <!-- Main Dashboard Content Area -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Placeholder for Charts/Graphs -->
        <Card class="lg:col-span-2">
            <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Visual representation of key metrics (e.g., room usage, conflicts over time).</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col items-center justify-center h-64">
                <!-- Dummy SVG Bar Chart -->
                <div class="flex flex-col items-center w-full h-full">
                    <div class="mb-4 text-sm font-medium">Room Usage (Last 7 Days)</div>
                    <svg class="w-full h-48" viewBox="0 0 400 200">
                        <!-- Chart grid -->
                        <line x1="40" y1="20" x2="40" y2="180" stroke="currentColor" stroke-opacity="0.1" />
                        <line x1="40" y1="180" x2="380" y2="180" stroke="currentColor" stroke-opacity="0.1" />
                        
                        <!-- Y-axis labels -->
                        <text x="35" y="180" text-anchor="end" class="text-[10px]" fill="currentColor" fill-opacity="0.6">0%</text>
                        <text x="35" y="140" text-anchor="end" class="text-[10px]" fill="currentColor" fill-opacity="0.6">25%</text>
                        <text x="35" y="100" text-anchor="end" class="text-[10px]" fill="currentColor" fill-opacity="0.6">50%</text>
                        <text x="35" y="60" text-anchor="end" class="text-[10px]" fill="currentColor" fill-opacity="0.6">75%</text>
                        <text x="35" y="20" text-anchor="end" class="text-[10px]" fill="currentColor" fill-opacity="0.6">100%</text>
                        
                        <!-- Horizontal guidelines -->
                        <line x1="40" y1="140" x2="380" y2="140" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="2" />
                        <line x1="40" y1="100" x2="380" y2="100" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="2" />
                        <line x1="40" y1="60" x2="380" y2="60" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="2" />
                        <line x1="40" y1="20" x2="380" y2="20" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="2" />
                        
                        <!-- Bars -->
                        <rect x="60" y="80" width="30" height="100" fill="hsl(var(--primary))" fill-opacity="0.8" rx="3" />
                        <rect x="110" y="120" width="30" height="60" fill="hsl(var(--primary))" fill-opacity="0.8" rx="3" />
                        <rect x="160" y="60" width="30" height="120" fill="hsl(var(--primary))" fill-opacity="0.8" rx="3" />
                        <rect x="210" y="100" width="30" height="80" fill="hsl(var(--primary))" fill-opacity="0.8" rx="3" />
                        <rect x="260" y="40" width="30" height="140" fill="hsl(var(--primary))" fill-opacity="0.8" rx="3" />
                        <rect x="310" y="110" width="30" height="70" fill="hsl(var(--primary))" fill-opacity="0.8" rx="3" />
                        
                        <!-- X-axis labels -->
                        <text x="75" y="195" text-anchor="middle" class="text-[10px]" fill="currentColor" fill-opacity="0.6">Mon</text>
                        <text x="125" y="195" text-anchor="middle" class="text-[10px]" fill="currentColor" fill-opacity="0.6">Tue</text>
                        <text x="175" y="195" text-anchor="middle" class="text-[10px]" fill="currentColor" fill-opacity="0.6">Wed</text>
                        <text x="225" y="195" text-anchor="middle" class="text-[10px]" fill="currentColor" fill-opacity="0.6">Thu</text>
                        <text x="275" y="195" text-anchor="middle" class="text-[10px]" fill="currentColor" fill-opacity="0.6">Fri</text>
                        <text x="325" y="195" text-anchor="middle" class="text-[10px]" fill="currentColor" fill-opacity="0.6">Sat</text>
                    </svg>
                </div>
            </CardContent>
        </Card>

        <!-- Placeholder for Recent Activity/Notifications -->
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2"><Bell class="w-5 h-5"/> Recent Notifications</CardTitle>
                <CardDescription>Latest updates and system alerts.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                {#if loading}
                    {#each Array(3) as _}
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
                            <div class="space-y-2">
                                <div class="w-32 h-4 rounded bg-muted animate-pulse"></div>
                                <div class="w-24 h-3 rounded bg-muted animate-pulse"></div>
                            </div>
                        </div>
                    {/each}
                {:else}
                    <!-- Dummy notifications -->
                    <div class="flex items-start gap-3 pb-3 border-b">
                        <div class="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-primary/10">
                            <AlertTriangle class="w-4 h-4 text-warning" />
                        </div>
                        <div>
                            <p class="text-sm font-medium">Schedule Conflict Detected</p>
                            <p class="text-xs text-muted-foreground">Physics 101 and Chemistry Lab overlap in Room A102</p>
                            <p class="mt-1 text-xs text-muted-foreground">10 minutes ago</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start gap-3 pb-3 border-b">
                        <div class="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-primary/10">
                            <Users class="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p class="text-sm font-medium">New Teacher Registered</p>
                            <p class="text-xs text-muted-foreground">Dr. Jane Smith joined Mathematics department</p>
                            <p class="mt-1 text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start gap-3 pb-3">
                        <div class="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-primary/10">
                            <Calendar class="w-4 h-4 text-success" />
                        </div>
                        <div>
                            <p class="text-sm font-medium">Schedule Update</p>
                            <p class="text-xs text-muted-foreground">Computer Science 202 moved to Room B201</p>
                            <p class="mt-1 text-xs text-muted-foreground">Yesterday</p>
                        </div>
                    </div>
                    
                    <Button variant="outline" size="sm" class="w-full mt-2">View All Notifications</Button>
                {/if}
            </CardContent>
        </Card>
    </div>
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