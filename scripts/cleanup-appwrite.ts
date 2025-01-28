import { Client, Databases, Storage, Teams } from 'node-appwrite';

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

async function cleanupStorage() {
    try {
        const { buckets } = await storage.listBuckets();
        console.log('Found buckets:', buckets.length);
        
        for (const bucket of buckets) {
            console.log(`Deleting bucket: ${bucket.name} (${bucket.$id})`);
            await storage.deleteBucket(bucket.$id);
        }
        console.log('All buckets deleted');
    } catch (error) {
        console.error('Error cleaning up storage:', error);
    }
}

async function cleanupTeams() {
    try {
        const { teams: teamsList } = await teams.list();
        console.log('Found teams:', teamsList.length);
        
        for (const team of teamsList) {
            console.log(`Deleting team: ${team.name} (${team.$id})`);
            await teams.delete(team.$id);
        }
        console.log('All teams deleted');
    } catch (error) {
        console.error('Error cleaning up teams:', error);
    }
}

async function main() {
    try {
        console.log('Starting cleanup...');
        await cleanupDatabases();
        await cleanupStorage();
        await cleanupTeams();
        console.log('Cleanup completed successfully');
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

main(); 