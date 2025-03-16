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
    try {
        // Skip authentication for public routes and static assets
        const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback', '/'];
        const isPublicRoute = publicRoutes.some(route => event.url.pathname === route || event.url.pathname.startsWith(route));
        const isStaticAsset = event.url.pathname.startsWith('/assets') || 
                             event.url.pathname.startsWith('/_app') || 
                             event.url.pathname.endsWith('.svg') || 
                             event.url.pathname.endsWith('.png') || 
                             event.url.pathname.endsWith('.jpg') || 
                             event.url.pathname.endsWith('.ico');
        
        if (isPublicRoute || isStaticAsset) {
            event.locals.user = null;
        } else {
            // Try to get the current user
            try {
                const user = await authService.getCurrentUser();
                event.locals.user = user;
                
                // If no user and not on a public route, redirect to login
                if (!user && !isPublicRoute && !isStaticAsset) {
                    const redirectUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(event.url.pathname)}`;
                    return redirect(302, redirectUrl);
                }
            } catch (error) {
                console.error('Error getting user in hooks:', error);
                event.locals.user = null;
                
                // If not on a public route, redirect to login
                if (!isPublicRoute && !isStaticAsset) {
                    const redirectUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(event.url.pathname)}`;
                    return redirect(302, redirectUrl);
                }
            }
        }
    } catch (error) {
        console.error('Error in hooks:', error);
        event.locals.user = null;
    }

    const response = await resolve(event);
    return response;
}; 