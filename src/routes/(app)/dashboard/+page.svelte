<!-- src/routes/(app)/dashboard/+page.svelte -->
<script lang="ts">
    import { authStore } from '$lib/stores/auth';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Calendar, Users, BookOpen, Clock } from 'lucide-svelte';

    const navigationCards = [
        {
            title: 'Schedule',
            description: 'View and manage your class schedule',
            icon: Calendar,
            href: '/schedule',
            roles: ['admin', 'teacher', 'student']
        },
        {
            title: 'Rooms',
            description: 'Manage classroom assignments',
            icon: BookOpen,
            href: '/rooms',
            roles: ['admin']
        },
        {
            title: 'Teachers',
            description: 'Manage teacher information and availability',
            icon: Users,
            href: '/teachers',
            roles: ['admin']
        },
        {
            title: 'Availability',
            description: 'Set your teaching availability',
            icon: Clock,
            href: '/availability',
            roles: ['teacher']
        }
    ];

    $: userRole = $authStore.user?.prefs?.role || 'student';
    $: filteredCards = navigationCards.filter(card => card.roles.includes(userRole));
</script>

<div class="container mx-auto px-4 py-8">
    <header class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight">Welcome, {$authStore.user?.name}</h1>
        <p class="text-muted-foreground mt-2">Manage your timetable and schedule</p>
    </header>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each filteredCards as card}
            <Card class="hover:bg-muted/50 transition-colors">
                <a href={card.href} class="block h-full">
                    <CardHeader>
                        <div class="flex items-center gap-2">
                            <svelte:component this={card.icon} class="h-5 w-5 text-primary" />
                            <CardTitle>{card.title}</CardTitle>
                        </div>
                        <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                </a>
            </Card>
        {/each}
    </div>

    <div class="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and actions</CardDescription>
            </CardHeader>
            <CardContent class="flex gap-4">
                <a href="/profile">
                    <Button variant="outline">View Profile</Button>
                </a>
                <Button variant="outline" on:click={() => authStore.logout()}>
                    Sign Out
                </Button>
            </CardContent>
        </Card>
    </div>
</div> 