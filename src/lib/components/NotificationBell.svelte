<!-- src/lib/components/NotificationBell.svelte -->
<script lang="ts">
    import { notificationStore } from '$lib/stores/notificationStore';
    import { userStore } from '$lib/stores/userStore';
    import { onMount, onDestroy } from 'svelte';
    import { Bell } from 'lucide-svelte';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';

    let showPanel = false;
    let cleanup: (() => void) | undefined;
    let notificationsEnabled = false; // Disable notifications completely

    onMount(() => {
        // Notifications are completely disabled for UI testing
        localStorage.setItem('disableNotifications', 'true');
        localStorage.setItem('notificationsCollectionMissing', 'true');
    });

    onDestroy(() => {
        if (cleanup) cleanup();
    });

    function handleMarkAllAsRead() {
        // No-op for UI testing
    }

    function handleMarkAsRead(notificationId: string) {
        // No-op for UI testing
    }

    function handleDelete(notificationId: string) {
        // No-op for UI testing
    }
</script>

<div class="relative">
    <DropdownMenu>
        <DropdownMenuTrigger>
            <button
                class="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Notifications"
            >
                <Bell class="w-6 h-6" />
            </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="w-96">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold">Notifications</h3>
                </div>
            </div>

            <div class="max-h-[400px] overflow-y-auto">
                <div class="p-4 text-center text-gray-500">
                    Notifications disabled for UI testing
                </div>
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
</div>

<style>
    /* Add any additional styles here */
</style> 