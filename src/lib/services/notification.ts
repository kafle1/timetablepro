import { databases } from '$lib/config/appwrite';
import { ID, Query } from 'appwrite';
import type { Notification } from '$lib/types';
import { handleAppwriteError } from '$lib/utils/error';
import type { Room, User } from '$lib/types';
import { NOTIFICATION_TYPES } from '$lib/config/constants';

export class NotificationService {
    async createNotification(
        userId: string,
        message: string
    ): Promise<Notification> {
        try {
            const notification = await databases.createDocument(
                'timetablepro',
                'notifications',
                ID.unique(),
                {
                    userId,
                    message,
                    status: 'unread',
                    timestamp: new Date().toISOString()
                }
            );

            return notification as Notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async markAsRead(notificationId: string): Promise<Notification> {
        try {
            const updatedNotification = await databases.updateDocument(
                'timetablepro',
                'notifications',
                notificationId,
                {
                    status: 'read'
                }
            );

            return updatedNotification as Notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    async deleteNotification(notificationId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                'timetablepro',
                'notifications',
                notificationId
            );
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    async getNotification(notificationId: string): Promise<Notification | null> {
        try {
            const notification = await databases.getDocument(
                'timetablepro',
                'notifications',
                notificationId
            );
            return notification as Notification;
        } catch (error) {
            console.error('Error fetching notification:', error);
            return null;
        }
    }

    async listNotifications(
        userId: string,
        filters: {
            status?: 'read' | 'unread';
            limit?: number;
        } = {}
    ): Promise<Notification[]> {
        try {
            const queries: string[] = [
                Query.equal('userId', userId),
                Query.orderDesc('timestamp')
            ];

            if (filters.status) {
                queries.push(Query.equal('status', filters.status));
            }

            if (filters.limit) {
                queries.push(Query.limit(filters.limit));
            }

            const response = await databases.listDocuments(
                'timetablepro',
                'notifications',
                queries
            );

            return response.documents as Notification[];
        } catch (error) {
            console.error('Error listing notifications:', error);
            throw error;
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        try {
            const response = await databases.listDocuments(
                'timetablepro',
                'notifications',
                [
                    Query.equal('userId', userId),
                    Query.equal('status', 'unread')
                ]
            );

            return response.total;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }

    async markAllAsRead(userId: string): Promise<void> {
        try {
            const unreadNotifications = await this.listNotifications(userId, { status: 'unread' });
            
            // Update all unread notifications to read
            await Promise.all(
                unreadNotifications.map(notification =>
                    this.markAsRead(notification.$id)
                )
            );
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    async createScheduleChangeNotification(
        userId: string,
        className: string,
        changeType: 'created' | 'updated' | 'deleted',
        details?: string
    ): Promise<Notification> {
        const message = `Class "${className}" has been ${changeType}${details ? `: ${details}` : '.'}`;
        return this.createNotification(userId, message);
    }

    async createConflictNotification(
        userId: string,
        className: string,
        conflictType: string
    ): Promise<Notification> {
        const message = `Scheduling conflict detected for class "${className}": ${conflictType}`;
        return this.createNotification(userId, message);
    }
}

export const notificationService = new NotificationService();

export async function createRoomNotification(room: Room, action: 'created' | 'updated' | 'deleted') {
    try {
        const message = `Room ${room.name} has been ${action}`;
        await databases.createDocument(
            databases.databaseId,
            'notifications',
            'unique()',
            {
                title: 'Room Update',
                message,
                type: NOTIFICATION_TYPES.INFO,
                isRead: false,
                createdAt: new Date().toISOString()
            }
        );
    } catch (error) {
        throw handleAppwriteError(error);
    }
}

export async function createTeacherNotification(teacher: User, action: 'created' | 'updated' | 'deleted') {
    try {
        const message = `Teacher ${teacher.name} has been ${action}`;
        await databases.createDocument(
            databases.databaseId,
            'notifications',
            'unique()',
            {
                title: 'Teacher Update',
                message,
                type: NOTIFICATION_TYPES.INFO,
                isRead: false,
                createdAt: new Date().toISOString()
            }
        );
    } catch (error) {
        throw handleAppwriteError(error);
    }
} 