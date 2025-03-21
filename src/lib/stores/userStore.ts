import { writable } from 'svelte/store';
import type { User, UserStore } from '$lib/types';
import { authService } from '$lib/services/auth';
import { browser } from '$app/environment';
import { USER_ROLES } from '$lib/config';

// Initial state
const initialState: UserStore = {
  user: null,
  loading: false,
  error: null
};

function createUserStore() {
  const { subscribe, set, update } = writable<UserStore>(initialState);
  
  return {
    subscribe,
    
    /**
     * Initialize the user store
     */
    init: async () => {
      if (!browser) return;
      
      update(state => ({ ...state, loading: true }));
      
      try {
        const user = await authService.getCurrentUser();
        set({ user, loading: false, error: null });
      } catch (error: any) {
        console.error('Error initializing user store:', error);
        set({ user: null, loading: false, error: error.message || 'Failed to load user' });
      }
    },
    
    /**
     * Login a user
     */
    login: async (email: string, password: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const user = await authService.login(email, password);
        set({ user, loading: false, error: null });
        return user;
      } catch (error: any) {
        console.error('Login error:', error);
        set({ user: null, loading: false, error: error.message || 'Login failed' });
        throw error;
      }
    },
    
    /**
     * Register a new user
     */
    register: async (email: string, password: string, name: string, role: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        // Convert string role to the proper type using USER_ROLES
        let userRole;
        switch(role) {
          case 'admin':
            userRole = USER_ROLES.ADMIN;
            break;
          case 'teacher':
            userRole = USER_ROLES.TEACHER;
            break;
          default:
            userRole = USER_ROLES.STUDENT;
        }
        
        const user = await authService.register(email, password, name, userRole);
        set({ user, loading: false, error: null });
        return user;
      } catch (error: any) {
        console.error('Registration error:', error);
        set({ user: null, loading: false, error: error.message || 'Registration failed' });
        throw error;
      }
    },
    
    /**
     * Logout the current user
     */
    logout: async () => {
      update(state => ({ ...state, loading: true }));
      
      try {
        await authService.logout();
        set({ user: null, loading: false, error: null });
      } catch (error: any) {
        console.error('Logout error:', error);
        update(state => ({ ...state, loading: false, error: error.message || 'Logout failed' }));
        throw error;
      }
    },
    
    /**
     * Reset the error state
     */
    resetError: () => {
      update(state => ({ ...state, error: null }));
    },
    
    /**
     * Set the user manually (useful for testing)
     */
    setUser: (user: User | null) => {
      update(state => ({ ...state, user }));
    }
  };
}

export const userStore = createUserStore(); 