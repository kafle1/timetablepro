<!-- src/routes/(dashboard)/dashboard/+page.svelte -->
<script lang="ts">
    import { authStore } from '$lib/stores/auth';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Button } from '$lib/components/ui/button';
    import { Calendar, Users, BookOpen, Clock } from 'lucide-svelte';

    // Mock data - replace with actual data from your Appwrite database
    const stats = {
        totalClasses: 24,
        totalStudents: 150,
        totalTeachers: 12,
        upcomingClasses: 5
    };
</script>

<div class="space-y-8">
    <div>
        <h1 class="text-3xl font-bold tracking-tight">Welcome back, {$authStore.user?.name}</h1>
        <p class="text-muted-foreground">Here's an overview of your schedule and statistics.</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Total Classes</CardTitle>
                <Calendar class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold">{stats.totalClasses}</div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Total Students</CardTitle>
                <Users class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Total Teachers</CardTitle>
                <BookOpen class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold">{stats.totalTeachers}</div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Upcoming Classes</CardTitle>
                <Clock class="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div class="text-2xl font-bold">{stats.upcomingClasses}</div>
            </CardContent>
        </Card>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card class="col-span-4">
            <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="text-muted-foreground">
                    Schedule visualization will be implemented here
                </div>
            </CardContent>
        </Card>

        <Card class="col-span-3">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="flex flex-col space-y-2">
                    <Button variant="outline" class="justify-start">
                        <Calendar class="mr-2 h-4 w-4" />
                        View Today's Schedule
                    </Button>
                    <Button variant="outline" class="justify-start">
                        <Clock class="mr-2 h-4 w-4" />
                        Set Availability
                    </Button>
                    <Button variant="outline" class="justify-start">
                        <Users class="mr-2 h-4 w-4" />
                        Manage Classes
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
</div> 