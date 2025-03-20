import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ROUTES, USER_ROLES } from '$lib/config';
import type { User } from '$lib/types';

export async function load({ locals, url }: RequestEvent) {
    // Check if user is authenticated
    const user = locals.user;
    
    if (!user) {
        // If no user is authenticated, redirect to login
        throw redirect(302, `${ROUTES.LOGIN}?redirect=${encodeURIComponent(url.pathname)}`);
    }
    
    // Otherwise, return the authenticated user
    return {
        user
    };
} 