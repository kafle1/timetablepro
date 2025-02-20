import { writable } from 'svelte/store';
import { account } from '$lib/config/appwrite';
import type { User } from '$lib/types';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

function createAuthStore() {
    const { subscribe, set, update } = writable<AuthState>({
        user: null,
        loading: false,
        error: null
    });

    return {
        subscribe,
        set,
        update,
        login: async (email: string, password: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                await account.createEmailSession(email, password);
                const accountDetails = await account.get();
                const response = await fetch(`/api/users?email=${accountDetails.email}`);
                const user = await response.json();
                set({ user, loading: false, error: null });
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to login'
                }));
                throw error;
            }
        },
        register: async (email: string, password: string, name: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                await account.create('unique()', email, password, name);
                await account.createEmailSession(email, password);
                const accountDetails = await account.get();
                const response = await fetch(`/api/users?email=${accountDetails.email}`);
                const user = await response.json();
                set({ user, loading: false, error: null });
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to register'
                }));
                throw error;
            }
        },
        logout: async () => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                await account.deleteSession('current');
                set({ user: null, loading: false, error: null });
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to logout'
                }));
                throw error;
            }
        },
        checkSession: async () => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const accountDetails = await account.get();
                const response = await fetch(`/api/users?email=${accountDetails.email}`);
                const user = await response.json();
                set({ user, loading: false, error: null });
            } catch (error) {
                set({ user: null, loading: false, error: null });
            }
        },
        updateProfile: async (name: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const user = await account.updateName(name);
                set({ user, loading: false, error: null });
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update profile'
                }));
                throw error;
            }
        }
    };
}

export const authStore = createAuthStore(); 