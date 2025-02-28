import { writable } from 'svelte/store';
import type { Notification, NotificationStore } from '$lib/types';
import { notificationService } from '$lib/services/notification';
import { userStore } from './userStore';
import { browser } from '$app/environment';

// Initial state
const initialState: NotificationStore = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
};

function createNotificationStore() {
    const { subscribe, set, update } = writable<NotificationStore>(initialState);
    
    // Store the user ID for polling
    let userId: string | null = null;
    let pollingInterval: ReturnType<typeof setInterval> | null = null;
    
    // Subscribe to user store to get user ID
    userStore.subscribe(userState => {
        userId = userState.user?.userId || null;
        
        // If user logs out, reset the store
        if (!userId) {
            set(initialState);
            stopPolling();
        }
    });
    
    // Start polling for new notifications
    function startPolling(intervalMs = 30000) {
        if (!browser || !userId || pollingInterval) return;
        
        // Initial fetch
        fetchNotifications();
        
        // Set up polling
        pollingInterval = setInterval(() => {
            fetchNotifications();
        }, intervalMs);
    }
    
    // Stop polling
    function stopPolling() {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }
    
    // Fetch notifications from the service
    async function fetchNotifications() {
        if (!userId) return;
        
        update(state => ({ ...state, loading: true }));
        
        try {
            const notifications = await notificationService.getUserNotifications(userId);
            const unreadCount = await notificationService.getUnreadCount(userId);
            
            set({
                notifications,
                unreadCount,
                loading: false,
                error: null
            });
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            update(state => ({
                ...state,
                loading: false,
                error: error.message || 'Failed to load notifications'
            }));
        }
    }
    
    return {
        subscribe,
        
        /**
         * Initialize the notification store
         */
        init: () => {
            if (!browser || !userId) return;
            startPolling();
        },
        
        /**
         * Fetch notifications manually
         */
        fetchNotifications,
        
        /**
         * Mark a notification as read
         */
        markAsRead: async (notificationId: string) => {
            if (!userId) return;
            
            try {
                await notificationService.markAsRead(notificationId);
                
                // Update the store
                update(state => {
                    const updatedNotifications = state.notifications.map(notification => 
                        notification.$id === notificationId
                            ? { ...notification, isRead: true }
                            : notification
                    );
                    
                    return {
                        ...state,
                        notifications: updatedNotifications,
                        unreadCount: Math.max(0, state.unreadCount - 1)
                    };
                });
            } catch (error: any) {
                console.error('Error marking notification as read:', error);
            }
        },
        
        /**
         * Mark all notifications as read
         */
        markAllAsRead: async () => {
            if (!userId) return;
            
            try {
                await notificationService.markAllAsRead(userId);
                
                // Update the store
                update(state => {
                    const updatedNotifications = state.notifications.map(notification => ({
                        ...notification,
                        isRead: true
                    }));
                    
                    return {
                        ...state,
                        notifications: updatedNotifications,
                        unreadCount: 0
                    };
                });
            } catch (error: any) {
                console.error('Error marking all notifications as read:', error);
            }
        },
        
        /**
         * Delete a notification
         */
        deleteNotification: async (notificationId: string) => {
            if (!userId) return;
            
            try {
                await notificationService.deleteNotification(notificationId);
                
                // Update the store
                update(state => {
                    const notification = state.notifications.find(n => n.$id === notificationId);
                    const wasUnread = notification && !notification.isRead;
                    
                    return {
                        ...state,
                        notifications: state.notifications.filter(n => n.$id !== notificationId),
                        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
                    };
                });
            } catch (error: any) {
                console.error('Error deleting notification:', error);
            }
        },
        
        /**
         * Create a notification
         */
        createNotification: async (params: {
            title: string;
            message: string;
            type: string;
        }) => {
            if (!userId) return;
            
            try {
                const notification = await notificationService.createNotification({
                    userId,
                    ...params
                });
                
                // Update the store
                update(state => ({
                    ...state,
                    notifications: [notification, ...state.notifications],
                    unreadCount: state.unreadCount + 1
                }));
                
                return notification;
            } catch (error: any) {
                console.error('Error creating notification:', error);
            }
        },
        
        /**
         * Reset the error state
         */
        resetError: () => {
            update(state => ({ ...state, error: null }));
        },
        
        /**
         * Clean up the store (call on component unmount)
         */
        cleanup: () => {
            stopPolling();
        }
    };
}

export const notificationStore = createNotificationStore(); 