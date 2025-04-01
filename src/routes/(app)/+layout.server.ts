import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { ROUTES, USER_ROLES } from '$lib/config';

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const { user } = locals;

    // If no user, redirect to login
    if (!user) {
        throw redirect(302, `${ROUTES.LOGIN}?redirect=${encodeURIComponent(url.pathname)}`);
    }

    // Handle role-based redirects
    const path = url.pathname;

    // If accessing root or dashboard, redirect to role-specific dashboard
    if (path === '/' || path === '/dashboard') {
        switch (user.role.toLowerCase()) {
            case 'admin':
                throw redirect(302, ROUTES.ADMIN_DASHBOARD);
            case 'teacher':
                throw redirect(302, ROUTES.TEACHER_DASHBOARD);
            case 'student':
                throw redirect(302, ROUTES.STUDENT_DASHBOARD);
            default:
                throw redirect(302, ROUTES.LOGIN);
        }
    }

    // Validate access to role-specific routes
    if (path.startsWith('/admin/') && user.role.toLowerCase() !== 'admin') {
        switch (user.role.toLowerCase()) {
            case 'teacher':
                throw redirect(302, ROUTES.TEACHER_DASHBOARD);
            case 'student':
                throw redirect(302, ROUTES.STUDENT_DASHBOARD);
            default:
                throw redirect(302, ROUTES.LOGIN);
        }
    }

    if (path.startsWith('/teacher/') && user.role.toLowerCase() !== 'teacher') {
        switch (user.role.toLowerCase()) {
            case 'admin':
                throw redirect(302, ROUTES.ADMIN_DASHBOARD);
            case 'student':
                throw redirect(302, ROUTES.STUDENT_DASHBOARD);
            default:
                throw redirect(302, ROUTES.LOGIN);
        }
    }

    if (path.startsWith('/student/') && user.role.toLowerCase() !== 'student') {
        switch (user.role.toLowerCase()) {
            case 'admin':
                throw redirect(302, ROUTES.ADMIN_DASHBOARD);
            case 'teacher':
                throw redirect(302, ROUTES.TEACHER_DASHBOARD);
            default:
                throw redirect(302, ROUTES.LOGIN);
        }
    }

    return {
        user
    };
}; 