import { redirect, type Handle } from '@sveltejs/kit';
import { authService } from '$lib/services/auth';
import type { User } from '$lib/types';

declare global {
    namespace App {
        interface Locals {
            user: User | null;
        }
    }
}

export const handle: Handle = async ({ event, resolve }) => {
    try {
        // Try to get the current user
        const user = await authService.getCurrentUser();
        event.locals.user = user;
    } catch (error) {
        console.error('Error getting user in hooks:', error);
        event.locals.user = null;
    }

    const response = await resolve(event);
    return response;
}; 