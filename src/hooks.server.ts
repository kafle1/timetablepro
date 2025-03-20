import { redirect, type Handle } from '@sveltejs/kit';
import { authService } from '$lib/services/auth';
import type { User } from '$lib/types';
import { ROUTES, USER_ROLES } from '$lib/config';

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

// Helper function for debugging
function logDebug(message: string, ...data: any[]) {
    console.log(`[Server Hooks] ${message}`, ...data);
}

// Check if the current path is a public route
function isPublicRoute(path: string): boolean {
    return publicRoutes.some(route => path === route || path.startsWith(route));
}

// Special handling for the root path "/"
function isHomePage(path: string): boolean {
    return path === '/';
}

// Get the appropriate dashboard route based on user role
function getDashboardRoute(role: string): string {
    switch (role) {
        case USER_ROLES.ADMIN:
            return ROUTES.ADMIN_DASHBOARD;
        case USER_ROLES.TEACHER:
            return ROUTES.TEACHER_DASHBOARD;
        default:
            return ROUTES.STUDENT_DASHBOARD;
    }
}

export const handle: Handle = async ({ event, resolve }) => {
    // Initialize user to null
    event.locals.user = null;
    const path = event.url.pathname;
    const cookies = event.request.headers.get('cookie') || '';
    
    logDebug(`Request path: ${path}`, { 
        hasAuthCookie: cookies.includes('cookieFallback'),
        requestHeaders: Object.fromEntries(event.request.headers)
    });
    
    // Allow public routes without authentication checks
    if (isPublicRoute(path) && !isHomePage(path)) {
        logDebug(`Public route access: ${path}`);
        return await resolve(event);
    }
    
    try {
        // Check for authentication
        logDebug(`Checking authentication for path: ${path}`);
        const user = await authService.getCurrentUser();
        
        if (user) {
            // Set user in locals if authenticated
            logDebug(`User authenticated: ${user.email} (${user.role})`);
            event.locals.user = user;
            
            // If authenticated user tries to access login/register, redirect to dashboard
            if ((path === ROUTES.LOGIN || path === ROUTES.REGISTER) && user) {
                const dashboardRoute = getDashboardRoute(user.role);
                logDebug(`Redirecting authenticated user from ${path} to ${dashboardRoute}`);
                redirect(302, dashboardRoute);
            }
        } else {
            // No valid user, throw error to trigger redirect for protected routes
            logDebug(`No valid user session found`);
            if (!isPublicRoute(path)) {
                throw new Error('No valid user session');
            }
        }
    } catch (error) {
        // If not authenticated and trying to access a protected route, redirect to login
        if (!isPublicRoute(path)) {
            logDebug(`Authentication error for ${path}:`, error);
            logDebug(`Redirecting unauthenticated request from ${path} to login`);
            redirect(302, `${ROUTES.LOGIN}?redirect=${encodeURIComponent(path)}`);
        }
    }
    
    // Get the response
    logDebug(`Resolving request for ${path}`);
    const response = await resolve(event);
    
    // Log response status
    logDebug(`Response for ${path}: ${response.status}`);
    
    return response;
}; 