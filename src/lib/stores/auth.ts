import { writable } from 'svelte/store';
import { account, databases, DB_CONFIG } from '$lib/config/appwrite';
import type { User } from '$lib/types';
import { goto } from '$app/navigation';
import { ROUTES, USER_ROLES } from '$lib/config';
import { Query } from 'appwrite';
import { browser } from '$app/environment';

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

    function getDashboardRoute(role: string): string {
        switch (role) {
            case USER_ROLES.ADMIN:
                return ROUTES.ADMIN_DASHBOARD;
            case USER_ROLES.TEACHER:
                return ROUTES.TEACHER_DASHBOARD;
            default:
                return ROUTES.STUDENT_DASHBOARD;
        }
    }

    return {
        subscribe,
        set,
        update,
        getDashboardRoute,
        login: async (email: string, password: string, redirectTo?: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                await account.createEmailSession(email, password);
                const accountDetails = await account.get();
                
                // Get user from database
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    [Query.equal('email', [accountDetails.email])]
                );
                
                const user = response.documents[0] as User;
                if (!user) {
                    throw new Error('User not found in database');
                }

                set({ user, loading: false, error: null });
                
                if (browser) {
                    const route = redirectTo || getDashboardRoute(user.role);
                    await goto(route);
                }
            } catch (error) {
                console.error('Login error:', error);
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to login'
                }));
                throw error;
            }
        },
        register: async (email: string, password: string, name: string, role: keyof typeof USER_ROLES) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                
                // Create account
                const accountResponse = await account.create('unique()', email, password, name);
                
                // Create user document
                const user = await databases.createDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    accountResponse.$id,
                    {
                        userId: accountResponse.$id,
                        email,
                        name,
                        role,
                        availability: []
                    }
                ) as User;

                // Create session
                await account.createEmailSession(email, password);
                
                set({ user, loading: false, error: null });
                
                if (browser) {
                    await goto(getDashboardRoute(user.role));
                }
            } catch (error) {
                console.error('Registration error:', error);
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
                if (browser) {
                    await goto(ROUTES.LOGIN);
                }
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
                
                // Get user from database
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    [Query.equal('email', [accountDetails.email])]
                );
                
                const user = response.documents[0] as User;
                if (!user) {
                    throw new Error('User not found in database');
                }

                set({ user, loading: false, error: null });
                return user;
            } catch (error) {
                set({ user: null, loading: false, error: null });
                return null;
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