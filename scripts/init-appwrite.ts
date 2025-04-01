import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Appwrite client
const client = new Client();

try {
    const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
    const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!endpoint || !projectId || !apiKey) {
        throw new Error('Missing Appwrite configuration');
    }

    client
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setKey(apiKey);
} catch (error) {
    console.error('Error initializing Appwrite client:', error);
    throw error;
}

// Create database instance
const databases = new Databases(client);

// Database and collection configuration
const DB_CONFIG = {
    databaseId: process.env.VITE_APPWRITE_DATABASE_ID || 'timetablepro',
    collections: {
        USERS: process.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users',
        ROOMS: process.env.VITE_APPWRITE_ROOMS_COLLECTION_ID || 'rooms',
        SCHEDULES: process.env.VITE_APPWRITE_SCHEDULES_COLLECTION_ID || 'schedules',
        NOTIFICATIONS: process.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || 'notifications',
        TEACHER_AVAILABILITY: process.env.VITE_APPWRITE_TEACHER_AVAILABILITY_COLLECTION_ID || 'teacher_availability'
    }
};

async function initializeDatabase() {
    try {
        // Create Users collection
        try {
            await databases.createCollection(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.USERS,
                'Users',
                [Permission.read(Role.member())]
            );
            
            // Add attributes
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.USERS, 'userId', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.USERS, 'email', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.USERS, 'name', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.USERS, 'role', 255, true);
            await databases.createBooleanAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.USERS, 'isActive', true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.USERS, 'subject', 255, false);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.USERS, 'preferences', 255, false);

            console.log('Users collection created successfully');
        } catch (error: any) {
            if (error.code !== 409) {
                throw error;
            }
            console.log('Users collection already exists');
        }

        // Create Rooms collection
        try {
            await databases.createCollection(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.ROOMS,
                'Rooms'
            );
            
            // Add attributes
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.ROOMS, 'name', 255, true);
            await databases.createIntegerAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.ROOMS, 'capacity', true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.ROOMS, 'type', 255, true);
            await databases.createBooleanAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.ROOMS, 'isActive', true);

            console.log('Rooms collection created successfully');
        } catch (error: any) {
            if (error.code !== 409) {
                throw error;
            }
            console.log('Rooms collection already exists');
        }

        // Create Schedules collection
        try {
            await databases.createCollection(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.SCHEDULES,
                'Schedules'
            );
            
            // Add attributes
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, 'className', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, 'subject', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, 'teacherId', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, 'roomId', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, 'startTime', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, 'endTime', 255, true);
            await databases.createIntegerAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, 'duration', true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, 'dayOfWeek', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, 'recurrence', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, 'conflictStatus', 255, false);

            console.log('Schedules collection created successfully');
        } catch (error: any) {
            if (error.code !== 409) {
                throw error;
            }
            console.log('Schedules collection already exists');
        }

        // Create Teacher Availability collection
        try {
            await databases.createCollection(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.TEACHER_AVAILABILITY,
                'Teacher Availability'
            );
            
            // Add attributes
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.TEACHER_AVAILABILITY, 'teacherId', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.TEACHER_AVAILABILITY, 'dayOfWeek', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.TEACHER_AVAILABILITY, 'startTime', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.TEACHER_AVAILABILITY, 'endTime', 255, true);
            await databases.createBooleanAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.TEACHER_AVAILABILITY, 'isAvailable', true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.TEACHER_AVAILABILITY, 'note', 1000, false);

            console.log('Teacher Availability collection created successfully');
        } catch (error: any) {
            if (error.code !== 409) {
                throw error;
            }
            console.log('Teacher Availability collection already exists');
        }

        // Create Notifications collection
        try {
            await databases.createCollection(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.NOTIFICATIONS,
                'Notifications'
            );
            
            // Add attributes
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.NOTIFICATIONS, 'userId', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.NOTIFICATIONS, 'title', 255, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.NOTIFICATIONS, 'message', 1000, true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.NOTIFICATIONS, 'type', 255, true);
            await databases.createBooleanAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.NOTIFICATIONS, 'isRead', true);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.NOTIFICATIONS, 'relatedEntityId', 255, false);
            await databases.createStringAttribute(DB_CONFIG.databaseId, DB_CONFIG.collections.NOTIFICATIONS, 'relatedEntityType', 255, false);

            console.log('Notifications collection created successfully');
        } catch (error: any) {
            if (error.code !== 409) {
                throw error;
            }
            console.log('Notifications collection already exists');
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Run initialization
initializeDatabase().catch(console.error); 