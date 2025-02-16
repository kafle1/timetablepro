import { writable, get } from 'svelte/store';
import { databases, DB_CONFIG } from '$lib/config/appwrite';
import type { Models } from 'appwrite';
import { Query } from 'appwrite';
import type { User } from '$lib/types';
import { createTeacherNotification } from '$lib/services/notification';
import { authStore } from './auth';

// Extend User type with Appwrite Document properties
type TeacherDocument = User & Models.Document;

export interface Teacher extends Models.Document {
    name: string;
    email: string;
    subjects: string[];
    availability: {
        dayOfWeek: string;
        timeSlots: string[];
    }[];
}

interface TeacherState {
    teachers: TeacherDocument[];
    loading: boolean;
    error: string | null;
}

function createTeacherStore() {
    const { subscribe, set, update } = writable<TeacherState>({
        teachers: [],
        loading: false,
        error: null
    });

    return {
        subscribe,
        fetchTeachers: async () => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS
                );
                const teachers = response.documents
                    .filter(doc => doc.role === 'TEACHER')
                    .map(doc => ({ ...doc } as TeacherDocument));
                set({ teachers, loading: false, error: null });
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch teachers'
                }));
                throw error;
            }
        },
        getTeacherById: async (teacherId: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.getDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    teacherId
                );
                return { ...response } as TeacherDocument;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch teacher'
                }));
                throw error;
            }
        },
        updateTeacher: async (teacherId: string, data: Partial<User>) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.updateDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    teacherId,
                    data
                );
                const updatedTeacher = { ...response } as TeacherDocument;
                update(state => ({
                    teachers: state.teachers.map(t => 
                        t.$id === teacherId ? updatedTeacher : t
                    ),
                    loading: false,
                    error: null
                }));
                return updatedTeacher;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update teacher'
                }));
                throw error;
            }
        },
        getAvailableTeachers: async () => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS
                );
                const availableTeachers = response.documents
                    .filter(doc => doc.role === 'TEACHER' && doc.availability === true)
                    .map(doc => ({ ...doc } as TeacherDocument));
                return availableTeachers;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch available teachers'
                }));
                throw error;
            }
        },
        getTeacherAvailability: async (teacherId: string) => {
            try {
                const response = await databases.getDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    teacherId
                );
                return (response as Teacher).availability || [];
            } catch (error) {
                console.error('Failed to fetch teacher availability:', error);
                return [];
            }
        },
        updateTeacherAvailability: async (teacherId: string, availability: Teacher['availability']) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.updateDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    teacherId,
                    { availability }
                );

                const currentUser = get(authStore).user;
                if (currentUser) {
                    await createTeacherNotification(
                        teacherId,
                        response as Teacher,
                        'availability_changed'
                    );
                }

                update(state => ({
                    teachers: state.teachers.map(t => 
                        t.$id === teacherId ? { ...t, availability } as Teacher : t
                    ),
                    loading: false,
                    error: null
                }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update teacher availability'
                }));
                throw error;
            }
        }
    };
}

export const teacherStore = createTeacherStore(); 