import { writable } from 'svelte/store';
import type { User } from '$lib/types';
import { authService } from '$lib/services/auth';
import { browser } from '$app/environment';

// Create a mock user for development/testing
const createMockUser = (role = 'ADMIN'): User => {
    return {
        $id: `mock-${role.toLowerCase()}`,
        userId: `mock-${role.toLowerCase()}`,
        email: `${role.toLowerCase()}@timetablepro.com`,
        name: `${role} User`,
        role: role as any,
        isActive: true,
        emailVerified: true,
        preferences: {},
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        $collectionId: 'users',
        $databaseId: 'default',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: []
    } as User;
};

function createUserStore() {
    const { subscribe, set, update } = writable<User | null>(null);
    
    return {
        subscribe,
        set,
        update,
        
        init: async () => {
            if (!browser) return null;
            
            try {
                const user = await authService.getCurrentUser();
                set(user);
                return user;
            } catch (error) {
                console.error('Error initializing user store:', error);
                set(null);
                return null;
            }
        },
        
        reset: async () => {
            try {
                if (browser) {
                    await authService.logout();
                }
                set(null);
                return true;
            } catch (error) {
                console.error('Error during logout:', error);
                return false;
            }
        }
    };
}

export const userStore = createUserStore(); 