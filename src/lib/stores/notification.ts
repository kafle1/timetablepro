import { writable, get } from 'svelte/store';
import { databases } from '$lib/config/appwrite';
import { appwriteConfig } from '$lib/config/appwrite';
import type { Models } from 'appwrite';
import { Query } from 'appwrite';

export interface Notification extends Models.Document {
    user_id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface NotificationState {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
    unreadCount: number;
}

function createNotificationStore() {
    const { subscribe, set, update } = writable<NotificationState>({
        notifications: [],
        loading: false,
        error: null,
        unreadCount: 0
    });

    return {
        subscribe,
        fetchNotifications: async (userId: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.notifications,
                    [
                        Query.equal('user_id', userId),
                        Query.orderDesc('created_at')
                    ]
                );
                const notifications = response.documents as Notification[];
                const unreadCount = notifications.filter(n => !n.is_read).length;
                set({ 
                    notifications,
                    loading: false,
                    error: null,
                    unreadCount
                });
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch notifications'
                }));
                throw error;
            }
        },
        createNotification: async (notification: Omit<Notification, keyof Models.Document>) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.notifications,
                    'unique()',
                    {
                        ...notification,
                        created_at: new Date().toISOString()
                    }
                );
                update(state => ({
                    notifications: [response as Notification, ...state.notifications],
                    loading: false,
                    error: null,
                    unreadCount: state.unreadCount + 1
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to create notification'
                }));
                throw error;
            }
        },
        markAsRead: async (notificationId: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.updateDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.notifications,
                    notificationId,
                    { is_read: true }
                );
                update(state => ({
                    notifications: state.notifications.map(n => 
                        n.$id === notificationId ? { ...n, is_read: true } : n
                    ),
                    loading: false,
                    error: null,
                    unreadCount: state.unreadCount - 1
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to mark notification as read'
                }));
                throw error;
            }
        },
        markAllAsRead: async (userId: string) => {
            try {
                update((state: NotificationState) => ({ ...state, loading: true, error: null }));
                const { notifications } = get(notificationStore);
                const unreadNotifications = notifications.filter((n: Notification) => !n.is_read);
                
                await Promise.all(
                    unreadNotifications.map((notification: Notification) =>
                        databases.updateDocument(
                            appwriteConfig.databaseId,
                            appwriteConfig.collections.notifications,
                            notification.$id,
                            { is_read: true }
                        )
                    )
                );

                update((state: NotificationState) => ({
                    notifications: state.notifications.map((n: Notification) => ({ ...n, is_read: true })),
                    loading: false,
                    error: null,
                    unreadCount: 0
                }));
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
                }));
                throw error;
            }
        },
        deleteNotification: async (notificationId: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                await databases.deleteDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.notifications,
                    notificationId
                );
                update((state: NotificationState) => {
                    const notification = state.notifications.find(n => n.$id === notificationId);
                    return {
                        notifications: state.notifications.filter(n => n.$id !== notificationId),
                        loading: false,
                        error: null,
                        unreadCount: notification?.is_read ? state.unreadCount : state.unreadCount - 1
                    };
                });
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete notification'
                }));
                throw error;
            }
        }
    };
}

export const notificationStore = createNotificationStore(); 