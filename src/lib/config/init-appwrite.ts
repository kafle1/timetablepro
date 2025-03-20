import { Client, Databases, Teams, ID } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

async function initializeAppwrite() {
    try {
        // Create database if it doesn't exist
        try {
            const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '';
            
            // Create users collection
            const usersCollectionId = 'users';
            await databases.createCollection(
                databaseId,
                usersCollectionId,
                'Users',
                ['read("any")', 'create("any")', 'update("any")', 'delete("any")']
            );

            // Create required attributes
            await databases.createStringAttribute(
                databaseId,
                usersCollectionId,
                'userId',
                255,
                true,
                undefined,
                false
            );

            await databases.createEmailAttribute(
                databaseId,
                usersCollectionId,
                'email',
                true,
                undefined,
                false
            );

            await databases.createStringAttribute(
                databaseId,
                usersCollectionId,
                'name',
                255,
                true,
                undefined,
                false
            );

            await databases.createStringAttribute(
                databaseId,
                usersCollectionId,
                'role',
                20,
                true,
                undefined,
                false
            );

            await databases.createStringAttribute(
                databaseId,
                usersCollectionId,
                'availability',
                255,
                false,
                undefined,
                true
            );

            // Create email index
            await databases.createIndex(
                databaseId,
                usersCollectionId,
                'email_idx',
                'key' as any,
                ['email']
            );

            console.log('✅ Users collection created successfully');
        } catch (error: any) {
            if (error?.code !== 409) {  // Skip if collection already exists
                console.error('Collection setup error:', error);
                throw error;
            }
        }

        console.log('✅ Appwrite initialization completed successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Appwrite:', error);
        throw error;
    }
}

export { initializeAppwrite }; 