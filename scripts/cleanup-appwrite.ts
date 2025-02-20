import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.VITE_APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY || !process.env.VITE_APPWRITE_ENDPOINT) {
    console.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

// Initialize the Appwrite client
const client = new Client();

// Configure the client
client
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function cleanupDatabases() {
    try {
        const { databases: dbList } = await databases.list();
        console.log('Found databases:', dbList.length);
        
        for (const db of dbList) {
            console.log(`Deleting database: ${db.name} (${db.$id})`);
            await databases.delete(db.$id);
        }
        console.log('All databases deleted');
    } catch (error) {
        console.error('Error cleaning up databases:', error);
    }
}

async function main() {
    try {
        console.log('Starting cleanup...');
        await cleanupDatabases();
        console.log('Cleanup completed successfully');
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

main(); 