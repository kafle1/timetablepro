import { databases, DB_CONFIG, users } from './config';
import { Query } from 'node-appwrite';

async function cleanupCollection(collectionId: string) {
  try {
    // Get all documents in the collection
    const documents = await databases.listDocuments(
      DB_CONFIG.databaseId,
      collectionId
    );

    // Delete each document
    for (const doc of documents.documents) {
      await databases.deleteDocument(
        DB_CONFIG.databaseId,
        collectionId,
        doc.$id
      );
      console.log(`Deleted document ${doc.$id} from ${collectionId}`);
    }

    console.log(`Cleaned up collection: ${collectionId}`);
  } catch (error) {
    console.error(`Error cleaning up collection ${collectionId}:`, error);
  }
}

async function cleanupAuthUsers() {
  console.log('Cleaning up authentication users...');
  try {
    let totalDeleted = 0;
    let cursor = undefined; // Start with no cursor

    while (true) { // Loop until no more users are found
      const queries = [Query.limit(100)]; // Fetch up to 100 users per batch
      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const userList = await users.list(queries);

      if (userList.users.length === 0) {
        console.log('No more authentication users found to delete.');
        break; // Exit the loop if no users are returned
      }

      console.log(`Found ${userList.users.length} users in this batch...`);

      for (const user of userList.users) {
        try {
          await users.delete(user.$id);
          console.log(`Deleted auth user ${user.$id} (${user.email || 'No Email'})`); // Handle potentially missing email
          totalDeleted++;
        } catch (deleteError) {
          console.error(`Error deleting auth user ${user.$id}:`, deleteError);
          // Decide if you want to continue or stop on error
        }
      }

      // Update cursor to the ID of the last user fetched in this batch
      cursor = userList.users[userList.users.length - 1].$id;

      // Optional: Add a small delay to avoid potential rate limits if deleting many users
      // await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Authentication users cleanup completed. Total deleted: ${totalDeleted}`);
  } catch (error) {
    console.error('Error cleaning up authentication users:', error);
    // Decide if the overall cleanup should fail if auth cleanup fails
  }
}

async function deleteCollections(collectionIds: string[]) {
  console.log('Deleting collections...');
  for (const collectionId of collectionIds) {
    try {
      await databases.deleteCollection(DB_CONFIG.databaseId, collectionId);
      console.log(`Deleted collection: ${collectionId}`);
    } catch (error: any) {
      if (error.code === 404) {
        console.log(`Collection ${collectionId} not found, skipping deletion.`);
      } else {
        console.error(`Error deleting collection ${collectionId}:`, error);
        // Decide if you want to stop the process on error
      }
    }
  }
  console.log('Collections deletion process completed.');
}

async function cleanupDatabase() {
  console.log('Starting database cleanup...');

  // 1. Clean up authentication users
  await cleanupAuthUsers();

  // 2. Define collections to manage
  const collectionsToClean = [
    DB_CONFIG.collections.USERS,
    DB_CONFIG.collections.ROOMS,
    DB_CONFIG.collections.SCHEDULES,
    DB_CONFIG.collections.NOTIFICATIONS,
    DB_CONFIG.collections.TEACHER_AVAILABILITY
  ];

  // 3. Clean documents within each collection (optional but safe)
  for (const collectionId of collectionsToClean) {
    await cleanupCollection(collectionId);
  }

  // 4. Delete the collections themselves
  await deleteCollections(collectionsToClean);

  console.log('Database cleanup (including collections) completed successfully!');
}

// Run the cleanup
cleanupDatabase()
  .then(() => {
    console.log('Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }); 