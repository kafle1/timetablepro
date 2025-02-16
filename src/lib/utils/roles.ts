export type UserRole = 'admin' | 'teacher' | 'student';

export const ROLES = {
    ADMIN: 'admin' as const,
    TEACHER: 'teacher' as const,
    STUDENT: 'student' as const
};

export const PERMISSIONS = {
    VIEW_SCHEDULE: 'view_schedule',
    CREATE_SCHEDULE: 'create_schedule',
    EDIT_SCHEDULE: 'edit_schedule',
    DELETE_SCHEDULE: 'delete_schedule',
    MANAGE_ROOMS: 'manage_rooms',
    MANAGE_TEACHERS: 'manage_teachers',
    MANAGE_STUDENTS: 'manage_students',
    VIEW_ANALYTICS: 'view_analytics',
    VIEW_AVAILABILITY: 'view_availability',
    EDIT_AVAILABILITY: 'edit_availability',
    VIEW_ROOMS: 'view_rooms'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [ROLES.ADMIN]: [
        PERMISSIONS.VIEW_SCHEDULE,
        PERMISSIONS.CREATE_SCHEDULE,
        PERMISSIONS.EDIT_SCHEDULE,
        PERMISSIONS.DELETE_SCHEDULE,
        PERMISSIONS.MANAGE_ROOMS,
        PERMISSIONS.MANAGE_TEACHERS,
        PERMISSIONS.MANAGE_STUDENTS,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.TEACHER]: [
        PERMISSIONS.VIEW_SCHEDULE,
        PERMISSIONS.VIEW_AVAILABILITY,
        PERMISSIONS.EDIT_AVAILABILITY,
        PERMISSIONS.VIEW_ROOMS
    ],
    [ROLES.STUDENT]: [
        PERMISSIONS.VIEW_SCHEDULE
    ]
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

export function getRoleLabel(role: UserRole): string {
    return {
        [ROLES.ADMIN]: 'Administrator',
        [ROLES.TEACHER]: 'Teacher',
        [ROLES.STUDENT]: 'Student'
    }[role];
}

export function isValidRole(role: string): role is UserRole {
    return Object.values(ROLES).includes(role as UserRole);
} 