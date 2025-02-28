import { ID, Query } from 'appwrite';
import { databases, DB_CONFIG } from '$lib/config/appwrite';
import type { Notification } from '$lib/types';
import { NOTIFICATION_TYPES } from '$lib/config/constants';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: keyof typeof NOTIFICATION_TYPES;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface UpdateNotificationParams {
  isRead?: boolean;
  title?: string;
  message?: string;
}

export interface NotificationFilters {
  userId?: string;
  isRead?: boolean;
  type?: keyof typeof NOTIFICATION_TYPES;
  fromDate?: string;
  toDate?: string;
}

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    try {
      const { userId, title, message, type, relatedEntityId, relatedEntityType } = params;
      
      const notificationData = {
        userId,
        title,
        message,
        type,
        isRead: false,
        relatedEntityId: relatedEntityId || '',
        relatedEntityType: relatedEntityType || '',
      };
      
      const response = await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.NOTIFICATIONS,
        ID.unique(),
        notificationData
      );
      
      return response as unknown as Notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Update a notification
   */
  async updateNotification(notificationId: string, params: UpdateNotificationParams): Promise<Notification> {
    try {
      const response = await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.NOTIFICATIONS,
        notificationId,
        params
      );
      
      return response as unknown as Notification;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }
  
  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.NOTIFICATIONS,
        notificationId
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
  
  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      return await this.updateNotification(notificationId, { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      // Get all unread notifications for the user
      const unreadNotifications = await this.getUserNotifications(userId, { isRead: false });
      
      // Mark each notification as read
      const promises = unreadNotifications.map(notification => 
        this.markAsRead(notification.$id)
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Get a notification by ID
   */
  async getNotification(notificationId: string): Promise<Notification> {
    try {
      const response = await databases.getDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.NOTIFICATIONS,
        notificationId
      );
      
      return response as unknown as Notification;
    } catch (error) {
      console.error('Error getting notification:', error);
      throw error;
    }
  }
  
  /**
   * Get notifications for a user with optional filters
   */
  async getUserNotifications(userId: string, filters?: Omit<NotificationFilters, 'userId'>): Promise<Notification[]> {
    try {
      let queries = [Query.equal('userId', userId)];
      
      if (filters) {
        if (filters.isRead !== undefined) {
          queries.push(Query.equal('isRead', filters.isRead));
        }
        
        if (filters.type) {
          queries.push(Query.equal('type', filters.type));
        }
        
        if (filters.fromDate) {
          queries.push(Query.greaterThanEqual('$createdAt', filters.fromDate));
        }
        
        if (filters.toDate) {
          queries.push(Query.lessThanEqual('$createdAt', filters.toDate));
        }
      }
      
      // Sort by creation date, newest first
      queries.push(Query.orderDesc('$createdAt'));
      
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.NOTIFICATIONS,
        queries
      );
      
      return response.documents as unknown as Notification[];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }
  
  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.NOTIFICATIONS,
        [
          Query.equal('userId', userId),
          Query.equal('isRead', false)
        ]
      );
      
      return response.total;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
  
  /**
   * Create a schedule change notification
   */
  async createScheduleChangeNotification(
    userId: string,
    className: string,
    action: 'created' | 'updated' | 'deleted',
    scheduleId?: string
  ): Promise<Notification> {
    try {
      const title = `Schedule ${action}`;
      const message = `The schedule for "${className}" has been ${action}.`;
      
      // Map the action to the corresponding notification type
      let notificationType: keyof typeof NOTIFICATION_TYPES;
      if (action === 'created') {
        notificationType = 'SCHEDULE_CREATED';
      } else if (action === 'updated') {
        notificationType = 'SCHEDULE_UPDATED';
      } else {
        notificationType = 'SCHEDULE_DELETED';
      }
      
      return await this.createNotification({
        userId,
        title,
        message,
        type: notificationType,
        relatedEntityId: scheduleId,
        relatedEntityType: 'schedule'
      });
    } catch (error) {
      console.error('Error creating schedule change notification:', error);
      throw error;
    }
  }
  
  /**
   * Create a conflict notification
   */
  async createConflictNotification(
    userId: string,
    className: string,
    message: string,
    scheduleId?: string
  ): Promise<Notification> {
    try {
      const title = 'Schedule Conflict';
      
      return await this.createNotification({
        userId,
        title,
        message,
        type: 'CONFLICT_DETECTED',
        relatedEntityId: scheduleId,
        relatedEntityType: 'schedule'
      });
    } catch (error) {
      console.error('Error creating conflict notification:', error);
      throw error;
    }
  }
  
  /**
   * Create a system notification
   */
  async createSystemNotification(
    userId: string,
    title: string,
    message: string
  ): Promise<Notification> {
    try {
      return await this.createNotification({
        userId,
        title,
        message,
        type: 'SYSTEM_NOTIFICATION'
      });
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService(); 