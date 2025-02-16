<!-- src/lib/components/NotificationBell.svelte -->
<script lang="ts">
    import { notificationStore } from '$lib/stores/notificationStore';
    import { userStore } from '$lib/stores/userStore';
    import { onMount } from 'svelte';
    import { Bell } from 'lucide-svelte';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu';

    let showPanel = false;

    onMount(() => {
        const unsubscribe = userStore.subscribe(user => {
            if (user) {
                notificationStore.init(user.userId);
            } else {
                notificationStore.clear();
            }
        });

        return unsubscribe;
    });

    function handleMarkAllAsRead() {
        const user = $userStore;
        if (user) {
            notificationStore.markAllAsRead(user.userId);
        }
    }

    function handleMarkAsRead(notificationId: string) {
        notificationStore.markAsRead(notificationId);
    }

    function handleDelete(notificationId: string) {
        notificationStore.deleteNotification(notificationId);
    }

    function formatTimestamp(timestamp: string): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        // Less than a minute
        if (diff < 60000) {
            return 'Just now';
        }
        
        // Less than an hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }
        
        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }
        
        // Less than a week
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        }
        
        // Format as date
        return date.toLocaleDateString();
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
                {#if $notificationStore.unreadCount > 0}
                    <span
                        class="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
                    >
                        {$notificationStore.unreadCount}
                    </span>
                {/if}
            </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="w-96">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold">Notifications</h3>
                    {#if $notificationStore.notifications.length > 0}
                        <button
                            class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                            on:click={handleMarkAllAsRead}
                        >
                            Mark all as read
                        </button>
                    {/if}
                </div>
            </div>

            <div class="max-h-[400px] overflow-y-auto">
                {#if $notificationStore.loading}
                    <div class="p-4 text-center text-gray-500">
                        Loading notifications...
                    </div>
                {:else if $notificationStore.error}
                    <div class="p-4 text-center text-red-500">
                        {$notificationStore.error}
                    </div>
                {:else if $notificationStore.notifications.length === 0}
                    <div class="p-4 text-center text-gray-500">
                        No notifications
                    </div>
                {:else}
                    {#each $notificationStore.notifications as notification (notification.$id)}
                        <div
                            class="p-4 transition-colors border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            class:bg-gray-50={notification.status === 'unread'}
                            class:dark:bg-gray-800={notification.status === 'unread'}
                        >
                            <div class="flex items-start justify-between gap-4">
                                <div class="flex-1">
                                    <p class="text-sm text-gray-900 dark:text-gray-100">
                                        {notification.message}
                                    </p>
                                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {formatTimestamp(notification.timestamp)}
                                    </p>
                                </div>
                                <div class="flex items-center gap-2">
                                    {#if notification.status === 'unread'}
                                        <button
                                            class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                            on:click={() => handleMarkAsRead(notification.$id)}
                                        >
                                            Mark as read
                                        </button>
                                    {/if}
                                    <button
                                        class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        on:click={() => handleDelete(notification.$id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
</div>

<style>
    /* Add any additional styles here */
</style> 