import { writable } from 'svelte/store';
import type { Notification } from '$lib/types';
import { notificationService } from '$lib/services/notification';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
}

function createNotificationStore() {
    const { subscribe, set, update } = writable<NotificationState>({
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null
    });

    return {
        subscribe,
        
        // Initialize notifications for a user
        async init(userId: string) {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const [notifications, unreadCount] = await Promise.all([
                    notificationService.listNotifications(userId, { limit: 50 }),
                    notificationService.getUnreadCount(userId)
                ]);
                
                set({
                    notifications,
                    unreadCount,
                    loading: false,
                    error: null
                });
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: 'Failed to load notifications'
                }));
            }
        },

        // Add a new notification
        addNotification(notification: Notification) {
            update(state => ({
                ...state,
                notifications: [notification, ...state.notifications],
                unreadCount: notification.status === 'unread'
                    ? state.unreadCount + 1
                    : state.unreadCount
            }));
        },

        // Mark a notification as read
        async markAsRead(notificationId: string) {
            try {
                const updatedNotification = await notificationService.markAsRead(notificationId);
                update(state => ({
                    ...state,
                    notifications: state.notifications.map(n =>
                        n.$id === notificationId ? updatedNotification : n
                    ),
                    unreadCount: state.unreadCount - 1
                }));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },

        // Mark all notifications as read
        async markAllAsRead(userId: string) {
            try {
                await notificationService.markAllAsRead(userId);
                update(state => ({
                    ...state,
                    notifications: state.notifications.map(n => ({
                        ...n,
                        status: 'read'
                    })),
                    unreadCount: 0
                }));
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
            }
        },

        // Delete a notification
        async deleteNotification(notificationId: string) {
            try {
                await notificationService.deleteNotification(notificationId);
                update(state => ({
                    ...state,
                    notifications: state.notifications.filter(n => n.$id !== notificationId),
                    unreadCount: state.notifications.find(n => n.$id === notificationId)?.status === 'unread'
                        ? state.unreadCount - 1
                        : state.unreadCount
                }));
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        },

        // Clear all notifications
        clear() {
            set({
                notifications: [],
                unreadCount: 0,
                loading: false,
                error: null
            });
        }
    };
}

export const notificationStore = createNotificationStore(); 