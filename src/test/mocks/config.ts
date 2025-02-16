// Mock time slots
export const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
];

export const DAYS_OF_WEEK = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday'
] as const;

export const RECURRENCE_TYPES = [
    'once',
    'daily',
    'weekly',
    'monthly'
] as const;

export const MAX_ROOM_CAPACITY = 500;
export const MIN_ROOM_CAPACITY = 1;

export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    specialChars: '!@#$%^&*'
};

export const USER_ROLES = {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    STUDENT: 'STUDENT'
} as const; 