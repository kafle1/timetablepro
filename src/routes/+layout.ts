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
    // Only run on client side
    if (!browser) {
        return {
            user: null,
            url: url.pathname
        };
    }

    try {
        // Get current user
        const user = await authService.getCurrentUser();
        
        // Update user store
        userStore.set(user);

        return {
            user,
            url: url.pathname
        };
    } catch (error) {
        console.error('Error loading user:', error);
        userStore.set(null);
        return {
            user: null,
            url: url.pathname
        };
    }
}; 