import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { ROUTES } from '$lib/config';
import { authService } from '$lib/services/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
    try {
        // If there's an error in the URL, redirect to login with error message
        const error = url.searchParams.get('error');
        if (error) {
            throw redirect(303, `${ROUTES.LOGIN}?error=${encodeURIComponent(error)}`);
        }

        // Get the user from the session
        const user = await authService.getCurrentUser();
        if (user) {
            // Redirect to appropriate dashboard based on role
            switch (user.role) {
                case 'ADMIN':
                    throw redirect(303, ROUTES.ADMIN_DASHBOARD);
                case 'TEACHER':
                    throw redirect(303, ROUTES.TEACHER_DASHBOARD);
                default:
                    throw redirect(303, ROUTES.STUDENT_DASHBOARD);
            }
        }

        // Let the client-side handle the OAuth callback if no user is found
        return {};
    } catch (error) {
        if (error instanceof Error) {
            throw redirect(303, `${ROUTES.LOGIN}?error=${encodeURIComponent(error.message)}`);
        }
        throw error;
    }
}; 