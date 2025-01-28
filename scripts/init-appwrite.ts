import { Client, Databases, Storage, Teams, ID, IndexType } from 'node-appwrite';
import { appwriteConfig } from '../src/lib/config/appwrite';

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
        const users = await databases.createCollection(
            databaseId,
            ID.unique(),
            appwriteConfig.collections.users
        );

        // Create user attributes
        for (const attr of [
            ['name', 'string', 255, true],
            ['email', 'email', 0, true],
            ['role', 'string', 20, true],
            ['avatarUrl', 'string', 255, false]
        ] as const) {
            if (attr[1] === 'email') {
                await databases.createEmailAttribute(databaseId, users.$id, attr[0], attr[3]);
            } else {
                await databases.createStringAttribute(
                    databaseId, 
                    users.$id, 
                    attr[0], 
                    attr[2], 
                    attr[3]
                );
            }
            await delay(500);
        }

        console.log('Users collection created');

        // Rooms Collection
        const rooms = await databases.createCollection(
            databaseId,
            ID.unique(),
            appwriteConfig.collections.rooms
        );

        // Create room attributes
        for (const attr of [
            ['name', 'string', 255],
            ['capacity', 'integer', 0],
            ['type', 'string', 50],
            ['building', 'string', 50]
        ] as const) {
            if (attr[1] === 'integer') {
                await databases.createIntegerAttribute(databaseId, rooms.$id, attr[0], true);
            } else {
                await databases.createStringAttribute(databaseId, rooms.$id, attr[0], attr[2], true);
            }
            await delay(500);
        }

        console.log('Rooms collection created');

        // Schedules Collection
        const schedules = await databases.createCollection(
            databaseId,
            ID.unique(),
            appwriteConfig.collections.schedules
        );

        // Create schedule attributes
        for (const [name, length] of [
            ['subject', 255],
            ['teacherId', 36],
            ['roomId', 36],
            ['dayOfWeek', 20],
            ['startTime', 10],
            ['endTime', 10],
            ['class', 50]
        ] as const) {
            await databases.createStringAttribute(databaseId, schedules.$id, name, length, true);
            await delay(500);
        }

        console.log('Schedules collection created');

        // Availability Collection
        const availability = await databases.createCollection(
            databaseId,
            ID.unique(),
            appwriteConfig.collections.availability
        );

        // Create availability attributes
        for (const [name, length] of [
            ['teacherId', 36],
            ['dayOfWeek', 20],
            ['availableSlots', 255]
        ] as const) {
            await databases.createStringAttribute(databaseId, availability.$id, name, length, true);
            await delay(500);
        }

        console.log('Availability collection created');

        // Wait for all attributes to be ready before creating indexes
        await delay(2000);

        // Create indexes
        const indexPromises = [
            // Users indexes
            databases.createIndex(databaseId, users.$id, 'email_unique', IndexType.Unique, ['email']),
            databases.createIndex(databaseId, users.$id, 'role_search', IndexType.Key, ['role']),
            
            // Schedules indexes
            databases.createIndex(databaseId, schedules.$id, 'room_time_unique', IndexType.Unique, ['roomId', 'dayOfWeek', 'startTime']),
            databases.createIndex(databaseId, schedules.$id, 'teacher_time_unique', IndexType.Unique, ['teacherId', 'dayOfWeek', 'startTime']),
            databases.createIndex(databaseId, schedules.$id, 'teacher_search', IndexType.Key, ['teacherId']),
            databases.createIndex(databaseId, schedules.$id, 'room_search', IndexType.Key, ['roomId']),
            
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