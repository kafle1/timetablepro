// Time Configuration
export const TIME_CONFIG = {
    START_TIME: '08:00',
    END_TIME: '17:00',
    START_HOUR: 8,
    END_HOUR: 17,
    SLOT_DURATION: 60,
    WORKING_DAYS: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const,
    TIME_SLOTS: [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00'
    ]
};

// Room Configuration
export const ROOM_CONFIG = {
    MIN_CAPACITY: 1,
    MAX_CAPACITY: 500,
    MIN_FLOOR: -5,
    MAX_FLOOR: 100
};

// Password Configuration
export const PASSWORD_CONFIG = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    SPECIAL_CHARS: '!@#$%^&*'
};

// UI Configuration
export const UI_CONFIG = {
    DEFAULT_THEME: 'system',
    TOAST_DURATION: 5000,
    ENABLE_ANIMATIONS: true
};

// Feature Flags
export const FEATURE_FLAGS = {
    NOTIFICATIONS: true,
    DARK_MODE: true,
    TEACHER_AVAILABILITY: true,
    ROOM_FEATURES: true,
    RECURRING_SCHEDULES: true
};

// User Roles
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    STUDENT: 'STUDENT'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success'
} as const;

// Recurrence Types
export const RECURRENCE_TYPES = [
    'once',
    'daily',
    'weekly',
    'monthly'
] as const; 