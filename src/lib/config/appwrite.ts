import { Client, Account, Databases, Storage, Teams } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);

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