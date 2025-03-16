import { ID, Client, Databases, Account, Users, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Appwrite client
const client = new Client();
client
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || '')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const account = new Account(client);
const users = new Users(client);

// Database and collection IDs
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || 'timetablepro';
const usersCollectionId = process.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users';

// Test user credentials
const testUsers = [
    {
        email: 'admin@timetablepro.com',
        password: 'Admin@123',
        name: 'Admin User',
        role: 'ADMIN'
    },
    {
        email: 'teacher@timetablepro.com',
        password: 'Teacher@123',
        name: 'Teacher User',
        role: 'TEACHER'
    },
    {
        email: 'student@timetablepro.com',
        password: 'Student@123',
        name: 'Student User',
        role: 'STUDENT'
    }
];

async function createTestUsers() {
    console.log('Creating test users...');
    
    for (const user of testUsers) {
        try {
            // Check if user already exists in database
            let userId = '';
            let userExists = false;
            
            try {
                const existingUsers = await databases.listDocuments(
                    databaseId,
                    usersCollectionId,
                    [
                        Query.equal('email', user.email)
                    ]
                );
                
                if (existingUsers.documents.length > 0) {
                    console.log(`User ${user.email} already exists in database.`);
                    userExists = true;
                    userId = existingUsers.documents[0].userId;
                }
            } catch (error) {
                console.error('Error checking existing user in database:', error);
            }
            
            if (!userExists) {
                // Try to get user from auth
                try {
                    const userList = await users.list([
                        Query.equal('email', user.email)
                    ]);
                    
                    if (userList.total > 0) {
                        userId = userList.users[0].$id;
                        console.log(`User ${user.email} exists in auth but not in database.`);
                    }
                } catch (error) {
                    console.log(`Error checking if user ${user.email} exists in auth:`, error);
                }
                
                // If user doesn't exist in auth, create it
                if (!userId) {
                    try {
                        userId = ID.unique();
                        await users.create(
                            userId,
                            user.email,
                            user.password,
                            user.name
                        );
                        console.log(`Created user ${user.email} in auth.`);
                    } catch (error) {
                        console.error(`Error creating user ${user.email} in auth:`, error);
                        continue;
                    }
                }
                
                // Create user document in database
                try {
                    // Only include fields that are defined in the schema
                    const userData = {
                        userId,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    };
                    
                    await databases.createDocument(
                        databaseId,
                        usersCollectionId,
                        userId,
                        userData
                    );
                    
                    console.log(`Created user ${user.email} in database.`);
                } catch (error) {
                    console.error(`Error creating user ${user.email} in database:`, error);
                }
            }
        } catch (error) {
            console.error(`Error processing user ${user.email}:`, error);
        }
    }
    
    console.log('\nTest credentials:');
    console.log('--------------------------------------------------');
    testUsers.forEach(user => {
        console.log(`${user.role}:`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Password: ${user.password}`);
        console.log('--------------------------------------------------');
    });
}

// Run the script
createTestUsers()
    .then(() => {
        console.log('Test users creation completed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error creating test users:', error);
        process.exit(1);
    }); 