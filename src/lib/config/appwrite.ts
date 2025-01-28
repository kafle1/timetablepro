import { Client, Account, Databases, Storage, Teams, ID } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint(process.env.PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.PUBLIC_APPWRITE_PROJECT_ID || '');

// Initialize services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);
export { ID };

// Appwrite configuration constants
export const appwriteConfig = {
    databaseId: 'timetable',
    collections: {
        users: 'users',
        rooms: 'rooms',
        schedules: 'schedules',
        availability: 'availability'
    },
    buckets: {
        avatars: 'avatars'
    }
}; 