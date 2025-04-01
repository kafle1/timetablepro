import { Client, Databases, Users } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || '')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

// Initialize Databases service
export const databases = new Databases(client);

// Initialize Users service
export const users = new Users(client);

// Database and collection configuration
export const DB_CONFIG = {
  databaseId: process.env.VITE_APPWRITE_DATABASE_ID || '',
  collections: {
    USERS: process.env.VITE_APPWRITE_USERS_COLLECTION_ID || '',
    ROOMS: process.env.VITE_APPWRITE_ROOMS_COLLECTION_ID || '',
    SCHEDULES: process.env.VITE_APPWRITE_SCHEDULES_COLLECTION_ID || '',
    NOTIFICATIONS: process.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || '',
    TEACHER_AVAILABILITY: process.env.VITE_APPWRITE_TEACHER_AVAILABILITY_COLLECTION_ID || ''
  }
} as const; 