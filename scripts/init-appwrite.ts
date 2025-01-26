import { Client, Databases, Storage, Teams, ID, Permission, Role } from 'appwrite';
import { appwriteConfig } from '../src/lib/config/appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '');

// Add API key for server-side operations
client.setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const storage = new Storage(client);
const teams = new Teams(client);

async function createDatabase() {
    try {
        const database = await databases.createDatabase(
            ID.unique(),
            appwriteConfig.databaseId,
            [Permission.read(Role.any()), Permission.write(Role.team('admin'))]
        );
        console.log('Database created:', database);
        return database;
    } catch (error) {
        console.error('Error creating database:', error);
        throw error;
    }
}

async function createCollections(databaseId: string) {
    try {
        // Users Collection
        const users = await databases.createCollection(
            databaseId,
            ID.unique(),
            appwriteConfig.collections.users,
            [
                Permission.read(Role.any()),
                Permission.write(Role.user(Role.any().toString()))
            ]
        );

        await Promise.all([
            databases.createAttribute(databaseId, users.$id, 'string', 'name', 255, true),
            databases.createAttribute(databaseId, users.$id, 'email', 'email', true),
            databases.createAttribute(databaseId, users.$id, 'string', 'role', 20, true),
            databases.createAttribute(databaseId, users.$id, 'string', 'avatarUrl', 255, false)
        ]);

        console.log('Users collection created');

        // Rooms Collection
        const rooms = await databases.createCollection(
            databaseId,
            ID.unique(),
            appwriteConfig.collections.rooms,
            [
                Permission.read(Role.any()),
                Permission.write(Role.team('admin'))
            ]
        );

        await Promise.all([
            databases.createAttribute(databaseId, rooms.$id, 'string', 'name', 255, true),
            databases.createAttribute(databaseId, rooms.$id, 'integer', 'capacity', true),
            databases.createAttribute(databaseId, rooms.$id, 'string', 'type', 50, true),
            databases.createAttribute(databaseId, rooms.$id, 'string', 'building', 50, true)
        ]);

        console.log('Rooms collection created');

        // Schedules Collection
        const schedules = await databases.createCollection(
            databaseId,
            ID.unique(),
            appwriteConfig.collections.schedules,
            [
                Permission.read(Role.any()),
                Permission.write(Role.team('admin'))
            ]
        );

        await Promise.all([
            databases.createAttribute(databaseId, schedules.$id, 'string', 'subject', 255, true),
            databases.createAttribute(databaseId, schedules.$id, 'string', 'teacherId', 36, true),
            databases.createAttribute(databaseId, schedules.$id, 'string', 'roomId', 36, true),
            databases.createAttribute(databaseId, schedules.$id, 'string', 'dayOfWeek', 20, true),
            databases.createAttribute(databaseId, schedules.$id, 'string', 'startTime', 10, true),
            databases.createAttribute(databaseId, schedules.$id, 'string', 'endTime', 10, true),
            databases.createAttribute(databaseId, schedules.$id, 'string', 'class', 50, true)
        ]);

        console.log('Schedules collection created');

        // Availability Collection
        const availability = await databases.createCollection(
            databaseId,
            ID.unique(),
            appwriteConfig.collections.availability,
            [
                Permission.read(Role.any()),
                Permission.write(Role.user(Role.any().toString()))
            ]
        );

        await Promise.all([
            databases.createAttribute(databaseId, availability.$id, 'string', 'teacherId', 36, true),
            databases.createAttribute(databaseId, availability.$id, 'string', 'dayOfWeek', 20, true),
            databases.createAttribute(databaseId, availability.$id, 'string', 'availableSlots', 255, true)
        ]);

        console.log('Availability collection created');

        // Create indexes
        await Promise.all([
            // Users indexes
            databases.createIndex(databaseId, users.$id, 'email_unique', 'unique', ['email']),
            databases.createIndex(databaseId, users.$id, 'role_search', 'key', ['role']),
            
            // Schedules indexes
            databases.createIndex(databaseId, schedules.$id, 'room_time_unique', 'unique', ['roomId', 'dayOfWeek', 'startTime']),
            databases.createIndex(databaseId, schedules.$id, 'teacher_time_unique', 'unique', ['teacherId', 'dayOfWeek', 'startTime']),
            databases.createIndex(databaseId, schedules.$id, 'teacher_search', 'key', ['teacherId']),
            databases.createIndex(databaseId, schedules.$id, 'room_search', 'key', ['roomId']),
            
            // Availability indexes
            databases.createIndex(databaseId, availability.$id, 'teacher_day_unique', 'unique', ['teacherId', 'dayOfWeek']),
            databases.createIndex(databaseId, availability.$id, 'teacher_search', 'key', ['teacherId'])
        ]);
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
            appwriteConfig.buckets.avatars,
            [
                Permission.read(Role.any()),
                Permission.write(Role.user(Role.any().toString()))
            ]
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
            'Administrators',
            [Permission.read(Role.any()), Permission.write(Role.team('admin'))]
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