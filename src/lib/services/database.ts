import { databases, ID } from '$lib/config/appwrite';
import { Query } from 'appwrite';
import type { Models } from 'appwrite';

// Database and collection IDs
const DATABASE_ID = 'timetable';
const USERS_COLLECTION_ID = 'users';
const ROOMS_COLLECTION_ID = 'rooms';
const SCHEDULES_COLLECTION_ID = 'schedules';
const AVAILABILITY_COLLECTION_ID = 'availability';

// Types
export interface User extends Models.Document {
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
}

export interface Room extends Models.Document {
    name: string;
    capacity: number;
    type: string;
    building: string;
}

export interface Schedule extends Models.Document {
    subject: string;
    teacherId: string;
    roomId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    class: string;
}

export interface Availability extends Models.Document {
    teacherId: string;
    dayOfWeek: string;
    availableSlots: string[];
}

type UserData = Omit<User, keyof Models.Document>;
type RoomData = Omit<Room, keyof Models.Document>;
type ScheduleData = Omit<Schedule, keyof Models.Document>;
type AvailabilityData = Omit<Availability, keyof Models.Document>;

// User operations
export async function createUser(userData: UserData) {
    return await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        userData
    );
}

export async function getUsers() {
    const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
    return response.documents as User[];
}

export async function updateUser(userId: string, userData: Partial<UserData>) {
    return await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        userData
    );
}

export async function deleteUser(userId: string) {
    return await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, userId);
}

// Room operations
export async function createRoom(roomData: RoomData) {
    return await databases.createDocument(
        DATABASE_ID,
        ROOMS_COLLECTION_ID,
        ID.unique(),
        roomData
    );
}

export async function getRooms() {
    const response = await databases.listDocuments(DATABASE_ID, ROOMS_COLLECTION_ID);
    return response.documents as Room[];
}

export async function updateRoom(roomId: string, roomData: Partial<RoomData>) {
    return await databases.updateDocument(
        DATABASE_ID,
        ROOMS_COLLECTION_ID,
        roomId,
        roomData
    );
}

export async function deleteRoom(roomId: string) {
    return await databases.deleteDocument(DATABASE_ID, ROOMS_COLLECTION_ID, roomId);
}

// Schedule operations
export async function createSchedule(scheduleData: ScheduleData) {
    return await databases.createDocument(
        DATABASE_ID,
        SCHEDULES_COLLECTION_ID,
        ID.unique(),
        scheduleData
    );
}

export async function getSchedules() {
    const response = await databases.listDocuments(DATABASE_ID, SCHEDULES_COLLECTION_ID);
    return response.documents as Schedule[];
}

export async function updateSchedule(scheduleId: string, scheduleData: Partial<ScheduleData>) {
    return await databases.updateDocument(
        DATABASE_ID,
        SCHEDULES_COLLECTION_ID,
        scheduleId,
        scheduleData
    );
}

export async function deleteSchedule(scheduleId: string) {
    return await databases.deleteDocument(DATABASE_ID, SCHEDULES_COLLECTION_ID, scheduleId);
}

// Availability operations
export async function setAvailability(availabilityData: AvailabilityData) {
    return await databases.createDocument(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        ID.unique(),
        availabilityData
    );
}

export async function getTeacherAvailability(teacherId: string) {
    const response = await databases.listDocuments(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        [Query.equal('teacherId', teacherId)]
    );
    return response.documents as Availability[];
}

export async function updateAvailability(availabilityId: string, availabilityData: Partial<AvailabilityData>) {
    return await databases.updateDocument(
        DATABASE_ID,
        AVAILABILITY_COLLECTION_ID,
        availabilityId,
        availabilityData
    );
}

// Helper function to check schedule conflicts
export async function checkScheduleConflicts(scheduleData: ScheduleData) {
    const existingSchedules = await databases.listDocuments(
        DATABASE_ID,
        SCHEDULES_COLLECTION_ID,
        [
            Query.equal('dayOfWeek', scheduleData.dayOfWeek),
            Query.equal('roomId', scheduleData.roomId)
        ]
    );

    return existingSchedules.documents.some((existing) => {
        const existingSchedule = existing as Schedule;
        const newStart = parseInt(scheduleData.startTime);
        const newEnd = parseInt(scheduleData.endTime);
        const existingStart = parseInt(existingSchedule.startTime);
        const existingEnd = parseInt(existingSchedule.endTime);

        return (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
        );
    });
} 
