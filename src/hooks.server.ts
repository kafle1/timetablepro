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

// Define protected routes and public routes
const publicRoutes = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    '/auth/callback',
    '/',
    '/favicon.ico',
    '/assets',
    '/api'
];

// Check if the current path is a public route
function isPublicRoute(path: string): boolean {
    return publicRoutes.some(route => path === route || path.startsWith(route));
}

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.user = null;
    const sessionCookie = event.cookies.get('cookieFallback');
    const path = event.url.pathname;
    
    // If it's a public route, we don't need to check authentication
    if (isPublicRoute(path)) {
        return await resolve(event);
    }
    
    try {
        // Check if there's a valid session
        if (sessionCookie) {
            const user = await authService.getCurrentUser();
            if (user) {
                event.locals.user = user;
            } else {
                throw new Error('No valid user session');
            }
        } else {
            throw new Error('No session cookie');
        }
    } catch (error) {
        // If not authenticated and trying to access a protected route, redirect to login
        if (!isPublicRoute(path)) {
            redirect(302, `${ROUTES.LOGIN}?redirect=${encodeURIComponent(path)}`);
        }
    }
    
    const response = await resolve(event);
    return response;
}; 