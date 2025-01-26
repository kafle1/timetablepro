import { databases } from '$lib/config/appwrite';
import { appwriteConfig } from '$lib/config/appwrite';
import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';

export type ScheduleData = {
    subject: string;
    teacherId: string;
    roomId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    class: string;
};

export interface Schedule extends Models.Document, ScheduleData {}

export async function getSchedules(filters: { teacherId?: string; roomId?: string; dayOfWeek?: string } = {}) {
    try {
        const queries: string[] = [];
        
        if (filters.teacherId) {
            queries.push(Query.equal('teacherId', filters.teacherId));
        }
        if (filters.roomId) {
            queries.push(Query.equal('roomId', filters.roomId));
        }
        if (filters.dayOfWeek) {
            queries.push(Query.equal('dayOfWeek', filters.dayOfWeek));
        }

        const response = await databases.listDocuments<Schedule>(
            appwriteConfig.databaseId,
            appwriteConfig.collections.schedules,
            queries
        );

        return response.documents;
    } catch (error) {
        console.error('Error fetching schedules:', error);
        throw error;
    }
}

export async function createSchedule(schedule: ScheduleData) {
    try {
        const response = await databases.createDocument<Schedule>(
            appwriteConfig.databaseId,
            appwriteConfig.collections.schedules,
            ID.unique(),
            schedule
        );

        return response;
    } catch (error) {
        console.error('Error creating schedule:', error);
        throw error;
    }
}

export async function updateSchedule(scheduleId: string, schedule: Partial<ScheduleData>) {
    try {
        const response = await databases.updateDocument<Schedule>(
            appwriteConfig.databaseId,
            appwriteConfig.collections.schedules,
            scheduleId,
            schedule
        );

        return response;
    } catch (error) {
        console.error('Error updating schedule:', error);
        throw error;
    }
}

export async function deleteSchedule(scheduleId: string) {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.schedules,
            scheduleId
        );
    } catch (error) {
        console.error('Error deleting schedule:', error);
        throw error;
    }
}

export function hasTimeConflict(
    startTime1: string,
    endTime1: string,
    startTime2: string,
    endTime2: string
): boolean {
    const start1 = new Date(`1970-01-01T${startTime1}`);
    const end1 = new Date(`1970-01-01T${endTime1}`);
    const start2 = new Date(`1970-01-01T${startTime2}`);
    const end2 = new Date(`1970-01-01T${endTime2}`);

    return start1 < end2 && start2 < end1;
}

export async function checkScheduleConflicts(
    schedule: ScheduleData,
    excludeScheduleId?: string
): Promise<Schedule[]> {
    const existingSchedules = await getSchedules({
        dayOfWeek: schedule.dayOfWeek,
        roomId: schedule.roomId
    });

    return existingSchedules.filter(
        existing =>
            existing.$id !== excludeScheduleId &&
            hasTimeConflict(
                schedule.startTime,
                schedule.endTime,
                existing.startTime,
                existing.endTime
            )
    );
} 
