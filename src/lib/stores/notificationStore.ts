import { writable } from 'svelte/store';
import type { Notification, NotificationStore } from '$lib/types';
import { notificationService } from '$lib/services/notification';
import { userStore } from './userStore';
import { browser } from '$app/environment';
import { NOTIFICATION_TYPES } from '$lib/config/constants';

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
        
        update(state => ({ ...state, loading: true, error: null }));
        
        try {
            const notifications = await notificationService.getUserNotifications(userId);
            const unreadCount = notifications.filter(n => !n.isRead).length;
            
            update(state => ({
                ...state,
                notifications,
                unreadCount,
                loading: false
            }));
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            
            // Don't show error to user if it's just that the collection doesn't exist
            const isCollectionNotFoundError = 
                error?.code === 404 || 
                (error?.message && error.message.includes('collection doesn\'t exist'));
                
            update(state => ({
                ...state,
                loading: false,
                // Only set error if it's not a collection not found error
                error: isCollectionNotFoundError ? null : 'Failed to load notifications'
            }));
            
            // Don't stop polling on error - we'll try again next interval
        }
    }
    
    return {
        subscribe,
        
        /**
         * Initialize the notification store
         */
        init: (id: string) => {
            userId = id;
            
            // Reset store state
            update(state => ({
                ...state,
                notifications: [],
                unreadCount: 0,
                loading: false,
                error: null
            }));
            
            // Start polling for notifications
            startPolling();
            
            return () => {
                stopPolling();
            };
        },
        
        /**
         * Clear the notification store
         */
        clear: () => {
            userId = null;
            stopPolling();
            set(initialState);
        },
        
        /**
         * Mark a notification as read
         */
        markAsRead: async (notificationId: string) => {
            try {
                await notificationService.markAsRead(notificationId);
                
                // Update the store
                update(state => {
                    const updatedNotifications = state.notifications.map(n => 
                        n.$id === notificationId ? { ...n, isRead: true } : n
                    );
                    
                    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
                    
                    return {
                        ...state,
                        notifications: updatedNotifications,
                        unreadCount
                    };
                });
            } catch (error: any) {
                console.error('Error marking notification as read:', error);
                // Still update the UI optimistically
                update(state => {
                    const updatedNotifications = state.notifications.map(n => 
                        n.$id === notificationId ? { ...n, isRead: true } : n
                    );
                    
                    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
                    
                    return {
                        ...state,
                        notifications: updatedNotifications,
                        unreadCount
                    };
                });
            }
        },
        
        /**
         * Mark all notifications as read
         */
        markAllAsRead: async (userId: string) => {
            try {
                await notificationService.markAllAsRead(userId);
                
                // Update the store
                update(state => ({
                    ...state,
                    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                    unreadCount: 0
                }));
            } catch (error: any) {
                console.error('Error marking all notifications as read:', error);
                // Still update the UI optimistically
                update(state => ({
                    ...state,
                    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                    unreadCount: 0
                }));
            }
        },
        
        /**
         * Delete a notification
         */
        deleteNotification: async (notificationId: string) => {
            try {
                await notificationService.deleteNotification(notificationId);
                
                // Update the store
                update(state => {
                    const updatedNotifications = state.notifications.filter(n => n.$id !== notificationId);
                    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
                    
                    return {
                        ...state,
                        notifications: updatedNotifications,
                        unreadCount
                    };
                });
            } catch (error: any) {
                console.error('Error deleting notification:', error);
                // Still update the UI optimistically
                update(state => {
                    const updatedNotifications = state.notifications.filter(n => n.$id !== notificationId);
                    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
                    
                    return {
                        ...state,
                        notifications: updatedNotifications,
                        unreadCount
                    };
                });
            }
        },
        
        /**
         * Create a notification
         */
        createNotification: async (params: {
            title: string;
            message: string;
            type: keyof typeof NOTIFICATION_TYPES;
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