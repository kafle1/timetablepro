import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { ROUTES } from '$lib/config';
import { authService } from '$lib/services/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
    try {
        // If there's an error in the URL, log it but don't redirect
        const error = url.searchParams.get('error');
        if (error) {
            console.error(`Auth error: ${error}`);
        }

        // Get the user from the session
        const user = await authService.getCurrentUser();
        
        // Return user data without redirecting
        return {
            user,
            error
        };
    } catch (error) {
        console.error('Auth callback error:', error);
        return {
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}; 