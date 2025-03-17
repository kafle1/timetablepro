import { redirect, type Handle } from '@sveltejs/kit';
import { authService } from '$lib/services/auth';
import type { User } from '$lib/types';
import { ROUTES } from '$lib/config';

declare global {
    namespace App {
        interface Locals {
            user: User | null;
        }
    }
}

export const handle: Handle = async ({ event, resolve }) => {
    // BYPASS ALL AUTHENTICATION - Provide a mock admin user for all routes
    const mockAdminUser = {
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
    } as User;
    
    // Set the mock user for all routes
    event.locals.user = mockAdminUser;

    const response = await resolve(event);
    return response;
}; 