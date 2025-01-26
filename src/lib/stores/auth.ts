import { writable } from 'svelte/store';
import { account } from '$lib/config/appwrite';
import type { Models } from 'appwrite';

export interface AppUser extends Models.User<Models.Preferences> {
    role: 'admin' | 'teacher' | 'student';
    avatarUrl?: string;
}

interface AuthState {
    user: AppUser | null;
    loading: boolean;
    error: string | null;
}

const createAuthStore = () => {
    const { subscribe, set, update } = writable<AuthState>({
        user: null,
        loading: true,
        error: null
    });

    return {
        subscribe,
        setUser: (user: AppUser | null) => 
            update(state => ({ ...state, user, loading: false })),
        setError: (error: string) => 
            update(state => ({ ...state, error, loading: false })),
        setLoading: (loading: boolean) => 
            update(state => ({ ...state, loading })),
        logout: async () => {
            try {
                await account.deleteSession('current');
                set({ user: null, loading: false, error: null });
            } catch (error) {
                console.error('Logout error:', error);
            }
        },
        reset: () => set({ user: null, loading: false, error: null })
    };
};

export const authStore = createAuthStore(); 