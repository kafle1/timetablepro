import { Client, Databases, Users, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || '')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

// Initialize services
const databases = new Databases(client);
const users = new Users(client);

// Database and collection configuration
const DB_CONFIG = {
  databaseId: process.env.VITE_APPWRITE_DATABASE_ID || '',
  collections: {
    USERS: process.env.VITE_APPWRITE_USERS_COLLECTION_ID || '',
    ROOMS: process.env.VITE_APPWRITE_ROOMS_COLLECTION_ID || '',
    SCHEDULES: process.env.VITE_APPWRITE_SCHEDULES_COLLECTION_ID || '',
    NOTIFICATIONS: process.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || '',
    TEACHER_AVAILABILITY: process.env.VITE_APPWRITE_TEACHER_AVAILABILITY_COLLECTION_ID || ''
  }
};

// Constants
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
const TIME_SLOTS = [
  { start: '08:00', end: '09:30' },
  { start: '09:45', end: '11:15' },
  { start: '11:30', end: '13:00' },
  { start: '14:00', end: '15:30' },
  { start: '15:45', end: '17:15' }
];

// Demo account data
const DEMO_ACCOUNTS = [
  {
    email: 'admin@timetablepro.com',
    name: 'Admin User',
    role: 'ADMIN',
    password: 'Admin@123',
    phone: '+1234567890'
  },
  {
    email: 'teacher@timetablepro.com',
    name: 'Teacher User',
    role: 'TEACHER',
    password: 'Teacher@123',
    phone: '+1234567891'
  },
  {
    email: 'student@timetablepro.com',
    name: 'Student User',
    role: 'STUDENT',
    password: 'Student@123',
    phone: '+1234567892'
  }
];

// Dummy teacher data
const DUMMY_TEACHERS = [
  {
    name: 'John Smith',
    email: 'john.smith@timetablepro.com',
    role: 'TEACHER',
    subjects: ['Mathematics', 'Physics'],
    password: 'Teacher@123',
    phone: '+1234567893'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@timetablepro.com',
    role: 'TEACHER',
    subjects: ['Chemistry', 'Biology'],
    password: 'Teacher@123',
    phone: '+1234567894'
  }
];

// Dummy student data
const DUMMY_STUDENTS = [
  {
    name: 'Emma Wilson',
    email: 'emma.wilson@timetablepro.com',
    role: 'STUDENT',
    grade: '10',
    section: 'A',
    password: 'Student@123',
    phone: '+1234567895'
  },
  {
    name: 'David Lee',
    email: 'david.lee@timetablepro.com',
    role: 'STUDENT',
    grade: '10',
    section: 'B',
    password: 'Student@123',
    phone: '+1234567896'
  }
];

// Dummy room data
const DUMMY_ROOMS = [
  {
    name: 'Room 101',
    capacity: 30,
    type: 'classroom',
    isActive: true
  },
  {
    name: 'Room 102',
    capacity: 25,
    type: 'classroom',
    isActive: true
  },
  {
    name: 'Lab 201',
    capacity: 20,
    type: 'laboratory',
    isActive: true
  }
];

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function createDemoAccounts() {
  console.log('Creating demo accounts...');

  for (const account of DEMO_ACCOUNTS) {
    try {
      // Check if user exists by email
      const existingUsers = await users.list([Query.equal('email', account.email)]);

      if (existingUsers.total > 0) {
        console.log(`User ${account.email} already exists, skipping...`);
        continue; // User found, skip to the next account
      }

      // User does not exist, proceed with creation

      // Create user in Appwrite Auth
      const user = await users.create(
        ID.unique(),
        account.email,
        account.phone,
        account.password,
        account.name
      );

      // Create user document in database
      await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        ID.unique(),
        {
          userId: user.$id,
          email: user.email,
          name: user.name,
          role: account.role,
          isActive: true,
          preferences: JSON.stringify({})
        }
      );
      console.log(`Created demo account: ${account.email}`);
    } catch (error) {
      // Log errors not related to the existence check itself
      console.error(`Error processing demo account ${account.email}:`, error);
    }
  }
}

async function createTeachers() {
  console.log('Creating teachers...');

  for (const teacher of DUMMY_TEACHERS) {
    try {
      await delay(1000); // Add delay to avoid rate limiting

      // Check if user exists by email
      const existingUsers = await users.list([Query.equal('email', teacher.email)]);

      if (existingUsers.total > 0) {
        console.log(`User ${teacher.email} already exists, skipping...`);
        continue; // User found, skip to the next teacher
      }

      // User does not exist, proceed with creation

      // Create user in Appwrite Auth
      const user = await users.create(
        ID.unique(),
        teacher.email,
        teacher.phone,
        teacher.password,
        teacher.name
      );

      // Create user document in database
      await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        ID.unique(),
        {
          userId: user.$id,
          email: user.email,
          name: user.name,
          role: teacher.role,
          isActive: true,
          preferences: JSON.stringify({
            subjects: teacher.subjects
          })
        }
      );
      console.log(`Created teacher: ${teacher.email}`);
    } catch (error) {
      // Log errors not related to the existence check itself
      console.error(`Error processing teacher ${teacher.email}:`, error);
    }
  }
}

async function createStudents() {
  console.log('Creating students...');

  for (const student of DUMMY_STUDENTS) {
    try {
      await delay(1000); // Add delay to avoid rate limiting

      // Check if user exists by email
      const existingUsers = await users.list([Query.equal('email', student.email)]);

      if (existingUsers.total > 0) {
        console.log(`User ${student.email} already exists, skipping...`);
        continue; // User found, skip to the next student
      }

      // User does not exist, proceed with creation

      // Create user in Appwrite Auth
      const user = await users.create(
        ID.unique(),
        student.email,
        student.phone,
        student.password,
        student.name
      );

      // Create user document in database
      await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        ID.unique(),
        {
          userId: user.$id,
          email: user.email,
          name: user.name,
          role: student.role,
          isActive: true,
          preferences: JSON.stringify({
            grade: student.grade,
            section: student.section
          })
        }
      );
      console.log(`Created student: ${student.email}`);
    } catch (error) {
      // Log errors not related to the existence check itself
      console.error(`Error processing student ${student.email}:`, error);
    }
  }
}

async function createRooms() {
  console.log('Creating rooms...');

  for (const room of DUMMY_ROOMS) {
    try {
      await delay(1000); // Add delay to avoid rate limiting
      await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.ROOMS,
        ID.unique(),
        room
      );
      console.log(`Created room: ${room.name}`);
    } catch (error) {
      console.error(`Error creating room ${room.name}:`, error);
    }
  }
}

async function createTeacherAvailability() {
  console.log('Creating teacher availability...');

  try {
    const teachers = await databases.listDocuments(
      DB_CONFIG.databaseId,
      DB_CONFIG.collections.USERS,
      [Query.equal('role', 'TEACHER')]
    );

    for (const teacher of teachers.documents) {
      for (const day of DAYS_OF_WEEK) {
        for (const timeSlot of TIME_SLOTS) {
          await delay(500); // Add delay to avoid rate limiting

          try {
            await databases.createDocument(
              DB_CONFIG.databaseId,
              DB_CONFIG.collections.TEACHER_AVAILABILITY,
              ID.unique(),
              {
                teacherId: teacher.$id,
                dayOfWeek: day,
                startTime: timeSlot.start,
                endTime: timeSlot.end,
                isAvailable: true
              }
            );
          } catch (error: any) {
            if (error.code !== 409) {
              throw error;
            }
          }
        }
      }
    }

    console.log('Teacher availability created successfully');
  } catch (error) {
    console.error('Error creating teacher availability:', error);
  }
}

async function seedDatabase() {
  console.log('Starting database seeding...');

  await createDemoAccounts();
  await delay(2000); // Add delay between major operations

  await createTeachers();
  await delay(2000); // Add delay between major operations

  await createStudents();
  await delay(2000); // Add delay between major operations

  await createRooms();
  await delay(2000); // Add delay between major operations

  await createTeacherAvailability();

  console.log('Database seeding completed successfully!');
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  }); 