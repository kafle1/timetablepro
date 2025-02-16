<!-- src/lib/components/notifications/notification-menu.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { notificationStore, type Notification } from '$lib/stores/notification';
    import { Button } from '$lib/components/ui/button';
    import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuLabel,
        DropdownMenuSeparator,
        DropdownMenuTrigger,
    } from '$lib/components/ui/dropdown-menu';
    import { Bell, Check, Trash2, CheckCheck } from 'lucide-svelte';
    import { formatDateTime } from '$lib/utils/date';

    let loading = false;

    onMount(async () => {
        if ($authStore.user) {
            await notificationStore.fetchNotifications($authStore.user.$id);
        }
    });

    async function handleMarkAsRead(notification: Notification) {
        if (notification.is_read) return;
        try {
            await notificationStore.markAsRead(notification.$id);
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    async function handleMarkAllAsRead() {
        if (!$authStore.user) return;
        try {
            loading = true;
            await notificationStore.markAllAsRead($authStore.user.$id);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        } finally {
            loading = false;
        }
    }

    async function handleDelete(notification: Notification) {
        try {
            await notificationStore.deleteNotification(notification.$id);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    }
</script>

<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" class="relative">
            <Bell class="w-4 h-4" />
            {#if $notificationStore.unreadCount > 0}
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {$notificationStore.unreadCount}
                </span>
            {/if}
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-80">
        <DropdownMenuLabel class="flex items-center justify-between">
            <span>Notifications</span>
            {#if $notificationStore.notifications.some(n => !n.is_read)}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    class="h-8 px-2 text-xs"
                    on:click={handleMarkAllAsRead}
                    disabled={loading}
                >
                    <CheckCheck class="w-4 h-4 mr-1" />
                    Mark all as read
                </Button>
            {/if}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {#if $notificationStore.notifications.length === 0}
            <div class="p-4 text-sm text-center text-muted-foreground">
                No notifications
            </div>
        {:else}
            <div class="max-h-[300px] overflow-y-auto">
                {#each $notificationStore.notifications as notification}
                    <DropdownMenuItem class="flex flex-col items-start p-4 space-y-1 focus:bg-accent">
                        <div class="flex items-start justify-between w-full">
                            <div class="flex-1">
                                <p class="font-medium {notification.is_read ? 'text-muted-foreground' : ''}">
                                    {notification.title}
                                </p>
                                <p class="text-sm text-muted-foreground">
                                    {notification.message}
                                </p>
                                <p class="text-xs text-muted-foreground mt-1">
                                    {formatDateTime(notification.created_at)}
                                </p>
                            </div>
                            <div class="flex items-center space-x-2 ml-4">
                                {#if !notification.is_read}
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        class="h-6 w-6"
                                        on:click={() => handleMarkAsRead(notification)}
                                    >
                                        <Check class="w-3 h-3" />
                                    </Button>
                                {/if}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    class="h-6 w-6 text-destructive"
                                    on:click={() => handleDelete(notification)}
                                >
                                    <Trash2 class="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </DropdownMenuItem>
                {/each}
            </div>
        {/if}
    </DropdownMenuContent>
</DropdownMenu> 