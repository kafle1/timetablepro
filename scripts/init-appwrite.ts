import { Client, Databases, Storage, Teams, ID, IndexType, Permission, Role } from 'node-appwrite';
import { appwriteConfig } from '../src/lib/config/appwrite';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.PUBLIC_APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY || !process.env.PUBLIC_APPWRITE_ENDPOINT) {
    console.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

// Initialize the Appwrite client
const client = new Client();

// Configure the client
client
    .setEndpoint(process.env.PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);
const teams = new Teams(client);

async function createDatabase() {
    try {
        const database = await databases.create(
            ID.unique(),
            appwriteConfig.databaseId
        );
        console.log('Database created:', database);
        return database;
    } catch (error) {
        console.error('Error creating database:', error);
        throw error;
    }
}

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createCollections(databaseId: string) {
    try {
        // Users Collection
        const usersCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'users',
            [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users())
            ]
        );

        // Add User Fields
        await databases.createStringAttribute(databaseId, usersCollection.$id, 'name', 255, true);
        await databases.createStringAttribute(databaseId, usersCollection.$id, 'email', 255, true);
        await databases.createStringAttribute(databaseId, usersCollection.$id, 'role', 20, true);
        await databases.createStringAttribute(databaseId, usersCollection.$id, 'availability', 2048, false);

        console.log('Users collection created');

        // Rooms Collection
        const roomsCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'rooms',
            [
                Permission.read(Role.users()),
                Permission.create(Role.team('admin')),
                Permission.update(Role.team('admin')),
                Permission.delete(Role.team('admin'))
            ]
        );

        // Add Room Fields
        await databases.createStringAttribute(databaseId, roomsCollection.$id, 'roomName', 255, true);
        await databases.createIntegerAttribute(databaseId, roomsCollection.$id, 'capacity', true);
        await databases.createStringAttribute(databaseId, roomsCollection.$id, 'availability', 2048, false);

        console.log('Rooms collection created');

        // Schedules Collection
        const schedulesCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'schedules',
            [
                Permission.read(Role.users()),
                Permission.create(Role.team('admin')),
                Permission.update(Role.team('admin')),
                Permission.delete(Role.team('admin'))
            ]
        );

        // Add Schedule Fields
        await databases.createStringAttribute(databaseId, schedulesCollection.$id, 'className', 255, true);
        await databases.createStringAttribute(databaseId, schedulesCollection.$id, 'teacherId', 255, true);
        await databases.createStringAttribute(databaseId, schedulesCollection.$id, 'roomId', 255, true);
        await databases.createDatetimeAttribute(databaseId, schedulesCollection.$id, 'startTime', true);
        await databases.createIntegerAttribute(databaseId, schedulesCollection.$id, 'duration', true);
        await databases.createStringAttribute(databaseId, schedulesCollection.$id, 'conflictStatus', 20, false);

        console.log('Schedules collection created');

        // Notifications Collection
        const notificationsCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'notifications',
            [
                Permission.read(Role.users()),
                Permission.create(Role.team('admin')),
                Permission.update(Role.users())
            ]
        );

        // Add Notification Fields
        await databases.createStringAttribute(databaseId, notificationsCollection.$id, 'userId', 255, true);
        await databases.createStringAttribute(databaseId, notificationsCollection.$id, 'message', 1024, true);
        await databases.createStringAttribute(databaseId, notificationsCollection.$id, 'status', 20, true);
        await databases.createDatetimeAttribute(databaseId, notificationsCollection.$id, 'timestamp', true);

        console.log('Notifications collection created');

        // Wait for all attributes to be ready before creating indexes
        await delay(2000);

        // Create indexes
        const indexPromises = [
            // Users indexes
            databases.createIndex(databaseId, usersCollection.$id, 'email_unique', IndexType.Unique, ['email']),
            databases.createIndex(databaseId, usersCollection.$id, 'role_search', IndexType.Key, ['role']),
            
            // Schedules indexes
            databases.createIndex(databaseId, schedulesCollection.$id, 'room_time_unique', IndexType.Unique, ['roomId', 'startTime']),
            databases.createIndex(databaseId, schedulesCollection.$id, 'teacher_time_unique', IndexType.Unique, ['teacherId', 'startTime']),
            databases.createIndex(databaseId, schedulesCollection.$id, 'teacher_search', IndexType.Key, ['teacherId']),
            databases.createIndex(databaseId, schedulesCollection.$id, 'room_search', IndexType.Key, ['roomId']),
            
            // Availability indexes
            databases.createIndex(databaseId, availability.$id, 'teacher_day_unique', IndexType.Unique, ['teacherId', 'dayOfWeek']),
            databases.createIndex(databaseId, availability.$id, 'teacher_search', IndexType.Key, ['teacherId'])
        ];

        for (const promise of indexPromises) {
            await promise;
            await delay(500);
        }

        console.log('Indexes created successfully');

    } catch (error) {
        console.error('Error creating collections:', error);
        throw error;
    }
}

async function createAvatarBucket() {
    try {
        const bucket = await storage.createBucket(
            ID.unique(),
            appwriteConfig.buckets.avatars
        );
        console.log('Avatar bucket created:', bucket);
    } catch (error) {
        console.error('Error creating avatar bucket:', error);
        throw error;
    }
}

async function createAdminTeam() {
    try {
        const team = await teams.create(
            ID.unique(),
            'Administrators'
        );
        console.log('Admin team created:', team);
    } catch (error) {
        console.error('Error creating admin team:', error);
        throw error;
    }
}

async function main() {
    try {
        const database = await createDatabase();
        await createCollections(database.$id);
        await createAvatarBucket();
        await createAdminTeam();
        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

main(); 