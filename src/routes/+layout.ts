import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { ROUTES, USER_ROLES } from '$lib/config';
import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';

const protectedRoutes = [
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.TEACHER_DASHBOARD,
    ROUTES.STUDENT_DASHBOARD,
    ROUTES.PROFILE,
    ROUTES.SETTINGS,
    ROUTES.ROOMS,
    ROUTES.SCHEDULES,
    ROUTES.TEACHERS,
    ROUTES.STUDENTS,
    ROUTES.AVAILABILITY
];

const roleBasedRoutes = {
    [USER_ROLES.ADMIN]: ['/admin', '/rooms', '/schedules', '/teachers', '/students'],
    [USER_ROLES.TEACHER]: ['/teacher', '/schedules', '/availability'],
    [USER_ROLES.STUDENT]: ['/student', '/schedules']
};

export const load: LayoutLoad = async ({ url }) => {
    const { user } = get(authStore);
    const path = url.pathname;

    // Handle protected routes
    if (protectedRoutes.some(route => path.startsWith(route))) {
        if (!user) {
            throw redirect(302, `${ROUTES.LOGIN}?redirect=${path}`);
        }

        // Check role-based access
        const allowedRoutes = roleBasedRoutes[user.role] || [];
        const hasAccess = allowedRoutes.some(route => path.startsWith(route));

        if (!hasAccess) {
            // Redirect to appropriate dashboard based on role
            switch (user.role) {
                case USER_ROLES.ADMIN:
                    throw redirect(302, ROUTES.ADMIN_DASHBOARD);
                case USER_ROLES.TEACHER:
                    throw redirect(302, ROUTES.TEACHER_DASHBOARD);
                default:
                    throw redirect(302, ROUTES.STUDENT_DASHBOARD);
            }
        }
    }

    return {
        user
    };
}; 