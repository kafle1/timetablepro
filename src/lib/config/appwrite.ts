import { Client, Account, Databases } from 'appwrite';

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
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    collections: {
        USERS: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users',
        ROOMS: import.meta.env.VITE_APPWRITE_ROOMS_COLLECTION_ID || 'rooms',
        SCHEDULES: import.meta.env.VITE_APPWRITE_SCHEDULES_COLLECTION_ID || 'schedules',
        NOTIFICATIONS: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications',
        TEACHER_AVAILABILITY: import.meta.env.VITE_APPWRITE_TEACHER_AVAILABILITY_COLLECTION_ID || 'teacher_availability'
    }
} as const;

export default client; 