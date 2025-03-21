import { ID, Query } from 'appwrite';
import { databases, DB_CONFIG } from '$lib/config/appwrite';
import type { Schedule, ConflictCheckResult, DayOfWeek, Recurrence } from '$lib/types';
import { CONFLICT_STATUS } from '$lib/config/constants';
import { browser } from '$app/environment';

// Mock data for development when database connection fails
const MOCK_SCHEDULES: Schedule[] = [
    {
        $id: 'mock-schedule-1',
        className: 'Mathematics 101',
        subject: 'Mathematics',
        teacherId: 'teacher-1',
        roomId: 'room-1',
        startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
        duration: 90,
        dayOfWeek: 'monday' as DayOfWeek,
        recurrence: 'weekly' as Recurrence,
        conflictStatus: 'none',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        $collectionId: 'schedules',
        $databaseId: 'timetablepro'
    },
    {
        $id: 'mock-schedule-2',
        className: 'Physics 202',
        subject: 'Physics',
        teacherId: 'teacher-2',
        roomId: 'room-2',
        startTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(12, 30, 0, 0)).toISOString(),
        duration: 90,
        dayOfWeek: 'wednesday' as DayOfWeek,
        recurrence: 'weekly' as Recurrence,
        conflictStatus: 'none',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        $collectionId: 'schedules',
        $databaseId: 'timetablepro'
    },
    {
        $id: 'mock-schedule-3',
        className: 'Chemistry 101',
        subject: 'Chemistry',
        teacherId: 'teacher-3',
        roomId: 'room-3',
        startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
        endTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
        duration: 90,
        dayOfWeek: 'friday' as DayOfWeek,
        recurrence: 'weekly' as Recurrence,
        conflictStatus: 'none',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        $collectionId: 'schedules',
        $databaseId: 'timetablepro'
    }
];

export interface CreateScheduleParams {
    className: string;
    subject: string;
    teacherId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    duration: number;
    dayOfWeek: DayOfWeek;
    recurrence: Recurrence;
}

export interface UpdateScheduleParams {
    className?: string;
    subject?: string;
    teacherId?: string;
    roomId?: string;
    startTime?: string;
    endTime?: string;
    duration?: number;
    dayOfWeek?: DayOfWeek;
    recurrence?: Recurrence;
}

export interface ScheduleFilters {
    startDate?: string;
    endDate?: string;
    teacherId?: string;
    roomId?: string;
    dayOfWeek?: DayOfWeek;
}

class ScheduleService {
    // Flag to determine if we should use mock data
    private useMockData = false;
    
    constructor() {
        // Check if we're running in a browser and try to detect if Appwrite is properly configured
        if (browser) {
            this.checkAppwriteConfig();
        }
    }
    
    // Check if Appwrite config is valid
    private async checkAppwriteConfig() {
        try {
            // Try to list documents to check if database exists
            await databases.listDocuments(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.SCHEDULES,
                []
            );
            
            // If no error, we can use real data
            this.useMockData = false;
            console.log('Successfully connected to Appwrite database, using real data');
        } catch (error) {
            // If error, use mock data
            this.useMockData = true;
            console.warn('Using mock data for schedules due to Appwrite connection issues:', error);
        }
    }

    /**
     * Create a new schedule
     */
    async createSchedule(params: CreateScheduleParams): Promise<Schedule> {
        try {
            // If using mock data, simulate creation
            if (this.useMockData) {
                const newSchedule: Schedule = {
                    $id: `mock-schedule-${Date.now()}`,
                    ...params,
                    conflictStatus: 'none',
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $permissions: [],
                    $collectionId: 'schedules',
                    $databaseId: 'timetablepro'
                };
                
                // Add to mock schedules
                MOCK_SCHEDULES.push(newSchedule);
                return newSchedule;
            }
            
            // Otherwise use real Appwrite
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
            // If using mock data, update in mock array
            if (this.useMockData) {
                const index = MOCK_SCHEDULES.findIndex(s => s.$id === scheduleId);
                
                if (index === -1) {
                    throw new Error('Schedule not found');
                }
                
                const updatedSchedule = {
                    ...MOCK_SCHEDULES[index],
                    ...params,
                    $updatedAt: new Date().toISOString()
                };
                
                MOCK_SCHEDULES[index] = updatedSchedule;
                return updatedSchedule;
            }
            
            // Otherwise use real Appwrite
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
            // If using mock data, remove from mock array
            if (this.useMockData) {
                const index = MOCK_SCHEDULES.findIndex(s => s.$id === scheduleId);
                
                if (index === -1) {
                    throw new Error('Schedule not found');
                }
                
                MOCK_SCHEDULES.splice(index, 1);
                return true;
            }
            
            // Otherwise use real Appwrite
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
            // If using mock data, get from mock array
            if (this.useMockData) {
                const schedule = MOCK_SCHEDULES.find(s => s.$id === scheduleId);
                
                if (!schedule) {
                    throw new Error('Schedule not found');
                }
                
                return schedule;
            }
            
            // Otherwise use real Appwrite
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
    async listSchedules(filters?: ScheduleFilters): Promise<{ total: number; documents: Schedule[] }> {
        try {
            // If using mock data, filter the mock array
            if (this.useMockData) {
                let filteredSchedules = [...MOCK_SCHEDULES];
                
                if (filters) {
                    if (filters.startDate) {
                        filteredSchedules = filteredSchedules.filter(
                            s => new Date(s.startTime) >= new Date(filters.startDate!)
                        );
                    }
                    
                    if (filters.endDate) {
                        filteredSchedules = filteredSchedules.filter(
                            s => new Date(s.startTime) <= new Date(filters.endDate!)
                        );
                    }
                    
                    if (filters.teacherId) {
                        filteredSchedules = filteredSchedules.filter(
                            s => s.teacherId === filters.teacherId
                        );
                    }
                    
                    if (filters.roomId) {
                        filteredSchedules = filteredSchedules.filter(
                            s => s.roomId === filters.roomId
                        );
                    }
                    
                    if (filters.dayOfWeek) {
                        filteredSchedules = filteredSchedules.filter(
                            s => s.dayOfWeek === filters.dayOfWeek
                        );
                    }
                }
                
                // Sort by start time
                filteredSchedules.sort((a, b) => 
                    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                );
                
                return {
                    total: filteredSchedules.length,
                    documents: filteredSchedules
                };
            }
            
            // Otherwise use real Appwrite
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
            
            return {
                total: response.total,
                documents: response.documents as unknown as Schedule[]
            };
        } catch (error) {
            console.error('Error listing schedules:', error);
            
            // If error with Appwrite, switch to mock data
            if (!this.useMockData) {
                console.warn('Switching to mock data due to Appwrite error');
                this.useMockData = true;
                
                // Try again with mock data
                return this.listSchedules(filters);
            }
            
            throw error;
        }
    }
    
    /**
     * Get schedules for a specific day
     */
    async getSchedulesByDay(dayOfWeek: DayOfWeek) {
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
            // If using mock data, check conflicts in mock array
            if (this.useMockData) {
                const { teacherId, roomId, startTime, endTime, dayOfWeek } = schedule;
                
                // Find room conflicts
                const roomConflicts = MOCK_SCHEDULES.filter(s => 
                    s.roomId === roomId &&
                    s.dayOfWeek === dayOfWeek &&
                    new Date(s.startTime) <= new Date(endTime) &&
                    new Date(s.endTime) >= new Date(startTime) &&
                    (!excludeScheduleId || s.$id !== excludeScheduleId)
                );
                
                // Find teacher conflicts
                const teacherConflicts = MOCK_SCHEDULES.filter(s => 
                    s.teacherId === teacherId &&
                    s.dayOfWeek === dayOfWeek &&
                    new Date(s.startTime) <= new Date(endTime) &&
                    new Date(s.endTime) >= new Date(startTime) &&
                    (!excludeScheduleId || s.$id !== excludeScheduleId)
                );
                
                const hasRoomConflicts = roomConflicts.length > 0;
                const hasTeacherConflicts = teacherConflicts.length > 0;
                
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
                    ...roomConflicts,
                    ...teacherConflicts
                ];
                
                return {
                    hasConflict: conflictType !== 'none',
                    conflictType,
                    conflictingSchedules,
                    message
                };
            }
            
            // Otherwise use real Appwrite
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
            
            // If error with Appwrite, switch to mock data
            if (!this.useMockData) {
                console.warn('Switching to mock data for conflict checking due to Appwrite error');
                this.useMockData = true;
                
                // Try again with mock data
                return this.checkConflicts(schedule, excludeScheduleId);
            }
            
            throw error;
        }
    }
}

export const scheduleService = new ScheduleService(); 