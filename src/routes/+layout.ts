import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { userStore } from '$lib/stores/user';
import { ROUTES, USER_ROLES } from '$lib/config';
import { get } from 'svelte/store';

const protectedRoutes = [
    ROUTES.ADMIN_DASHBOARD,
    ROUTES.TEACHER_DASHBOARD,
    ROUTES.STUDENT_DASHBOARD,
    ROUTES.PROFILE,
    ROUTES.SETTINGS
];

const roleBasedRoutes = {
    [USER_ROLES.ADMIN]: [ROUTES.ADMIN_DASHBOARD],
    [USER_ROLES.TEACHER]: [ROUTES.TEACHER_DASHBOARD],
    [USER_ROLES.STUDENT]: [ROUTES.STUDENT_DASHBOARD]
};

export const load: LayoutLoad = async ({ url }) => {
    const user = get(userStore);
    const path = url.pathname;

    // Handle protected routes
    if (protectedRoutes.includes(path)) {
        if (!user) {
            throw redirect(302, ROUTES.LOGIN);
        }

        // Check role-based access
        const allowedRoutes = roleBasedRoutes[user.role] || [];
        if (path.startsWith('/dashboard') && !allowedRoutes.includes(path)) {
            // Redirect to appropriate dashboard based on role
            switch (user.role) {
                case USER_ROLES.ADMIN:
                    throw redirect(302, ROUTES.ADMIN_DASHBOARD);
                case USER_ROLES.TEACHER:
                    throw redirect(302, ROUTES.TEACHER_DASHBOARD);
                case USER_ROLES.STUDENT:
                    throw redirect(302, ROUTES.STUDENT_DASHBOARD);
                default:
                    throw redirect(302, ROUTES.HOME);
            }
        }
    }

    // Handle auth routes when user is already logged in
    if ([ROUTES.LOGIN, ROUTES.REGISTER].includes(path) && user) {
        // Redirect to appropriate dashboard based on role
        switch (user.role) {
            case USER_ROLES.ADMIN:
                throw redirect(302, ROUTES.ADMIN_DASHBOARD);
            case USER_ROLES.TEACHER:
                throw redirect(302, ROUTES.TEACHER_DASHBOARD);
            case USER_ROLES.STUDENT:
                throw redirect(302, ROUTES.STUDENT_DASHBOARD);
            default:
                throw redirect(302, ROUTES.HOME);
        }
    }

    return {
        user
    };
}; 