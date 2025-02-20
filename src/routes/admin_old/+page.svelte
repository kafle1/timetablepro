<!-- src/routes/admin/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/auth';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { getSchedules } from '$lib/services/schedule';
    import { getRooms } from '$lib/services/room';
    import type { Schedule } from '$lib/services/schedule';
    import type { Room } from '$lib/services/room';

    let loading = true;
    let error: string | null = null;
    let scheduleCount = 0;
    let roomCount = 0;
    let teacherCount = 0;
    let studentCount = 0;

    onMount(async () => {
        if ($authStore.user?.role !== 'admin') {
            error = 'You do not have permission to access this page';
            loading = false;
            return;
        }

        try {
            const [schedules, rooms] = await Promise.all([
                getSchedules(),
                getRooms()
            ]);

            scheduleCount = schedules.length;
            roomCount = rooms.length;

            // Get unique teacher and student counts from schedules
            const teacherIds = new Set(schedules.map(s => s.teacherId));
            teacherCount = teacherIds.size;

            const classes = new Set(schedules.map(s => s.class));
            studentCount = classes.size * 30; // Estimate 30 students per class
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            }
        } finally {
            loading = false;
        }
    });

    const stats = [
        {
            title: 'Total Schedules',
            value: scheduleCount,
            description: 'Active class schedules'
        },
        {
            title: 'Total Rooms',
            value: roomCount,
            description: 'Available classrooms'
        },
        {
            title: 'Teachers',
            value: teacherCount,
            description: 'Active teachers'
        },
        {
            title: 'Students',
            value: studentCount,
            description: 'Estimated total students'
        }
    ];
</script>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Admin Dashboard</h1>
    </div>

    {#if error}
        <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    {:else if loading}
        <div class="py-8 text-center">Loading dashboard data...</div>
    {:else}
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {#each stats as stat}
                <Card>
                    <CardHeader>
                        <CardTitle>{stat.title}</CardTitle>
                        <CardDescription>{stat.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p class="text-3xl font-bold">{stat.value}</p>
                    </CardContent>
                </Card>
            {/each}
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="grid gap-4">
                        <a href="/rooms" class="w-full">
                            <Button variant="outline" class="justify-start w-full">
                                Manage Rooms
                            </Button>
                        </a>
                        <a href="/schedule" class="w-full">
                            <Button variant="outline" class="justify-start w-full">
                                Manage Schedules
                            </Button>
                        </a>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-muted-foreground">Version</span>
                        <span>1.0.0</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-muted-foreground">Last Updated</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-muted-foreground">Environment</span>
                        <span>{import.meta.env.MODE}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    {/if}
</div> 
