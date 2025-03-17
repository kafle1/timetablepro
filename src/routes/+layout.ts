import { redirect } from '@sveltejs/kit';
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
    [USER_ROLES.ADMIN]: ['/admin', '/rooms', '/schedules', '/teachers', '/students'],
    [USER_ROLES.TEACHER]: ['/teacher', '/schedules', '/availability'],
    [USER_ROLES.STUDENT]: ['/student', '/schedules']
};

export const load: LayoutLoad = async ({ url }) => {
    // UI Testing Mode - Always return a mock admin user
    const mockUser: User = {
        $id: 'mock-admin',
        userId: 'mock-admin',
        email: 'admin@timetablepro.com',
        name: 'Admin User',
        role: 'ADMIN',
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
    };

    return {
        user: mockUser
    };
}; 