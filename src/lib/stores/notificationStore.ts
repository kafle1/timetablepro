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
    let isCollectionMissing = false;
    
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
        
        // Set up polling only if collection exists
        if (!isCollectionMissing) {
            pollingInterval = setInterval(() => {
                fetchNotifications();
            }, intervalMs);
        }
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
        
        // Skip fetching if we already know the collection is missing
        if (isCollectionMissing) {
            update(state => ({ ...state, loading: false, error: null }));
            return;
        }
        
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
            
            // Check if it's a collection not found error
            const isCollectionNotFoundError = 
                error?.code === 404 || 
                (error?.message && (
                    error.message.includes('collection doesn\'t exist') || 
                    error.message.includes('collection not found')
                ));
                
            if (isCollectionNotFoundError) {
                isCollectionMissing = true;
                // Stop polling if collection doesn't exist
                stopPolling();
                
                // Mark in localStorage that the collection is missing
                if (browser) {
                    try {
                        localStorage.setItem('notificationsCollectionMissing', 'true');
                    } catch (e) {
                        // Ignore localStorage errors
                    }
                }
            }
            
            update(state => ({
                ...state,
                loading: false,
                // Only set error if it's not a collection not found error
                error: isCollectionNotFoundError ? null : 'Failed to load notifications'
            }));
        }
    }
    
    return {
        subscribe,
        
        /**
         * Initialize the notification store
         */
        init: (id: string) => {
            userId = id;
            
            // Start polling for notifications
            startPolling();
            
            // Return cleanup function
            return () => {
                stopPolling();
            };
        },
        
        /**
         * Clear the notification store
         */
        clear: () => {
            stopPolling();
            set(initialState);
        },
        
        /**
         * Mark a notification as read
         */
        markAsRead: async (notificationId: string) => {
            if (isCollectionMissing) return;
            
            try {
                await notificationService.markAsRead(notificationId);
                
                update(state => {
                    const updatedNotifications = state.notifications.map(n => 
                        n.$id === notificationId ? { ...n, isRead: true } : n
                    );
                    
                    return {
                        ...state,
                        notifications: updatedNotifications,
                        unreadCount: updatedNotifications.filter(n => !n.isRead).length
                    };
                });
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },
        
        /**
         * Mark all notifications as read
         */
        markAllAsRead: async (userId: string) => {
            if (isCollectionMissing) return;
            
            try {
                await notificationService.markAllAsRead(userId);
                
                update(state => ({
                    ...state,
                    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                    unreadCount: 0
                }));
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
            }
        },
        
        /**
         * Delete a notification
         */
        deleteNotification: async (notificationId: string) => {
            if (isCollectionMissing) return;
            
            try {
                await notificationService.deleteNotification(notificationId);
                
                update(state => {
                    const updatedNotifications = state.notifications.filter(n => n.$id !== notificationId);
                    
                    return {
                        ...state,
                        notifications: updatedNotifications,
                        unreadCount: updatedNotifications.filter(n => !n.isRead).length
                    };
                });
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        },
        
        /**
         * Create a notification
         */
        createNotification: async (params: any) => {
            if (isCollectionMissing) return null;
            
            try {
                const notification = await notificationService.createNotification(params);
                
                update(state => ({
                    ...state,
                    notifications: [notification, ...state.notifications],
                    unreadCount: state.unreadCount + 1
                }));
                
                return notification;
            } catch (error) {
                console.error('Error creating notification:', error);
                return null;
            }
        }
    };
}

export const notificationStore = createNotificationStore(); 