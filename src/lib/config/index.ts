import { account, databases, DB_CONFIG } from './appwrite';

// Environment variables
const env = {
    // Appwrite Configuration
    APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    APPWRITE_DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,

    // Application Configuration
    APP_NAME: import.meta.env.VITE_APP_NAME || 'TimeTablePro',
    APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Modern Timetable Management System',
    APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',

    // Time Configuration
    TIME_SLOT_START: import.meta.env.VITE_TIME_SLOT_START || '08:00',
    TIME_SLOT_END: import.meta.env.VITE_TIME_SLOT_END || '17:00',
    TIME_SLOT_DURATION: Number(import.meta.env.VITE_TIME_SLOT_DURATION) || 60,
    WORKING_DAYS: (import.meta.env.VITE_WORKING_DAYS || 'monday,tuesday,wednesday,thursday,friday').split(','),

    // Room Configuration
    MIN_ROOM_CAPACITY: Number(import.meta.env.VITE_MIN_ROOM_CAPACITY) || 1,
    MAX_ROOM_CAPACITY: Number(import.meta.env.VITE_MAX_ROOM_CAPACITY) || 500,
    MIN_FLOOR: Number(import.meta.env.VITE_MIN_FLOOR) || -5,
    MAX_FLOOR: Number(import.meta.env.VITE_MAX_FLOOR) || 100,

    // Password Requirements
    PASSWORD_MIN_LENGTH: Number(import.meta.env.VITE_PASSWORD_MIN_LENGTH) || 8,
    PASSWORD_REQUIRE_UPPERCASE: import.meta.env.VITE_PASSWORD_REQUIRE_UPPERCASE !== 'false',
    PASSWORD_REQUIRE_LOWERCASE: import.meta.env.VITE_PASSWORD_REQUIRE_LOWERCASE !== 'false',
    PASSWORD_REQUIRE_NUMBER: import.meta.env.VITE_PASSWORD_REQUIRE_NUMBER !== 'false',
    PASSWORD_REQUIRE_SPECIAL: import.meta.env.VITE_PASSWORD_REQUIRE_SPECIAL !== 'false',
    PASSWORD_SPECIAL_CHARS: import.meta.env.VITE_PASSWORD_SPECIAL_CHARS || '!@#$%^&*',

    // UI Configuration
    DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'system',
    ENABLE_ANIMATIONS: import.meta.env.VITE_ENABLE_ANIMATIONS !== 'false',
    TOAST_DURATION: Number(import.meta.env.VITE_TOAST_DURATION) || 5000,

    // Feature Flags
    ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
    ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
    ENABLE_TEACHER_AVAILABILITY: import.meta.env.VITE_ENABLE_TEACHER_AVAILABILITY !== 'false',
    ENABLE_ROOM_FEATURES: import.meta.env.VITE_ENABLE_ROOM_FEATURES !== 'false',
    ENABLE_RECURRING_SCHEDULES: import.meta.env.VITE_ENABLE_RECURRING_SCHEDULES !== 'false',

    // API Rate Limiting
    API_RATE_LIMIT: Number(import.meta.env.VITE_API_RATE_LIMIT) || 100,
    API_RATE_LIMIT_WINDOW: Number(import.meta.env.VITE_API_RATE_LIMIT_WINDOW) || 60000,

    // Cache Configuration
    CACHE_DURATION: Number(import.meta.env.VITE_CACHE_DURATION) || 3600000,
    ENABLE_SERVICE_WORKER: import.meta.env.VITE_ENABLE_SERVICE_WORKER !== 'false'
};

// Export Appwrite instances and config
export { account, databases, DB_CONFIG };

// Export collections
export const COLLECTIONS = DB_CONFIG.collections;

// Time slots configuration
export const TIME_SLOTS = (() => {
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${env.TIME_SLOT_START}`);
    const end = new Date(`2000-01-01T${env.TIME_SLOT_END}`);
    
    while (start <= end) {
        slots.push(start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
        start.setMinutes(start.getMinutes() + env.TIME_SLOT_DURATION);
    }
    
    return slots;
})();

export const DAYS_OF_WEEK = env.WORKING_DAYS as ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];

export const RECURRENCE_TYPES = [
    'once',
    'daily',
    'weekly',
    'monthly'
] as const;

export const MAX_ROOM_CAPACITY = env.MAX_ROOM_CAPACITY;
export const MIN_ROOM_CAPACITY = env.MIN_ROOM_CAPACITY;
export const MIN_FLOOR = env.MIN_FLOOR;
export const MAX_FLOOR = env.MAX_FLOOR;

export const PASSWORD_REQUIREMENTS = {
    minLength: env.PASSWORD_MIN_LENGTH,
    requireUppercase: env.PASSWORD_REQUIRE_UPPERCASE,
    requireLowercase: env.PASSWORD_REQUIRE_LOWERCASE,
    requireNumber: env.PASSWORD_REQUIRE_NUMBER,
    requireSpecial: env.PASSWORD_REQUIRE_SPECIAL,
    specialChars: env.PASSWORD_SPECIAL_CHARS
};

export const UI_CONFIG = {
    defaultTheme: env.DEFAULT_THEME as 'light' | 'dark' | 'system',
    enableAnimations: env.ENABLE_ANIMATIONS,
    toastDuration: env.TOAST_DURATION
};

export const FEATURE_FLAGS = {
    enableNotifications: env.ENABLE_NOTIFICATIONS,
    enableDarkMode: env.ENABLE_DARK_MODE,
    enableTeacherAvailability: env.ENABLE_TEACHER_AVAILABILITY,
    enableRoomFeatures: env.ENABLE_ROOM_FEATURES,
    enableRecurringSchedules: env.ENABLE_RECURRING_SCHEDULES
};

export const API_CONFIG = {
    rateLimit: env.API_RATE_LIMIT,
    rateLimitWindow: env.API_RATE_LIMIT_WINDOW
};

export const CACHE_CONFIG = {
    duration: env.CACHE_DURATION,
    enableServiceWorker: env.ENABLE_SERVICE_WORKER
};

// Notification types
export const NOTIFICATION_TYPES = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success'
} as const;

// User roles
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    STUDENT: 'STUDENT'
} as const;

// Routes configuration
export const ROUTES = {
    // Auth routes
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    AUTH_CALLBACK: '/auth/callback',

    // Dashboard routes
    ADMIN_DASHBOARD: '/admin/dashboard',
    TEACHER_DASHBOARD: '/teacher/dashboard',
    STUDENT_DASHBOARD: '/student/dashboard',

    // Admin routes
    ADMIN: {
        ROOMS: '/admin/rooms',
        SCHEDULES: '/admin/schedules',
        TEACHERS: '/admin/teachers',
        STUDENTS: '/admin/students',
        AVAILABILITY: '/admin/availability',
        REPORTS: '/admin/reports'
    },

    // Teacher routes
    TEACHER: {
        SCHEDULES: '/teacher/schedules',
        STUDENTS: '/teacher/students',
        AVAILABILITY: '/teacher/availability'
    },

    // Student routes
    STUDENT: {
        SCHEDULES: '/student/schedules',
        TEACHERS: '/student/teachers'
    },

    // User routes
    PROFILE: '/profile',
    SETTINGS: '/settings',

    // API routes
    API: {
        SCHEDULES: '/api/schedules',
        ROOMS: '/api/rooms',
        USERS: '/api/users',
        NOTIFICATIONS: '/api/notifications',
        AVAILABILITY: '/api/availability'
    }
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    SCHEDULES: {
        LIST: '/api/schedules',
        CREATE: '/api/schedules',
        UPDATE: (id: string) => `/api/schedules/${id}`,
        DELETE: (id: string) => `/api/schedules/${id}`,
        CONFLICTS: '/api/schedules/conflicts'
    },
    ROOMS: {
        LIST: '/api/rooms',
        CREATE: '/api/rooms',
        UPDATE: (id: string) => `/api/rooms/${id}`,
        DELETE: (id: string) => `/api/rooms/${id}`,
        AVAILABILITY: (id: string) => `/api/rooms/${id}/availability`
    },
    USERS: {
        LIST: '/api/users',
        CREATE: '/api/users',
        UPDATE: (id: string) => `/api/users/${id}`,
        DELETE: (id: string) => `/api/users/${id}`,
        PROFILE: '/api/users/profile'
    },
    NOTIFICATIONS: {
        LIST: '/api/notifications',
        MARK_READ: (id: string) => `/api/notifications/${id}/read`,
        MARK_ALL_READ: '/api/notifications/read-all',
        DELETE: (id: string) => `/api/notifications/${id}`
    },
    AVAILABILITY: {
        LIST: '/api/availability',
        UPDATE: '/api/availability',
        TEACHER: (id: string) => `/api/availability/teacher/${id}`
    }
} as const; 