<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { userStore } from '$lib/stores/user';
    import { scheduleStore } from '$lib/stores/schedule';
    import { roomStore } from '$lib/stores/room';
    import { teacherStore } from '$lib/stores/teacher';
    import { get } from 'svelte/store';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '$lib/components/ui/card';
    import { 
        Calendar, Users, BookOpen, Clock, Settings, User, Building, 
        AlertCircle, PlusCircle, Edit, Trash2, RefreshCcw, School, 
        ChevronRight, Search
    } from 'lucide-svelte';
    import { USER_ROLES } from '$lib/config/constants';
    import { goto } from '$app/navigation';
    import type { Schedule } from '$lib/types';

    // State
    let loading = true;
    let stats = {
        totalSchedules: 0,
        totalRooms: 0,
        totalTeachers: 0,
        totalConflicts: 0,
        weeklySchedules: 0,
        todaySchedules: 0
    };

    // User role
    $: userRole = $userStore?.role || 'STUDENT';
    $: userId = $userStore?.userId || '';
    $: userName = $userStore?.name || 'User';
    
    // Quick actions based on role
    const adminActions = [
        { title: 'Create Schedule', icon: PlusCircle, href: '/schedule/create', variant: 'default' as const },
        { title: 'Add Room', icon: Building, href: '/rooms/create', variant: 'outline' as const },
        { title: 'Add Teacher', icon: Users, href: '/teachers/create', variant: 'outline' as const },
        { title: 'Add Student', icon: User, href: '/students/create', variant: 'outline' as const },
        { title: 'View Conflicts', icon: AlertCircle, href: '/schedule/conflicts', variant: 'destructive' as const },
        { title: 'System Settings', icon: Settings, href: '/settings', variant: 'secondary' as const }
    ];

    const teacherActions = [
        { title: 'View My Schedule', icon: Calendar, href: '/schedule', variant: 'default' as const },
        { title: 'Set Availability', icon: Clock, href: '/availability', variant: 'outline' as const },
        { title: 'Update Profile', icon: User, href: '/profile', variant: 'outline' as const },
        { title: 'View Classes', icon: School, href: '/schedule/classes', variant: 'secondary' as const }
    ];

    const studentActions = [
        { title: 'View Schedule', icon: Calendar, href: '/schedule', variant: 'default' as const },
        { title: 'Today\'s Classes', icon: Clock, href: '/schedule/today', variant: 'outline' as const },
        { title: 'Update Profile', icon: User, href: '/profile', variant: 'outline' as const }
    ];

    // Recent activity (mock data - would be replaced with real data)
    const recentActivity = [
        {
            id: '1',
            title: 'Schedule Updated',
            description: 'Mathematics class moved to Room 101',
            timestamp: '1 hour ago',
            icon: Edit
        },
        {
            id: '2',
            title: 'New Teacher Added',
            description: 'John Smith (Mathematics) added to system',
            timestamp: '3 hours ago',
            icon: PlusCircle
        },
        {
            id: '3',
            title: 'Room Maintenance',
            description: 'Room 203 marked unavailable due to maintenance',
            timestamp: '1 day ago',
            icon: Building
        }
    ];
    
    // Navigation cards based on role
    const adminCards = [
        {
            title: 'Schedules',
            description: 'Manage class schedules',
            icon: Calendar,
            href: '/schedule',
            stat: stats.totalSchedules,
            actions: [
                { label: 'Create', icon: PlusCircle, href: '/schedule/create' },
                { label: 'View All', icon: ChevronRight, href: '/schedule' }
            ]
        },
        {
            title: 'Rooms',
            description: 'Manage classroom assignments',
            icon: Building,
            href: '/rooms',
            stat: stats.totalRooms,
            actions: [
                { label: 'Add Room', icon: PlusCircle, href: '/rooms/create' },
                { label: 'View All', icon: ChevronRight, href: '/rooms' }
            ]
        },
        {
            title: 'Teachers',
            description: 'Manage teachers and availability',
            icon: Users,
            href: '/teachers',
            stat: stats.totalTeachers,
            actions: [
                { label: 'Add Teacher', icon: PlusCircle, href: '/teachers/create' },
                { label: 'View All', icon: ChevronRight, href: '/teachers' }
            ]
        },
        {
            title: 'Conflicts',
            description: 'Resolve scheduling conflicts',
            icon: AlertCircle,
            href: '/schedule/conflicts',
            stat: stats.totalConflicts,
            actions: [
                { label: 'Resolve', icon: RefreshCcw, href: '/schedule/conflicts' }
            ]
        }
    ];

    const teacherCards = [
        {
            title: 'My Schedule',
            description: 'View your teaching schedule',
            icon: Calendar,
            href: '/schedule',
            stat: stats.totalSchedules,
            actions: [
                { label: 'View Details', icon: ChevronRight, href: '/schedule' }
            ]
        },
        {
            title: 'My Availability',
            description: 'Set your availability preferences',
            icon: Clock,
            href: '/availability',
            stat: null,
            actions: [
                { label: 'Update', icon: Edit, href: '/availability' }
            ]
        },
        {
            title: 'Profile',
            description: 'Manage your account settings',
            icon: User,
            href: '/profile',
            stat: null,
            actions: [
                { label: 'Edit', icon: Edit, href: '/profile' }
            ]
        }
    ];

    const studentCards = [
        {
            title: 'Class Schedule',
            description: 'View your class timetable',
            icon: Calendar,
            href: '/schedule',
            stat: stats.totalSchedules,
            actions: [
                { label: 'View Details', icon: ChevronRight, href: '/schedule' }
            ]
        },
        {
            title: "Today's Classes",
            description: "View today's upcoming classes",
            icon: Clock,
            href: '/schedule/today',
            stat: stats.todaySchedules,
            actions: [
                { label: 'View', icon: ChevronRight, href: '/schedule/today' }
            ]
        },
        {
            title: 'Profile',
            description: 'Manage your account information',
            icon: User,
            href: '/profile',
            stat: null,
            actions: [
                { label: 'Edit', icon: Edit, href: '/profile' }
            ]
        }
    ];
    
    // Get the appropriate navigation cards based on user role
    $: navigationCards = userRole === USER_ROLES.ADMIN 
        ? adminCards 
        : userRole === USER_ROLES.TEACHER 
            ? teacherCards 
            : studentCards;
            
    // Get quick actions based on user role
    $: quickActions = userRole === USER_ROLES.ADMIN
        ? adminActions
        : userRole === USER_ROLES.TEACHER
            ? teacherActions
            : studentActions;

    onMount(async () => {
        await loadStats();
    });

    async function loadStats() {
        try {
            loading = true;
            
            // Different stats based on user role
            if (userRole === USER_ROLES.ADMIN) {
                // For admin, get overall stats
                scheduleStore.fetchSchedules();
                roomStore.fetchRooms();
                teacherStore.fetchTeachers();
                
                // Wait for stores to update
                await Promise.all([
                    new Promise(resolve => setTimeout(resolve, 500))
                ]);
                
                const schedules = get(scheduleStore).schedules || [];
                const rooms = get(roomStore).rooms || [];
                const teachers = get(teacherStore).teachers || [];
                
                const conflicts = schedules.filter((schedule: Schedule) => schedule.conflictStatus === 'conflict');
                
                stats = {
                    ...stats,
                    totalSchedules: schedules.length,
                    totalRooms: rooms.length,
                    totalTeachers: teachers.length,
                    totalConflicts: conflicts.length
                };
            } else if (userRole === USER_ROLES.TEACHER) {
                // For teacher, get personal stats
                const schedules = await scheduleStore.getTeacherSchedules(userId);
                
                stats = {
                    ...stats,
                    totalSchedules: schedules.length
                };
            } else {
                // For student, get class stats
                scheduleStore.fetchSchedules();
                
                // Wait for store to update
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const schedules = get(scheduleStore).schedules || [];
                
                // Get today's schedules
                const today = new Date();
                const todaySchedules = schedules.filter((schedule: Schedule) => {
                    // Convert schedule date to comparable format
                    const scheduleDay = schedule.dayOfWeek.toLowerCase();
                    const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                    return scheduleDay === currentDay;
                });
                
                stats = {
                    ...stats,
                    totalSchedules: schedules.length,
                    todaySchedules: todaySchedules.length
                };
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        } finally {
            loading = false;
        }
    }

    function navigateTo(href: string) {
        goto(href);
    }
</script>

<div class="space-y-8">
    <header class="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Welcome, {userName}</h1>
            <p class="text-muted-foreground mt-2">
                {#if userRole === USER_ROLES.ADMIN}
                    Manage timetables, rooms, and teachers
                {:else if userRole === USER_ROLES.TEACHER}
                    Manage your teaching schedule and availability
                {:else}
                    View your class schedule and upcoming classes
                {/if}
            </p>
        </div>
        <div class="mt-4 sm:mt-0">
            <div class="flex flex-wrap gap-2">
                <Button on:click={() => navigateTo('/schedule')}>
                    <Calendar class="w-4 h-4 mr-2" />
                    {userRole === USER_ROLES.ADMIN ? 'Manage Schedule' : 'View Schedule'}
                </Button>
                <Button variant="outline" on:click={() => navigateTo('/search')}>
                    <Search class="w-4 h-4 mr-2" />
                    Search
                </Button>
            </div>
        </div>
    </header>

    <!-- Statistics Cards -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {#each navigationCards as card}
            <Card class="overflow-hidden border border-border hover:shadow-md transition-all">
                <CardHeader class="pb-2 flex justify-between items-start">
                    <div class="space-y-1">
                        <CardTitle class="text-xl flex items-center gap-2">
                            <div class="p-2 rounded-full bg-primary/10 flex-shrink-0">
                                <svelte:component this={card.icon} class="h-5 w-5 text-primary" />
                            </div>
                            {card.title}
                        </CardTitle>
                        <CardDescription>{card.description}</CardDescription>
                    </div>
                    {#if card.stat !== null}
                        <div class="text-2xl font-bold text-primary">
                            {loading ? '...' : card.stat}
                        </div>
                    {/if}
                </CardHeader>
                <CardContent>
                    {#if card.actions && card.actions.length > 0}
                        <div class="flex flex-wrap justify-end gap-2 mt-4">
                            {#each card.actions as action}
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    on:click={() => navigateTo(action.href)} 
                                    class="flex items-center gap-1"
                                >
                                    <svelte:component this={action.icon} class="h-4 w-4" />
                                    {action.label}
                                </Button>
                            {/each}
                        </div>
                    {/if}
                </CardContent>
            </Card>
        {/each}
    </div>

    <!-- Quick Actions Section -->
    <div class="grid gap-6 grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle class="text-2xl">Quick Actions</CardTitle>
                <CardDescription>Shortcuts to common tasks</CardDescription>
            </CardHeader>
            <CardContent>
                <div class="flex flex-wrap gap-3">
                    {#each quickActions as action}
                        <Button variant={action.variant} on:click={() => navigateTo(action.href)}>
                            <svelte:component this={action.icon} class="w-4 h-4 mr-2" />
                            {action.title}
                        </Button>
                    {/each}
                </div>
            </CardContent>
        </Card>
    </div>

    <!-- Recent Activity -->
    {#if userRole === USER_ROLES.ADMIN}
        <div class="grid gap-6 grid-cols-1">
            <Card>
                <CardHeader>
                    <CardTitle class="text-2xl">Recent Activity</CardTitle>
                    <CardDescription>Latest changes in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul class="space-y-4">
                        {#each recentActivity as activity}
                            <li class="flex items-start space-x-4 border-b pb-4 last:border-0">
                                <div class="rounded-full p-2 bg-secondary flex-shrink-0">
                                    <svelte:component this={activity.icon} class="h-5 w-5 text-secondary-foreground" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium">{activity.title}</p>
                                    <p class="text-sm text-muted-foreground">{activity.description}</p>
                                    <p class="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </CardContent>
                <CardFooter class="border-t">
                    <Button variant="ghost" class="w-full" on:click={() => navigateTo('/activity')}>
                        View All Activity
                        <ChevronRight class="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    {/if}
</div> 