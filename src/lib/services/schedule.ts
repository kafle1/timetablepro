import { ID, Query } from 'appwrite';
import { databases, DB_CONFIG } from '$lib/config/appwrite';
import type { Schedule, ConflictCheckResult } from '$lib/types';
import { CONFLICT_STATUS } from '$lib/config/constants';

export interface CreateScheduleParams {
    className: string;
    subject: string;
    teacherId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    duration: number;
    dayOfWeek: string;
    recurrence: string;
}

export interface UpdateScheduleParams {
    className?: string;
    subject?: string;
    teacherId?: string;
    roomId?: string;
    startTime?: string;
    endTime?: string;
    duration?: number;
    dayOfWeek?: string;
    recurrence?: string;
}

export interface ScheduleFilters {
    startDate?: string;
    endDate?: string;
    teacherId?: string;
    roomId?: string;
    dayOfWeek?: string;
}

class ScheduleService {
    /**
     * Create a new schedule
     */
    async createSchedule(params: CreateScheduleParams): Promise<Schedule> {
        try {
            // Check for conflicts before creating
            const conflictCheck = await this.checkConflicts(params);
            
            // Add conflict status to the schedule data
            const scheduleData = {
                ...params,
                conflictStatus: conflictCheck.conflictType
            };
            
            const response = await databases.createDocument(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.SCHEDULES,
                ID.unique(),
                scheduleData
            );
            
            return response as unknown as Schedule;
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error;
        }
    }
    
    /**
     * Update an existing schedule
     */
    async updateSchedule(scheduleId: string, params: UpdateScheduleParams): Promise<Schedule> {
        try {
            // Get the current schedule
            const currentSchedule = await this.getSchedule(scheduleId);
            
            // Merge current schedule with updates
            const updatedScheduleData = {
                ...currentSchedule,
                ...params
            };
            
            // Check for conflicts with the updated data
            const conflictCheck = await this.checkConflicts(updatedScheduleData as CreateScheduleParams, scheduleId);
            
            // Add conflict status to the update data
            const updateData = {
                ...params,
                conflictStatus: conflictCheck.conflictType
            };
            
            const response = await databases.updateDocument(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.SCHEDULES,
                scheduleId,
                updateData
            );
            
            return response as unknown as Schedule;
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    }
    
    /**
     * Delete a schedule
     */
    async deleteSchedule(scheduleId: string): Promise<boolean> {
        try {
            await databases.deleteDocument(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.SCHEDULES,
                scheduleId
            );
            
            return true;
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    }
    
    /**
     * Get a schedule by ID
     */
    async getSchedule(scheduleId: string): Promise<Schedule> {
        try {
            const response = await databases.getDocument(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.SCHEDULES,
                scheduleId
            );
            
            return response as unknown as Schedule;
        } catch (error) {
            console.error('Error getting schedule:', error);
            throw error;
        }
    }
    
    /**
     * List schedules with optional filters
     */
    async listSchedules(filters?: ScheduleFilters) {
        try {
            let queries = [];
            
            if (filters) {
                if (filters.startDate) {
                    queries.push(Query.greaterThanEqual('startTime', filters.startDate));
                }
                
                if (filters.endDate) {
                    queries.push(Query.lessThanEqual('startTime', filters.endDate));
                }
                
                if (filters.teacherId) {
                    queries.push(Query.equal('teacherId', filters.teacherId));
                }
                
                if (filters.roomId) {
                    queries.push(Query.equal('roomId', filters.roomId));
                }
                
                if (filters.dayOfWeek) {
                    queries.push(Query.equal('dayOfWeek', filters.dayOfWeek));
                }
            }
            
            // Sort by start time
            queries.push(Query.orderAsc('startTime'));
            
            const response = await databases.listDocuments(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.SCHEDULES,
                queries
            );
            
            return response;
        } catch (error) {
            console.error('Error listing schedules:', error);
            throw error;
        }
    }
    
    /**
     * Get schedules for a specific day
     */
    async getSchedulesByDay(dayOfWeek: string) {
        try {
            return await this.listSchedules({ dayOfWeek });
        } catch (error) {
            console.error('Error getting schedules by day:', error);
            throw error;
        }
    }
    
    /**
     * Get schedules for a specific teacher
     */
    async getSchedulesByTeacher(teacherId: string) {
        try {
            return await this.listSchedules({ teacherId });
        } catch (error) {
            console.error('Error getting schedules by teacher:', error);
            throw error;
        }
    }
    
    /**
     * Get schedules for a specific room
     */
    async getSchedulesByRoom(roomId: string) {
        try {
            return await this.listSchedules({ roomId });
        } catch (error) {
            console.error('Error getting schedules by room:', error);
            throw error;
        }
    }
    
    /**
     * Check for conflicts with other schedules
     */
    async checkConflicts(schedule: CreateScheduleParams, excludeScheduleId?: string): Promise<ConflictCheckResult> {
        try {
            const { teacherId, roomId, startTime, endTime, dayOfWeek } = schedule;
            
            // Query for room conflicts
            const roomConflictQueries = [
                Query.equal('roomId', roomId),
                Query.equal('dayOfWeek', dayOfWeek),
                Query.lessThanEqual('startTime', endTime),
                Query.greaterThanEqual('endTime', startTime)
            ];
            
            // Query for teacher conflicts
            const teacherConflictQueries = [
                Query.equal('teacherId', teacherId),
                Query.equal('dayOfWeek', dayOfWeek),
                Query.lessThanEqual('startTime', endTime),
                Query.greaterThanEqual('endTime', startTime)
            ];
            
            // If we're updating an existing schedule, exclude it from the conflict check
            if (excludeScheduleId) {
                roomConflictQueries.push(Query.notEqual('$id', excludeScheduleId));
                teacherConflictQueries.push(Query.notEqual('$id', excludeScheduleId));
            }
            
            // Check for room conflicts
            const roomConflicts = await databases.listDocuments(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.SCHEDULES,
                roomConflictQueries
            );
            
            // Check for teacher conflicts
            const teacherConflicts = await databases.listDocuments(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.SCHEDULES,
                teacherConflictQueries
            );
            
            const hasRoomConflicts = roomConflicts.total > 0;
            const hasTeacherConflicts = teacherConflicts.total > 0;
            
            // Determine conflict type
            let conflictType: 'none' | 'warning' | 'conflict' = 'none';
            let message = '';
            
            if (hasRoomConflicts && hasTeacherConflicts) {
                conflictType = 'conflict';
                message = 'Both room and teacher are already scheduled for this time slot.';
            } else if (hasRoomConflicts) {
                conflictType = 'conflict';
                message = 'Room is already scheduled for this time slot.';
            } else if (hasTeacherConflicts) {
                conflictType = 'conflict';
                message = 'Teacher is already scheduled for this time slot.';
            }
            
            // Combine conflicts
            const conflictingSchedules = [
                ...roomConflicts.documents,
                ...teacherConflicts.documents
            ] as unknown as Schedule[];
            
            return {
                hasConflict: conflictType !== 'none',
                conflictType,
                conflictingSchedules,
                message
            };
        } catch (error) {
            console.error('Error checking conflicts:', error);
            throw error;
        }
    }
}

export const scheduleService = new ScheduleService(); 