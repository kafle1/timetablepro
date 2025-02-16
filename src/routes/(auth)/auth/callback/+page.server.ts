import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { ROUTES } from '$lib/config';

export const load: PageServerLoad = async ({ locals, url }) => {
    try {
        // If there's an error in the URL, redirect to login with error message
        const error = url.searchParams.get('error');
        if (error) {
            throw redirect(303, `${ROUTES.LOGIN}?error=${encodeURIComponent(error)}`);
        }

        // Let the client-side handle the OAuth callback
        return {};
    } catch (error) {
        if (error instanceof Error) {
            throw redirect(303, `${ROUTES.LOGIN}?error=${encodeURIComponent(error.message)}`);
        }
        throw error;
    }
}; 