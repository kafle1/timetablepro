import { writable, get } from 'svelte/store';
import type { User } from '$lib/types';
import { goto } from '$app/navigation';
import { ROUTES, USER_ROLES } from '$lib/config';
import { browser } from '$app/environment';
import { authService } from '$lib/services/auth';

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
                
                const user = await authService.login(email, password);
                
                set({ user, loading: false, error: null });
                
                // Reset any redirect loop counters
                if (browser) {
                    try {
                        document.cookie = 'redirect_count=0; path=/;';
                    } catch (e) {
                        console.error('Error resetting redirect cookie:', e);
                    }
                }
                
                // Redirect based on user role
                if (browser) {
                    const dashboardRoute = redirectTo || getDashboardRoute(user.role);
                    
                    // Add cache busting parameter to prevent caching
                    const redirectUrl = new URL(dashboardRoute, window.location.origin);
                    redirectUrl.searchParams.set('_t', Date.now().toString());
                    
                    window.location.href = redirectUrl.toString();
                }
                
                return user;
            } catch (error: any) {
                console.error('Login error:', error);
                update(state => ({ 
                    ...state, 
                    loading: false, 
                    error: error.message || 'Login failed. Please try again.'
                }));
                throw error;
            }
        },
        
        register: async (email: string, password: string, name: string, role: keyof typeof USER_ROLES) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                
                const user = await authService.register(email, password, name, role);
                
                set({ user, loading: false, error: null });
                
                return user;
            } catch (error: any) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.message || 'Registration failed. Please try again.'
                }));
                throw error;
            }
        },
        
        logout: async () => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                
                await authService.logout();
                
                set({ user: null, loading: false, error: null });
                
                if (browser) {
                    window.location.href = ROUTES.LOGIN;
                }
            } catch (error: any) {
                update(state => ({ 
                    ...state, 
                    loading: false, 
                    error: error.message || 'Logout failed. Please try again.'
                }));
            }
        },
        
        loadUser: async () => {
            try {
                    update(state => ({ ...state, loading: true, error: null }));
                
                const user = await authService.getCurrentUser();
                
                set({ user, loading: false, error: null });
                
                        return user;
            } catch (error: any) {
                update(state => ({ 
                    ...state, 
                    loading: false,
                    error: null
                }));
                return null;
            }
        },
        
        resetPassword: async (email: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                
                await authService.sendPasswordReset(email);
                
                update(state => ({ ...state, loading: false, error: null }));
            } catch (error: any) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error.message || 'Password reset failed. Please try again.'
                }));
                throw error;
            }
        }
    };
}

export const authStore = createAuthStore(); 