import { writable } from 'svelte/store';
import type { User, UserStore } from '$lib/types';
import { authService } from '$lib/services/auth';
import { browser } from '$app/environment';

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
        
        if (user) {
          set({ user, loading: false, error: null });
        } else {
          set({ user: null, loading: false, error: null });
        }
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
        const user = await authService.createAccount({
          email,
          password,
          name,
          role: role as any
        });
        
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
     * Update the current user
     */
    updateUser: async (userId: string, userData: any) => {
      update(state => ({ ...state, loading: true }));
      
      try {
        const updatedUser = await authService.updateUser(userId, userData);
        
        update(state => ({
          ...state,
          user: updatedUser,
          loading: false
        }));
        
        return updatedUser;
      } catch (error: any) {
        console.error('Update user error:', error);
        update(state => ({ ...state, loading: false, error: error.message || 'Update failed' }));
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