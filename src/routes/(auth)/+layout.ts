import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { ROUTES } from '$lib/config';
import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';

export const load: LayoutLoad = async ({ url }) => {
    // List of valid auth routes
    const validAuthRoutes = [
        ROUTES.LOGIN.replace('/(auth)', ''),
        ROUTES.REGISTER.replace('/(auth)', ''),
        ROUTES.AUTH_CALLBACK.replace('/(auth)', '')
    ];

    // Check if current path is a valid auth route
    const isValidAuthRoute = validAuthRoutes.some(route => url.pathname === route);
    
    if (!isValidAuthRoute) {
        throw redirect(307, ROUTES.LOGIN);
    }

    // Get current user state
    const { user } = get(authStore);

    // If user is already logged in and trying to access auth routes, redirect to appropriate dashboard
    if (user && url.pathname !== ROUTES.AUTH_CALLBACK) {
        switch (user.role) {
            case 'ADMIN':
                throw redirect(302, ROUTES.ADMIN_DASHBOARD);
            case 'TEACHER':
                throw redirect(302, ROUTES.TEACHER_DASHBOARD);
            default:
                throw redirect(302, ROUTES.STUDENT_DASHBOARD);
        }
    }

    return {
        user
    };
}; 