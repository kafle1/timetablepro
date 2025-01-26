<!-- src/routes/(dashboard)/+layout.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { authStore } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    onMount(() => {
        if (!$authStore.user) {
            goto('/auth/login');
        }
    });
</script>

{#if $authStore.user}
    <div class="grid grid-cols-[250px_1fr] min-h-[calc(100vh-4rem)]">
        <aside class="border-r bg-muted/10 p-4">
            <nav class="space-y-2">
                <a
                    href="/dashboard"
                    class="block px-4 py-2 rounded-lg hover:bg-muted {$page.url.pathname === '/dashboard' ? 'bg-muted' : ''}"
                >
                    Overview
                </a>
                <a
                    href="/dashboard/schedule"
                    class="block px-4 py-2 rounded-lg hover:bg-muted {$page.url.pathname === '/dashboard/schedule' ? 'bg-muted' : ''}"
                >
                    Schedule
                </a>
                {#if $page.data.user?.role === 'admin'}
                    <a
                        href="/dashboard/users"
                        class="block px-4 py-2 rounded-lg hover:bg-muted {$page.url.pathname === '/dashboard/users' ? 'bg-muted' : ''}"
                    >
                        Users
                    </a>
                    <a
                        href="/dashboard/rooms"
                        class="block px-4 py-2 rounded-lg hover:bg-muted {$page.url.pathname === '/dashboard/rooms' ? 'bg-muted' : ''}"
                    >
                        Rooms
                    </a>
                {/if}
                {#if $page.data.user?.role === 'teacher'}
                    <a
                        href="/dashboard/availability"
                        class="block px-4 py-2 rounded-lg hover:bg-muted {$page.url.pathname === '/dashboard/availability' ? 'bg-muted' : ''}"
                    >
                        Availability
                    </a>
                {/if}
            </nav>
        </aside>

        <main class="p-6">
            <slot />
        </main>
    </div>
{/if} 