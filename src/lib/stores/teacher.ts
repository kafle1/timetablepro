import { writable, get } from 'svelte/store';
import { databases } from '$lib/config/appwrite';
import { DB_CONFIG } from '$lib/config/appwrite';
import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';
import type { User } from '$lib/types';

// Teacher state type
interface TeacherState {
    teachers: User[];
    loading: boolean;
    error: string | null;
}

export interface TeacherAvailability {
  day: string;
  timeSlots: {
    startTime: string;
    endTime: string;
  }[];
}

// Create teacher store
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
            DB_CONFIG.collections.USERS,
            [Query.equal('role', 'teacher')]
        );
        set({ teachers: response.documents as User[], loading: false, error: null });
        return response.documents;
      } catch (error) {
        update(state => ({
            ...state,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch teachers'
        }));
        throw error;
      }
    },
    getTeacherById: (teacherId: string) => {
        const state = get(teacherStore);
        return state.teachers.find(teacher => teacher.$id === teacherId);
    },
    updateTeacher: async (id: string, teacherData: Partial<User>) => {
      try {
        update(state => ({ ...state, loading: true, error: null }));
        const response = await databases.updateDocument(
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.USERS,
            id,
            teacherData
        );
        
        update(state => ({
            teachers: state.teachers.map(t => 
                t.$id === id ? { ...t, ...response } as User : t
            ),
            loading: false,
            error: null
        }));
        return response;
      } catch (error) {
        update(state => ({
            ...state,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to update teacher'
        }));
        throw error;
      }
    },
    createTeacher: async (teacherData: Partial<User>) => {
      try {
        update(state => ({ ...state, loading: true, error: null }));
        const newTeacher = await databases.createDocument(
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.USERS,
            ID.unique(),
            {
                ...teacherData,
                role: 'teacher'
            }
        );
        
        update(state => ({
            teachers: [...state.teachers, newTeacher as User],
            loading: false,
            error: null
        }));
        return newTeacher;
      } catch (error) {
        update(state => ({
            ...state,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to create teacher'
        }));
        throw error;
      }
    },
    deleteTeacher: async (id: string) => {
      try {
        update(state => ({ ...state, loading: true, error: null }));
        await databases.deleteDocument(
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.USERS,
            id
        );
        
        update(state => ({
            teachers: state.teachers.filter(teacher => teacher.$id !== id),
            loading: false,
            error: null
        }));
        return true;
      } catch (error) {
        update(state => ({
            ...state,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to delete teacher'
        }));
        throw error;
      }
    },
    updateTeacherAvailability: async (id: string, availability: TeacherAvailability[]) => {
      try {
        update(state => ({ ...state, loading: true, error: null }));
        const response = await databases.updateDocument(
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.USERS,
            id,
            { availability }
        );
        
        update(state => ({
            teachers: state.teachers.map(t => 
                t.$id === id ? { ...t, availability } as User : t
            ),
            loading: false,
            error: null
        }));
        
        return response as unknown as User;
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