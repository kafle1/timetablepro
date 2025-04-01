import { Client, Account, Databases } from 'node-appwrite';
import { env } from '$env/dynamic/private'; // Use private env vars for server

// Check for essential environment variables
if (!env.APPWRITE_ENDPOINT || !env.APPWRITE_PROJECT_ID || !env.APPWRITE_API_KEY) {
    console.error("CRITICAL: Missing required server-side Appwrite environment variables (ENDPOINT, PROJECT_ID, API_KEY).");
    // Optionally throw an error to prevent startup without config
    // throw new Error("Missing server-side Appwrite configuration.");
}

// Initialize the Node.js SDK client for server-side operations
const serverAppwriteClient = new Client()
    .setEndpoint(env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1') // Provide a default or ensure it's set
    .setProject(env.APPWRITE_PROJECT_ID || '') // Ensure it's set
    .setKey(env.APPWRITE_API_KEY || ''); // API Key is essential

// Export server-side services
export const serverAccount = new Account(serverAppwriteClient);
export const serverDatabases = new Databases(serverAppwriteClient);

export { serverAppwriteClient }; // Export client if needed elsewhere 