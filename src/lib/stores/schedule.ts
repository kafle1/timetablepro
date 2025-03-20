import { writable, get } from 'svelte/store';
import { databases } from '$lib/config/appwrite';
import { DB_CONFIG } from '$lib/config/appwrite';
import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';
import type { Schedule } from '$lib/types';
import { authStore } from './auth';

interface ScheduleState {
    schedules: Schedule[];
    loading: boolean;
    error: string | null;
}

function createScheduleStore() {
    const { subscribe, set, update } = writable<ScheduleState>({
        schedules: [],
        loading: false,
        error: null
    });

    return {
        subscribe,
        fetchSchedules: async (filters: string[] = []) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.SCHEDULES,
                    filters
                );
                set({ schedules: response.documents as Schedule[], loading: false, error: null });
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch schedules'
                }));
                throw error;
            }
        },
        createSchedule: async (schedule: Omit<Schedule, keyof Models.Document>) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.createDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.SCHEDULES,
                    ID.unique(),
                    schedule
                );

                update(state => ({
                    schedules: [...state.schedules, response as Schedule],
                    loading: false,
                    error: null
                }));
                return response as Schedule;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to create schedule'
                }));
                throw error;
            }
        },
        updateSchedule: async (scheduleId: string, schedule: Partial<Schedule>) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.updateDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.SCHEDULES,
                    scheduleId,
                    schedule
                );

                update(state => ({
                    schedules: state.schedules.map(s => 
                        s.$id === scheduleId ? { ...s, ...response } as Schedule : s
                    ),
                    loading: false,
                    error: null
                }));
                return response as Schedule;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update schedule'
                }));
                throw error;
            }
        },
        deleteSchedule: async (scheduleId: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                await databases.deleteDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.SCHEDULES,
                    scheduleId
                );

                update(state => ({
                    schedules: state.schedules.filter(s => s.$id !== scheduleId),
                    loading: false,
                    error: null
                }));
                return true;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete schedule'
                }));
                throw error;
            }
        },
        getTeacherSchedules: async (teacherId: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.SCHEDULES,
                    [Query.equal('teacherId', teacherId)]
                );
                return response.documents as Schedule[];
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch teacher schedules'
                }));
                throw error;
            }
        },
        getRoomSchedules: async (roomId: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.SCHEDULES,
                    [Query.equal('roomId', roomId)]
                );
                return response.documents as Schedule[];
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch room schedules'
                }));
                throw error;
            }
        },
        getScheduleById: (scheduleId: string) => {
            const schedules = get(scheduleStore).schedules;
            return schedules.find(schedule => schedule.$id === scheduleId);
        },
        checkScheduleConflicts: async (schedule: { 
            dayOfWeek: string; 
            roomId: string; 
            teacherId: string; 
            startTime: string; 
            endTime: string; 
            $id?: string;
        }) => {
            try {
                const existingSchedules = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.SCHEDULES,
                    [
                        Query.equal('dayOfWeek', schedule.dayOfWeek),
                        Query.equal('roomId', schedule.roomId)
                    ]
                );
                
                // Check for room conflicts
                const roomConflicts = (existingSchedules.documents as Schedule[]).filter(existing => {
                    // Skip if same schedule (for updates)
                    if (schedule.$id && existing.$id === schedule.$id) return false;
                    
                    const newStart = new Date(`1970-01-01T${schedule.startTime}`).getTime();
                    const newEnd = new Date(`1970-01-01T${schedule.endTime}`).getTime();
                    const existingStart = new Date(`1970-01-01T${existing.startTime}`).getTime();
                    const existingEnd = new Date(`1970-01-01T${existing.endTime}`).getTime();
                    
                    return (
                        (newStart >= existingStart && newStart < existingEnd) ||
                        (newEnd > existingStart && newEnd <= existingEnd) ||
                        (newStart <= existingStart && newEnd >= existingEnd)
                    );
                });
                
                // Check for teacher conflicts
                const teacherSchedules = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.SCHEDULES,
                    [
                        Query.equal('dayOfWeek', schedule.dayOfWeek),
                        Query.equal('teacherId', schedule.teacherId)
                    ]
                );
                
                const teacherConflicts = (teacherSchedules.documents as Schedule[]).filter(existing => {
                    // Skip if same schedule (for updates)
                    if (schedule.$id && existing.$id === schedule.$id) return false;
                    
                    const newStart = new Date(`1970-01-01T${schedule.startTime}`).getTime();
                    const newEnd = new Date(`1970-01-01T${schedule.endTime}`).getTime();
                    const existingStart = new Date(`1970-01-01T${existing.startTime}`).getTime();
                    const existingEnd = new Date(`1970-01-01T${existing.endTime}`).getTime();
                    
                    return (
                        (newStart >= existingStart && newStart < existingEnd) ||
                        (newEnd > existingStart && newEnd <= existingEnd) ||
                        (newStart <= existingStart && newEnd >= existingEnd)
                    );
                });
                
                return {
                    hasConflicts: roomConflicts.length > 0 || teacherConflicts.length > 0,
                    roomConflicts,
                    teacherConflicts
                };
            } catch (error) {
                console.error('Error checking schedule conflicts:', error);
                throw error;
            }
        }
    };
}

export const scheduleStore = createScheduleStore(); 