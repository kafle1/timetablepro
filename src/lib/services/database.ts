import { databases } from '$lib/config/appwrite';
import { DB_CONFIG } from '$lib/config/appwrite';
import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';
import type { User, Room, Schedule, TeacherAvailability, DayOfWeek, Recurrence } from '$lib/types';

// Database and collection IDs
const DATABASE_ID = 'timetable';
const USERS_COLLECTION_ID = 'users';
const ROOMS_COLLECTION_ID = 'rooms';
const SCHEDULES_COLLECTION_ID = 'schedules';
const AVAILABILITY_COLLECTION_ID = 'availability';

// Types
type UserData = Omit<User, keyof Models.Document>;
type RoomData = Omit<Room, keyof Models.Document>;
type ScheduleData = {
    className: string;
    subject: string;
    teacherId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    duration: number;
    dayOfWeek: DayOfWeek;
    recurrence: Recurrence;
    conflictStatus?: 'none' | 'warning' | 'conflict';
};
type AvailabilityData = Omit<TeacherAvailability, keyof Models.Document>;

// User operations
export async function createUser(userData: UserData) {
    return await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        ID.unique(),
        userData
    );
}

export async function getUsers() {
    const response = await databases.listDocuments(DB_CONFIG.databaseId, DB_CONFIG.collections.USERS);
    return response.documents as User[];
}

export async function updateUser(userId: string, userData: Partial<UserData>) {
    return await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        userId,
        userData
    );
}

export async function deleteUser(userId: string) {
    return await databases.deleteDocument(DB_CONFIG.databaseId, DB_CONFIG.collections.USERS, userId);
}

// Room operations
export async function createRoom(roomData: RoomData) {
    return await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.ROOMS,
        ID.unique(),
        roomData
    );
}

export async function getRooms() {
    const response = await databases.listDocuments(DB_CONFIG.databaseId, DB_CONFIG.collections.ROOMS);
    return response.documents as Room[];
}

export async function updateRoom(roomId: string, roomData: Partial<RoomData>) {
    return await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.ROOMS,
        roomId,
        roomData
    );
}

export async function deleteRoom(roomId: string) {
    return await databases.deleteDocument(DB_CONFIG.databaseId, DB_CONFIG.collections.ROOMS, roomId);
}

// Schedule operations
export async function createSchedule(scheduleData: ScheduleData) {
    return await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.SCHEDULES,
        ID.unique(),
        scheduleData
    );
}

export async function getSchedules() {
    const response = await databases.listDocuments(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES);
    return response.documents as Schedule[];
}

export async function updateSchedule(scheduleId: string, scheduleData: Partial<ScheduleData>) {
    return await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.SCHEDULES,
        scheduleId,
        scheduleData
    );
}

export async function deleteSchedule(scheduleId: string) {
    return await databases.deleteDocument(DB_CONFIG.databaseId, DB_CONFIG.collections.SCHEDULES, scheduleId);
}

// Availability operations
export async function setAvailability(availabilityData: AvailabilityData) {
    return await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.TEACHER_AVAILABILITY,
        ID.unique(),
        availabilityData
    );
}

export async function getTeacherAvailability(teacherId: string) {
    const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.TEACHER_AVAILABILITY,
        [Query.equal('teacherId', teacherId)]
    );
    return response.documents as TeacherAvailability[];
}

export async function updateAvailability(availabilityId: string, availabilityData: Partial<AvailabilityData>) {
    return await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.TEACHER_AVAILABILITY,
        availabilityId,
        availabilityData
    );
}

// Helper function to check schedule conflicts
export async function checkScheduleConflicts(scheduleData: ScheduleData) {
    const existingSchedules = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.SCHEDULES,
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
