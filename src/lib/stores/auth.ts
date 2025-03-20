import { writable, get } from 'svelte/store';
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
                
                // Special handling for test accounts
                const testCredentials: Record<string, { role: string; name: string }> = {
                    'admin@timetablepro.com': { role: 'ADMIN', name: 'Admin User' },
                    'teacher@timetablepro.com': { role: 'TEACHER', name: 'Teacher User' },
                    'student@timetablepro.com': { role: 'STUDENT', name: 'Student User' }
                };
                
                let user: User;
                
                // Check if using test credentials
                if (email in testCredentials && password === (email === 'admin@timetablepro.com' ? 'Admin@123' : 
                                                             email === 'teacher@timetablepro.com' ? 'Teacher@123' : 'Student@123')) {
                    // Clear any existing sessions to prevent conflicts
                    if (browser) {
                        try {
                            if (localStorage.getItem('cookieFallback')) {
                                await account.deleteSession('current');
                                localStorage.removeItem('cookieFallback');
                            }
                        } catch (e) {
                            // Ignore errors when clearing existing sessions
                            console.log('Error clearing existing session:', e);
                        }
                    }
                    
                    // Create a mock user for test accounts
                    const mockUser = {
                        $id: `test-${testCredentials[email].role.toLowerCase()}`,
                        userId: `test-${testCredentials[email].role.toLowerCase()}`,
                        email: email,
                        name: testCredentials[email].name,
                        role: testCredentials[email].role,
                        isActive: true,
                        emailVerified: true,
                        preferences: {},
                        createdAt: new Date().toISOString(),
                        lastLoginAt: new Date().toISOString(),
                        // Add required Appwrite properties
                        $collectionId: DB_CONFIG.collections.USERS,
                        $databaseId: DB_CONFIG.databaseId,
                        $createdAt: new Date().toISOString(),
                        $updatedAt: new Date().toISOString(),
                        $permissions: []
                    } as unknown as User;
                    
                    // Create a custom session token for our mock authentication
                    const mockSessionToken = btoa(JSON.stringify({
                        userId: mockUser.$id,
                        email: mockUser.email,
                        exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days expiry
                    }));
                    
                    // Store mock user data in localStorage
                    if (browser) {
                        localStorage.setItem('currentUser', JSON.stringify(mockUser));
                        localStorage.setItem('mockSessionToken', mockSessionToken);
                    }
                    
                    user = mockUser;
                    
                    // Update store state
                    set({ user, loading: false, error: null });
                    
                    // Manually redirect to the appropriate dashboard
                    if (browser) {
                        console.log('Redirecting to dashboard for role:', user.role);
                        const dashboardRoute = getDashboardRoute(user.role);
                        goto(dashboardRoute);
                    }
                    
                    return user;
                } else {
                    // Regular login flow
                    await account.createEmailSession(email, password);
                    const accountDetails = await account.get();
                    
                    // Get user from database
                    const response = await databases.listDocuments(
                        DB_CONFIG.databaseId,
                        DB_CONFIG.collections.USERS,
                        [Query.equal('email', [accountDetails.email])]
                    );
                    
                    if (response.documents.length === 0) {
                        throw new Error('User not found in database');
                    }
                    
                    user = response.documents[0] as unknown as User;
                    set({ user, loading: false, error: null });
                    
                    // Redirect based on user role
                    if (browser) {
                        console.log('Redirecting to dashboard for role:', user.role);
                        const dashboardRoute = getDashboardRoute(user.role);
                        goto(dashboardRoute);
                    }
                    
                    return user;
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
                
                // Redirect to appropriate dashboard based on role
                if (browser) {
                    const dashboardRoute = getDashboardRoute(role);
                    goto(dashboardRoute);
                }
                
                return user;
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
                
                // Check for mock session and standard session
                const hasMockSession = browser && localStorage.getItem('mockSessionToken') !== null;
                const hasSession = browser && localStorage.getItem('cookieFallback') !== null;
                
                if (hasSession) {
                    try {
                        await account.deleteSession('current');
                    } catch (error) {
                        console.error('Error deleting session:', error);
                    }
                }
                
                // Clear all authentication data
                if (browser) {
                    localStorage.removeItem('cookieFallback');
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('mockSessionToken');
                }
                
                set({ user: null, loading: false, error: null });
                
                if (browser) {
                    goto(ROUTES.LOGIN + '?success=logout');
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
                
                // Check for mock session first (for test accounts)
                if (browser) {
                    const mockSessionToken = localStorage.getItem('mockSessionToken');
                    const storedUser = localStorage.getItem('currentUser');
                    
                    if (mockSessionToken && storedUser) {
                        try {
                            // Verify the mock session token
                            const mockSession = JSON.parse(atob(mockSessionToken));
                            if (mockSession.exp > Date.now()) {
                                const user = JSON.parse(storedUser) as unknown as User;
                                set({ user, loading: false, error: null });
                                return user;
                            } else {
                                // Clear expired session
                                localStorage.removeItem('mockSessionToken');
                                localStorage.removeItem('currentUser');
                            }
                        } catch (e) {
                            console.error('Error parsing mock session:', e);
                            localStorage.removeItem('mockSessionToken');
                            localStorage.removeItem('currentUser');
                        }
                    }
                }
                
                // Check for standard Appwrite session
                const accountDetails = await account.get();
                
                // Get user from database
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    [Query.equal('email', [accountDetails.email])]
                );
                
                if (response.documents.length === 0) {
                    throw new Error('User not found in database');
                }
                
                const user = response.documents[0] as unknown as User;
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
                await account.updateName(name);
                
                // Get current user from state
                const currentUser = await account.get();
                
                // Update the user in the database
                if (currentUser && currentUser.email) {
                    // Get user from database
                    const response = await databases.listDocuments(
                        DB_CONFIG.databaseId,
                        DB_CONFIG.collections.USERS,
                        [Query.equal('email', [currentUser.email])]
                    );
                    
                    if (response.documents.length > 0) {
                        const user = response.documents[0] as unknown as User;
                        // Update the user's name
                        const updatedUser = await databases.updateDocument(
                            DB_CONFIG.databaseId,
                            DB_CONFIG.collections.USERS,
                            user.$id,
                            { name }
                        ) as unknown as User;
                        
                        set({ user: updatedUser, loading: false, error: null });
                        return updatedUser;
                    }
                }
                
                throw new Error('Failed to update profile');
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