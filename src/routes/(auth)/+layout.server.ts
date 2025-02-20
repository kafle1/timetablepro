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
    // List of valid auth routes
    const validAuthRoutes = [
        ROUTES.LOGIN,
        ROUTES.REGISTER,
        ROUTES.AUTH_CALLBACK
    ];

    // Check if current path is a valid auth route
    const isValidAuthRoute = validAuthRoutes.includes(url.pathname as typeof ROUTES.LOGIN);
    
    if (!isValidAuthRoute) {
        throw redirect(307, ROUTES.LOGIN);
    }

    // Get current user state
    const user = locals.user as User | null;

    // If user is already logged in and trying to access auth routes, redirect to appropriate dashboard
    if (user && url.pathname !== ROUTES.AUTH_CALLBACK) {
        throw redirect(302, getDashboardRoute(user.role as keyof typeof USER_ROLES));
    }

    return {
        user
    };
}; 