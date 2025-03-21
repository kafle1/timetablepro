import { Query } from 'appwrite';
import { databases, DB_CONFIG } from './appwrite';

/**
 * Utility to check if we can connect to Appwrite and access our database
 */
export async function checkAppwriteConnection() {
    try {
        console.log('Checking Appwrite database connection...');
        
        // Test connection by trying to list documents in a collection
        await databases.listDocuments(
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.USERS,
            [Query.limit(1)]
        );
        
        console.log('✅ Successfully connected to Appwrite database');
        return true;
    } catch (error: any) {
        if (error.code === 404) {
            console.error('❌ Database or collection not found. You need to create the database and collections in the Appwrite console.');
            console.log('Go to your Appwrite console and:');
            console.log('1. Create a database with ID:', DB_CONFIG.databaseId);
            console.log('2. Create the following collections with these IDs:');
            Object.entries(DB_CONFIG.collections).forEach(([key, id]) => {
                console.log(`   - ${key}: ${id}`);
            });
        } else {
            console.error('❌ Error connecting to Appwrite:', error.message || error);
        }
        return false;
    }
}

/**
 * Utility to display Appwrite configuration
 */
export function displayAppwriteConfig() {
    console.log('Current Appwrite Configuration:');
    console.log(`Database ID: ${DB_CONFIG.databaseId}`);
    console.log('Collection IDs:');
    
    Object.entries(DB_CONFIG.collections).forEach(([key, id]) => {
        console.log(`- ${key}: ${id}`);
    });
    
    console.log('\nEnvironment Variables Required:');
    console.log('VITE_APPWRITE_ENDPOINT - Your Appwrite API endpoint');
    console.log('VITE_APPWRITE_PROJECT_ID - Your Appwrite project ID');
    console.log('VITE_APPWRITE_DATABASE_ID - Your database ID (default: timetablepro)');
    console.log('VITE_APPWRITE_USERS_COLLECTION_ID - Your users collection ID (default: users)');
    console.log('VITE_APPWRITE_ROOMS_COLLECTION_ID - Your rooms collection ID (default: rooms)');
    console.log('VITE_APPWRITE_SCHEDULES_COLLECTION_ID - Your schedules collection ID (default: schedules)');
    console.log('VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID - Your notifications collection ID (default: notifications)');
    console.log('VITE_APPWRITE_TEACHER_AVAILABILITY_COLLECTION_ID - Your teacher availability collection ID (default: teacher_availability)');
}

/**
 * Create help text for Appwrite setup
 */
export function getAppwriteSetupInstructions(): string {
    return `
# Appwrite Setup Instructions

To set up your Appwrite backend for TimeTablePro:

## 1. Create a Project

1. Go to your Appwrite Console (https://cloud.appwrite.io or your self-hosted instance)
2. Create a new project named "TimeTablePro"
3. Copy the Project ID - you'll need it for your environment variables

## 2. Create a Database

1. Go to Databases in your Appwrite Console
2. Create a new database named "TimeTablePro"
3. Set the Database ID to "${DB_CONFIG.databaseId}" (or update your .env file if you use a different ID)

## 3. Create Collections

Create the following collections with these exact IDs:

${Object.entries(DB_CONFIG.collections).map(([key, id]) => 
    `- ${key}: "${id}"`
).join('\n')}

## 4. Define Collection Attributes

For each collection, create the required attributes:

### Users Collection
- userId (string, required)
- email (string, required)
- name (string, required)
- role (string, required)
- isActive (boolean, required)
- preferences (string, optional)

### Rooms Collection
- roomName (string, required)
- capacity (integer, required)
- building (string, required)
- floor (integer, required)
- features (string array, optional)
- isActive (boolean, required)

### Schedules Collection
- className (string, required)
- subject (string, required)
- teacherId (string, required)
- roomId (string, required)
- startTime (string, required)
- endTime (string, required)
- duration (integer, required)
- dayOfWeek (string, required)
- recurrence (string, required)
- conflictStatus (string, optional)

### Notifications Collection
- userId (string, required)
- title (string, required)
- message (string, required)
- type (string, required)
- isRead (boolean, required)
- relatedEntityId (string, optional)
- relatedEntityType (string, optional)

### Teacher Availability Collection
- teacherId (string, required)
- dayOfWeek (string, required)
- startTime (string, required)
- endTime (string, required)
- isAvailable (boolean, required)
- note (string, optional)

## 5. Set Collection Permissions

For each collection, set appropriate permissions:
- Read: Any (if you want public data) or Users (for authenticated access only)
- Create/Update/Delete: Users

## 6. Configure Your Environment Variables

Create or update your .env file with:

\`\`\`
VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1" # or your self-hosted URL
VITE_APPWRITE_PROJECT_ID="your-project-id"
VITE_APPWRITE_DATABASE_ID="${DB_CONFIG.databaseId}"
VITE_APPWRITE_USERS_COLLECTION_ID="${DB_CONFIG.collections.USERS}"
VITE_APPWRITE_ROOMS_COLLECTION_ID="${DB_CONFIG.collections.ROOMS}"
VITE_APPWRITE_SCHEDULES_COLLECTION_ID="${DB_CONFIG.collections.SCHEDULES}"
VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID="${DB_CONFIG.collections.NOTIFICATIONS}"
VITE_APPWRITE_TEACHER_AVAILABILITY_COLLECTION_ID="${DB_CONFIG.collections.TEACHER_AVAILABILITY}"
\`\`\`
`;
} 