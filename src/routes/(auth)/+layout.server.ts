import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ROUTES, USER_ROLES } from '$lib/config';
import type { User } from '$lib/types';

function getDashboardRoute(role: keyof typeof USER_ROLES): string {
    switch (role) {
        case USER_ROLES.ADMIN:
            return ROUTES.ADMIN_DASHBOARD;
        case USER_ROLES.TEACHER:
            return ROUTES.TEACHER_DASHBOARD;
        default:
            return ROUTES.STUDENT_DASHBOARD;
    }
}

export async function load({ locals, url }: RequestEvent) {
    // Always return a mock admin user for UI testing
    return {
        user: {
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
        }
    };
} 