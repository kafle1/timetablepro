import { databases } from '$lib/config';
import { COLLECTIONS } from '$lib/config';
import type { Schedule } from '$lib/types';
import { handleAppwriteError } from '$lib/utils/error';
import { Query } from 'appwrite';

interface CreateScheduleParams {
    title: string;
    description?: string;
    roomId: string;
    teacherId: string;
    startTime: string;
    duration: number;
}

interface UpdateScheduleParams extends Partial<CreateScheduleParams> {}

class ScheduleService {
    async createSchedule(params: CreateScheduleParams): Promise<Schedule> {
        try {
            const response = await databases.createDocument(
                COLLECTIONS.SCHEDULES.databaseId,
                COLLECTIONS.SCHEDULES.collectionId,
                'unique()',
                params
            );
            return response as Schedule;
        } catch (error) {
            throw handleAppwriteError(error);
        }
    }

    async updateSchedule(scheduleId: string, params: UpdateScheduleParams): Promise<Schedule> {
        try {
            const response = await databases.updateDocument(
                COLLECTIONS.SCHEDULES.databaseId,
                COLLECTIONS.SCHEDULES.collectionId,
                scheduleId,
                params
            );
            return response as Schedule;
        } catch (error) {
            throw handleAppwriteError(error);
        }
    }

    async deleteSchedule(scheduleId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                COLLECTIONS.SCHEDULES.databaseId,
                COLLECTIONS.SCHEDULES.collectionId,
                scheduleId
            );
        } catch (error) {
            throw handleAppwriteError(error);
        }
    }

    async listSchedules(filters?: {
        startDate?: string;
        endDate?: string;
        teacherId?: string;
        roomId?: string;
    }): Promise<Schedule[]> {
        try {
            const queries: string[] = [];

            if (filters?.startDate) {
                queries.push(Query.greaterThanEqual('startTime', filters.startDate));
            }
            if (filters?.endDate) {
                queries.push(Query.lessThan('startTime', filters.endDate));
            }
            if (filters?.teacherId) {
                queries.push(Query.equal('teacherId', filters.teacherId));
            }
            if (filters?.roomId) {
                queries.push(Query.equal('roomId', filters.roomId));
            }

            const response = await databases.listDocuments(
                COLLECTIONS.SCHEDULES.databaseId,
                COLLECTIONS.SCHEDULES.collectionId,
                queries
            );
            return response.documents as Schedule[];
        } catch (error) {
            throw handleAppwriteError(error);
        }
    }

    async getSchedule(scheduleId: string): Promise<Schedule> {
        try {
            const response = await databases.getDocument(
                COLLECTIONS.SCHEDULES.databaseId,
                COLLECTIONS.SCHEDULES.collectionId,
                scheduleId
            );
            return response as Schedule;
        } catch (error) {
            throw handleAppwriteError(error);
        }
    }
}

export const scheduleService = new ScheduleService();

export async function getSchedules(): Promise<Schedule[]> {
    try {
        const response = await databases.listDocuments(
            databases.databaseId,
            'schedules'
        );
        return response.documents as Schedule[];
    } catch (error) {
        throw handleAppwriteError(error);
    }
} 