import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { ROUTES, USER_ROLES } from '$lib/config';
import type { User } from '$lib/types';

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

function getDashboardRoute(role: keyof typeof USER_ROLES): string {
    switch (role) {
        case USER_ROLES.ADMIN:
            return ROUTES.ADMIN_DASHBOARD;
        case USER_ROLES.TEACHER:
            return ROUTES.TEACHER_DASHBOARD;
        default:
            return ROUTES.STUDENT_DASHBOARD;
    }
}

export async function load({ locals, url }: RequestEvent) {
    const path = url.pathname;
    const user = locals.user as User | null;

    // Handle protected routes
    if (protectedRoutes.some(route => path.startsWith(route))) {
        if (!user) {
            throw redirect(302, `${ROUTES.LOGIN}?redirect=${path}`);
        }

        // Check role-based access
        const allowedRoutes = roleBasedRoutes[user.role as keyof typeof USER_ROLES] || [];
        const hasAccess = allowedRoutes.some((route: string) => path.startsWith(route));

        if (!hasAccess) {
            throw redirect(302, getDashboardRoute(user.role as keyof typeof USER_ROLES));
        }
    }

    // Handle auth routes when user is already logged in
    if ([ROUTES.LOGIN, ROUTES.REGISTER].includes(path) && user && path !== ROUTES.AUTH_CALLBACK) {
        throw redirect(302, getDashboardRoute(user.role as keyof typeof USER_ROLES));
    }

    return {
        user
    };
}; 