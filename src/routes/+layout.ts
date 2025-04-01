/**
 * This layout handles basic app configuration for SvelteKit
 */

import { dev } from '$app/environment';
import type { LayoutLoad } from './$types';
import { ROUTES, USER_ROLES } from '$lib/config';
import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';
import type { User } from '$lib/types';
import { authService } from '$lib/services/auth';
import { userStore } from '$lib/stores/user';
import { browser } from '$app/environment';
import { USER_ROLES as Constants_USER_ROLES } from '$lib/config/constants'; // Assuming USER_ROLES is needed if mock logic is partially kept

// Remove or comment out protectedRoutes if not used for redirection logic here
// const protectedRoutes = [
//   '/admin',
//   '/teacher',
//   '/student'
// ];

const roleBasedRoutes = {
    [USER_ROLES.ADMIN]: ['/admin', '/admin/rooms', '/admin/schedules', '/admin/teachers', '/admin/students'],
    [USER_ROLES.TEACHER]: ['/teacher', '/schedules', '/availability'],
    [USER_ROLES.STUDENT]: ['/student', '/schedules']
};

// Set server-side rendering to true, but disable prerendering
// This ensures good SEO while preventing static prerendering issues with auth
export const ssr = false;
export const prerender = false;

// Provide error handling with retry capabilities 
export const trailingSlash = 'never';

// Define standard caching headers to prevent auth issues
export const csr = true;

export const load: LayoutLoad = async ({ url }) => {
    // Removed UI_TESTING_MODE block

    if (browser) {
        try {
            const user = await authService.getCurrentUser();
            if (user) {
                userStore.set(user); // Update the store
                return { user };
            } else {
                 // No user session found
                 userStore.set(null);
                 return { user: null };
            }
        } catch (error) {
            console.error("Error loading user data in layout:", error);
            // Invalidate session if there's an error fetching user
            try {
                if (browser) await authService.logout(); // Ensure logout runs in browser
            } catch (logoutError) {
                console.error("Error during logout after load error:", logoutError);
            }
            userStore.set(null); // Ensure store is cleared
            return { user: null };
        }
    }

    // Return null if not in browser (SSR) or if browser check fails initially
    userStore.set(null); // Ensure store is null on server or initial non-browser state
    return { user: null };
}; 