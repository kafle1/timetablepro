/**
 * This layout handles basic app configuration for SvelteKit
 */

import { dev } from '$app/environment';
import type { LayoutLoad } from './$types';
import { ROUTES, USER_ROLES } from '$lib/config';
import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';
import type { User } from '$lib/types';

const protectedRoutes = [
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.TEACHER_DASHBOARD,
    ROUTES.STUDENT_DASHBOARD,
    ROUTES.PROFILE,
    ROUTES.SETTINGS,
    ROUTES.ROOMS,
    ROUTES.SCHEDULES,
    ROUTES.TEACHERS,
    ROUTES.STUDENTS,
    ROUTES.AVAILABILITY
];

const roleBasedRoutes = {
    [USER_ROLES.ADMIN]: ['/admin', '/admin/rooms', '/admin/schedules', '/admin/teachers', '/admin/students'],
    [USER_ROLES.TEACHER]: ['/teacher', '/schedules', '/availability'],
    [USER_ROLES.STUDENT]: ['/student', '/schedules']
};

// Set server-side rendering to true, but disable prerendering
// This ensures good SEO while preventing static prerendering issues with auth
export const ssr = true;
export const prerender = false;

// Provide error handling with retry capabilities 
export const trailingSlash = 'never';

// Define standard caching headers to prevent auth issues
export const csr = true;

export const load: LayoutLoad = async ({ url }) => {
    // UI Testing Mode - Always return a mock admin user
    const mockUser: User = {
        $id: 'test-admin',
        userId: 'test-admin',
        email: 'admin@timetablepro.com',
        name: 'Admin User',
        role: USER_ROLES.ADMIN,
        isActive: true,
        emailVerified: true,
        preferences: {},
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        $collectionId: 'users',
        $databaseId: 'timetablepro',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: []
    };

    return {
        user: mockUser
    };
}; 