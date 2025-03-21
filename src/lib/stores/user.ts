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
    // Start with a mock user to prevent auth issues
    const mockUser = createMockUser();
    const { subscribe, set, update } = writable<User | null>(mockUser);
    
    // Try to get type from session storage if available
    if (browser) {
        const userType = sessionStorage?.getItem('ui_testing_user_type');
        if (userType) {
            const role = userType.toUpperCase();
            set(createMockUser(role));
            console.log(`Initialized user store with role: ${role}`);
        }
    }

    return {
        subscribe,
        set: (user: User | null) => {
            try {
                set(user);
                if (browser && user) {
                    console.log(`User set in store: ${user.email}`);
                }
            } catch (error) {
                console.error("Error setting user:", error);
                set(mockUser);
            }
        },
        update,
        reset: async () => {
            try {
                if (browser) {
                    // Clear cookies and storage
                    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
                    document.cookie = 'ui_testing_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    document.cookie = 'auth_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    sessionStorage.removeItem('ui_testing_auth_token');
                    sessionStorage.removeItem('ui_testing_user_type');
                    
                    // Call auth service logout
                    await authService.logout();
                }
                // Set back to default mock user
                set(mockUser);
                return true;
            } catch (error) {
                console.error("Error during logout:", error);
                return false;
            }
        },
        
        // Simplified init method that won't cause redirect loops
        init: async () => {
            if (!browser) return mockUser;
            
            try {
                // Check if we have a user type in session storage
                const userType = sessionStorage?.getItem('ui_testing_user_type');
                if (userType) {
                    const role = userType.toUpperCase();
                    const user = createMockUser(role);
                    set(user);
                    return user;
                }
                
                // Default to mock user
                set(mockUser);
                return mockUser;
            } catch (error) {
                console.error('Error loading user:', error);
                // Set to mock user on error
                set(mockUser);
                return mockUser;
            }
        }
    };
}

export const userStore = createUserStore(); 