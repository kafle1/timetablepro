import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { ROUTES } from '$lib/config';

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

    return {};
}; 