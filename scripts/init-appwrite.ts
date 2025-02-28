import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function initializeAppwrite() {
    try {
        console.log('Starting Appwrite initialization...');
        
        // Create database if it doesn't exist
        const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || 'timetablepro';
        
        try {
            await databases.create(databaseId, 'TimetablePro');
            console.log(`✅ Database '${databaseId}' created successfully`);
        } catch (error: any) {
            if (error?.code !== 409) {
                console.error('Database creation error:', error);
                throw error;
            } else {
                console.log(`ℹ️ Database '${databaseId}' already exists`);
            }
        }

        // Create users collection
        await createCollection(databaseId, 'users', 'Users');
        await createStringAttribute(databaseId, 'users', 'userId', 255, true);
        await createEmailAttribute(databaseId, 'users', 'email', true);
        await createStringAttribute(databaseId, 'users', 'name', 255, true);
        await createStringAttribute(databaseId, 'users', 'role', 20, true);
        await createStringAttribute(databaseId, 'users', 'availability', 10000, false, null, true);
        await createIndex(databaseId, 'users', 'email_idx', 'key', ['email']);
        
        // Create rooms collection
        await createCollection(databaseId, 'rooms', 'Rooms');
        await createStringAttribute(databaseId, 'rooms', 'roomName', 255, true);
        await createIntegerAttribute(databaseId, 'rooms', 'capacity', true);
        await createStringAttribute(databaseId, 'rooms', 'building', 255, true);
        await createIntegerAttribute(databaseId, 'rooms', 'floor', true);
        await createStringAttribute(databaseId, 'rooms', 'features', 10000, false, null, true);
        await createBooleanAttribute(databaseId, 'rooms', 'isActive', true);
        
        // Create schedules collection
        await createCollection(databaseId, 'schedules', 'Schedules');
        await createStringAttribute(databaseId, 'schedules', 'className', 255, true);
        await createIntegerAttribute(databaseId, 'schedules', 'duration', true);
        await createStringAttribute(databaseId, 'schedules', 'roomId', 255, true);
        await createStringAttribute(databaseId, 'schedules', 'teacherId', 255, true);
        await createStringAttribute(databaseId, 'schedules', 'subject', 255, true);
        await createStringAttribute(databaseId, 'schedules', 'startTime', 255, true);
        await createStringAttribute(databaseId, 'schedules', 'endTime', 255, true);
        await createStringAttribute(databaseId, 'schedules', 'dayOfWeek', 20, true);
        await createStringAttribute(databaseId, 'schedules', 'recurrence', 20, true);
        await createStringAttribute(databaseId, 'schedules', 'conflictStatus', 20, false);
        await createIndex(databaseId, 'schedules', 'room_idx', 'key', ['roomId']);
        await createIndex(databaseId, 'schedules', 'teacher_idx', 'key', ['teacherId']);
        
        // Create notifications collection
        await createCollection(databaseId, 'notifications', 'Notifications');
        await createStringAttribute(databaseId, 'notifications', 'userId', 255, true);
        await createStringAttribute(databaseId, 'notifications', 'title', 255, true);
        await createStringAttribute(databaseId, 'notifications', 'message', 1000, true);
        await createStringAttribute(databaseId, 'notifications', 'type', 20, true);
        await createBooleanAttribute(databaseId, 'notifications', 'isRead', true);
        await createIndex(databaseId, 'notifications', 'user_idx', 'key', ['userId']);

        console.log('✅ Appwrite initialization completed successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Appwrite:', error);
        throw error;
    }
}

// Helper functions
async function createCollection(databaseId: string, collectionId: string, name: string) {
    try {
        await databases.createCollection(
            databaseId,
            collectionId,
            name,
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );
        console.log(`✅ Collection '${collectionId}' created successfully`);
    } catch (error: any) {
        if (error?.code !== 409) {
            console.error(`Collection '${collectionId}' creation error:`, error);
            throw error;
        } else {
            console.log(`ℹ️ Collection '${collectionId}' already exists`);
        }
    }
}

async function createStringAttribute(
    databaseId: string,
    collectionId: string,
    key: string,
    size: number,
    required: boolean,
    defaultValue: string | null = null,
    array: boolean = false
) {
    try {
        await databases.createStringAttribute(
            databaseId,
            collectionId,
            key,
            size,
            required,
            defaultValue,
            array
        );
        console.log(`✅ String attribute '${key}' created successfully in '${collectionId}'`);
    } catch (error: any) {
        if (error?.code !== 409) {
            console.error(`Attribute '${key}' creation error:`, error);
            throw error;
        } else {
            console.log(`ℹ️ Attribute '${key}' already exists in '${collectionId}'`);
        }
    }
}

async function createEmailAttribute(
    databaseId: string,
    collectionId: string,
    key: string,
    required: boolean,
    defaultValue: string | null = null,
    array: boolean = false
) {
    try {
        await databases.createEmailAttribute(
            databaseId,
            collectionId,
            key,
            required,
            defaultValue,
            array
        );
        console.log(`✅ Email attribute '${key}' created successfully in '${collectionId}'`);
    } catch (error: any) {
        if (error?.code !== 409) {
            console.error(`Attribute '${key}' creation error:`, error);
            throw error;
        } else {
            console.log(`ℹ️ Attribute '${key}' already exists in '${collectionId}'`);
        }
    }
}

async function createIntegerAttribute(
    databaseId: string,
    collectionId: string,
    key: string,
    required: boolean,
    min: number | null = null,
    max: number | null = null,
    defaultValue: number | null = null,
    array: boolean = false
) {
    try {
        await databases.createIntegerAttribute(
            databaseId,
            collectionId,
            key,
            required,
            min,
            max,
            defaultValue,
            array
        );
        console.log(`✅ Integer attribute '${key}' created successfully in '${collectionId}'`);
    } catch (error: any) {
        if (error?.code !== 409) {
            console.error(`Attribute '${key}' creation error:`, error);
            throw error;
        } else {
            console.log(`ℹ️ Attribute '${key}' already exists in '${collectionId}'`);
        }
    }
}

async function createBooleanAttribute(
    databaseId: string,
    collectionId: string,
    key: string,
    required: boolean,
    defaultValue: boolean | null = null,
    array: boolean = false
) {
    try {
        await databases.createBooleanAttribute(
            databaseId,
            collectionId,
            key,
            required,
            defaultValue,
            array
        );
        console.log(`✅ Boolean attribute '${key}' created successfully in '${collectionId}'`);
    } catch (error: any) {
        if (error?.code !== 409) {
            console.error(`Attribute '${key}' creation error:`, error);
            throw error;
        } else {
            console.log(`ℹ️ Attribute '${key}' already exists in '${collectionId}'`);
        }
    }
}

async function createIndex(
    databaseId: string,
    collectionId: string,
    key: string,
    type: string,
    attributes: string[]
) {
    try {
        await databases.createIndex(
            databaseId,
            collectionId,
            key,
            type,
            attributes
        );
        console.log(`✅ Index '${key}' created successfully in '${collectionId}'`);
    } catch (error: any) {
        if (error?.code !== 409) {
            console.error(`Index '${key}' creation error:`, error);
            throw error;
        } else {
            console.log(`ℹ️ Index '${key}' already exists in '${collectionId}'`);
        }
    }
}

// Run the initialization
initializeAppwrite()
    .then(() => {
        console.log('Initialization completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Initialization failed:', error);
        process.exit(1);
    }); 