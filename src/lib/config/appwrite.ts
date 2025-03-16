import { Client, Account, Databases } from 'appwrite';
import { browser } from '$app/environment';

// Initialize Appwrite client
const createClient = () => {
    const client = new Client();
    
    try {
        const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
        const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

        if (!endpoint || !projectId) {
            throw new Error('Missing Appwrite configuration');
        }

        client.setEndpoint(endpoint);
        client.setProject(projectId);
        
        // Set the correct locale for browser environments
        if (browser) {
            client.setLocale('en-US');
            
            // Note: For better security, consider using a custom domain
            // to enable cookie-based sessions instead of localStorage
        }
        
        return client;
    } catch (error) {
        console.error('Error initializing Appwrite client:', error);
        throw error;
    }
};

// Create instances
const client = createClient();
export const account = new Account(client);
export const databases = new Databases(client);

// Export database configuration
export const DB_CONFIG = {
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'timetablepro',
    collections: {
        USERS: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users',
        ROOMS: import.meta.env.VITE_APPWRITE_ROOMS_COLLECTION_ID || 'rooms',
        SCHEDULES: import.meta.env.VITE_APPWRITE_SCHEDULES_COLLECTION_ID || 'schedules',
        NOTIFICATIONS: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications',
        TEACHER_AVAILABILITY: import.meta.env.VITE_APPWRITE_TEACHER_AVAILABILITY_COLLECTION_ID || 'teacher_availability'
    }
} as const;

// Validate critical configuration
const validateConfig = () => {
    if (!DB_CONFIG.databaseId) {
        console.error('Missing database ID in configuration');
    }
    
    // Log warnings for missing collection IDs
    Object.entries(DB_CONFIG.collections).forEach(([key, value]) => {
        if (!value) {
            console.warn(`Missing collection ID for ${key}, using default value`);
        }
    });
};

// Run validation in browser environment
if (browser) {
    validateConfig();
}

// Collection schemas
export const COLLECTIONS = {
    USERS: {
        databaseId: DB_CONFIG.databaseId,
        collectionId: DB_CONFIG.collections.USERS,
        attributes: {
            userId: 'userId',
            email: 'email',
            name: 'name',
            role: 'role',
            availability: 'availability'
        }
    },
    ROOMS: {
        databaseId: DB_CONFIG.databaseId,
        collectionId: DB_CONFIG.collections.ROOMS,
        attributes: {
            roomName: 'roomName',
            capacity: 'capacity',
            building: 'building',
            floor: 'floor',
            features: 'features',
            isActive: 'isActive'
        }
    },
    SCHEDULES: {
        databaseId: DB_CONFIG.databaseId,
        collectionId: DB_CONFIG.collections.SCHEDULES,
        attributes: {
            className: 'className',
            duration: 'duration',
            roomId: 'roomId',
            teacherId: 'teacherId',
            subject: 'subject',
            startTime: 'startTime',
            endTime: 'endTime',
            dayOfWeek: 'dayOfWeek',
            recurrence: 'recurrence',
            conflictStatus: 'conflictStatus'
        }
    },
    NOTIFICATIONS: {
        databaseId: DB_CONFIG.databaseId,
        collectionId: DB_CONFIG.collections.NOTIFICATIONS,
        attributes: {
            userId: 'userId',
            title: 'title',
            message: 'message',
            type: 'type',
            isRead: 'isRead'
        }
    }
};

export default client; 