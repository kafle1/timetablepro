import { writable, get } from 'svelte/store';
import { databases } from '$lib/config/appwrite';
import { appwriteConfig } from '$lib/config/appwrite';
import type { Models } from 'appwrite';
import { Query } from 'appwrite';
import { createScheduleNotification } from '$lib/services/notification';
import { authStore } from './auth';

export interface Schedule extends Models.Document {
    class: string;
    subject: string;
    teacher_id: string;
    room_id: string;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
    recurrence_pattern?: string;
}

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
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.schedules,
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
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.schedules,
                    'unique()',
                    schedule
                );

                const currentUser = get(authStore).user;
                if (currentUser && schedule.teacher_id) {
                    await createScheduleNotification(
                        schedule.teacher_id,
                        response as Schedule,
                        'created'
                    );
                }

                update(state => ({
                    schedules: [...state.schedules, response as Schedule],
                    loading: false,
                    error: null
                }));
                return response;
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
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.schedules,
                    scheduleId,
                    schedule
                );

                const currentUser = get(authStore).user;
                const updatedSchedule = response as Schedule;
                if (currentUser && updatedSchedule.teacher_id) {
                    await createScheduleNotification(
                        updatedSchedule.teacher_id,
                        updatedSchedule,
                        'updated'
                    );
                }

                update(state => ({
                    schedules: state.schedules.map(s => 
                        s.$id === scheduleId ? { ...s, ...response } as Schedule : s
                    ),
                    loading: false,
                    error: null
                }));
                return response;
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
                const currentState = get(scheduleStore);
                const schedule = currentState.schedules.find(s => s.$id === scheduleId);
                const currentUser = get(authStore).user;
                
                if (schedule && currentUser) {
                    await createScheduleNotification(
                        schedule.teacher_id,
                        schedule,
                        'deleted'
                    );
                }

                update(state => ({ ...state, loading: true, error: null }));
                await databases.deleteDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.schedules,
                    scheduleId
                );

                update(state => ({
                    schedules: state.schedules.filter(s => s.$id !== scheduleId),
                    loading: false,
                    error: null
                }));
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
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.schedules,
                    [Query.equal('teacher_id', teacherId)]
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
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.schedules,
                    [Query.equal('room_id', roomId)]
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
        }
    };
}

export const scheduleStore = createScheduleStore(); 