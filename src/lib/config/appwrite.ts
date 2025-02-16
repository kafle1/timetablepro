import { Client, Account, Databases } from 'appwrite';

// Initialize Appwrite client
const createClient = () => {
    const client = new Client();
    
    try {
        const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
        const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

        if (typeof endpoint === 'string' && endpoint) {
            client.setEndpoint(endpoint);
        } else {
            client.setEndpoint('https://cloud.appwrite.io/v1');
        }

        if (typeof projectId === 'string' && projectId) {
            client.setProject(projectId);
        } else {
            client.setProject('default');
        }

        return client;
    } catch (error) {
        console.error('Error initializing Appwrite client:', error);
        // Return a client with default configuration
        client.setEndpoint('https://cloud.appwrite.io/v1');
        client.setProject('default');
        return client;
    }
};

// Create instances
const client = createClient();
export const account = new Account(client);
export const databases = new Databases(client);

// Export database configuration
export const DB_CONFIG = {
    databaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID || 'default'),
    collections: {
        USERS: 'users',
        ROOMS: 'rooms',
        SCHEDULES: 'schedules',
        NOTIFICATIONS: 'notifications',
        TEACHER_AVAILABILITY: 'teacher_availability'
    }
} as const;

export default client; 