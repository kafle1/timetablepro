import { writable } from 'svelte/store';
import { account } from '$lib/config/appwrite';
import type { Models } from 'appwrite';

interface AuthState {
    user: Models.User<Models.Preferences> | null;
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
        login: async (email: string, password: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                await account.createEmailSession(email, password);
                const user = await account.get();
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
                const user = await account.get();
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
                const user = await account.get();
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
};

export const authStore = createAuthStore(); 