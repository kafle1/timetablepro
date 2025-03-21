import { ID, Query } from 'appwrite';
import { databases, account, DB_CONFIG } from '$lib/config/appwrite';
import { USER_ROLES } from '$lib/config/constants';
import type { User } from '$lib/types';

interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: keyof typeof USER_ROLES;
}

const demoUsers: DemoUser[] = [
  {
    email: 'admin@timetablepro.com',
    password: 'Admin@123',
    name: 'Admin Demo',
    role: 'ADMIN',
  },
  {
    email: 'teacher@timetablepro.com',
    password: 'Teacher@123',
    name: 'Teacher Demo',
    role: 'TEACHER',
  },
  {
    email: 'student@timetablepro.com',
    password: 'Student@123',
    name: 'Student Demo',
    role: 'STUDENT',
  },
];

/**
 * Create demo users if they don't exist
 */
export async function createDemoUsersIfNotExist(): Promise<void> {
  console.log('Checking if demo users exist...');
  
  // Maximum retries for database operations
  const MAX_RETRIES = 3;
  
  for (const demoUser of demoUsers) {
    let retryCount = 0;
    let success = false;
    
    while (!success && retryCount < MAX_RETRIES) {
      try {
        // Check if user exists in the database
        const response = await databases.listDocuments(
          DB_CONFIG.databaseId,
          DB_CONFIG.collections.USERS,
          [Query.equal('email', [demoUser.email])]
        );
        
        // If user doesn't exist, create it
        if (response.documents.length === 0) {
          console.log(`Creating demo user: ${demoUser.email} (attempt ${retryCount + 1})`);
          
          try {
            // Create account in Appwrite
            const newAccount = await account.create(
              ID.unique(),
              demoUser.email,
              demoUser.password,
              demoUser.name
            );
            
            // Create user document in database with only supported fields
            const userData = {
              userId: newAccount.$id,
              email: newAccount.email,
              name: newAccount.name,
              role: demoUser.role,
              isActive: true,
              emailVerified: true,
              preferences: {},
              createdAt: new Date().toISOString()
            };
            
            await databases.createDocument(
              DB_CONFIG.databaseId,
              DB_CONFIG.collections.USERS,
              newAccount.$id,
              userData
            );
            
            console.log(`Demo user created: ${demoUser.email}`);
            success = true;
          } catch (error: any) {
            // If error is duplicate user (409), the user already exists in accounts but not in the database
            if (error.code === 409) {
              console.log(`User account already exists for ${demoUser.email}, creating database entry...`);
              try {
                // Try to get the account
                const session = await account.createEmailSession(demoUser.email, demoUser.password);
                const accountDetails = await account.get();
                
                // Create user document with only supported fields
                const userData = {
                  userId: accountDetails.$id,
                  email: accountDetails.email,
                  name: demoUser.name,
                  role: demoUser.role,
                  isActive: true,
                  emailVerified: true,
                  preferences: {},
                  createdAt: new Date().toISOString()
                };
                
                await databases.createDocument(
                  DB_CONFIG.databaseId,
                  DB_CONFIG.collections.USERS,
                  accountDetails.$id,
                  userData
                );
                
                // Delete the temporary session
                await account.deleteSession(session.$id);
                
                console.log(`Database entry created for demo user: ${demoUser.email}`);
                success = true;
              } catch (dbError: any) {
                console.error(`Failed to create database entry for ${demoUser.email} (attempt ${retryCount + 1}):`, dbError?.message || dbError);
                retryCount++;
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } else {
              console.error(`Failed to create demo user ${demoUser.email} (attempt ${retryCount + 1}):`, error?.message || error);
              retryCount++;
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } else {
          console.log(`Demo user already exists: ${demoUser.email}`);
          success = true;
        }
      } catch (error: any) {
        console.error(`Error checking demo user ${demoUser.email} (attempt ${retryCount + 1}):`, error?.message || error);
        retryCount++;
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!success) {
      console.error(`Failed to create demo user ${demoUser.email} after ${MAX_RETRIES} attempts.`);
    }
  }
  
  console.log('Demo user setup completed.');
} 