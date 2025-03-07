import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ROUTES } from '$lib/config';

export const load: PageServerLoad = async () => {
    throw redirect(302, ROUTES.STUDENT_DASHBOARD);
}; 