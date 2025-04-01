"use strict";
/**
 * Application-wide constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAYS_OF_WEEK = exports.TIME_SLOTS = exports.CONFLICT_STATUS = exports.RECURRENCE_TYPES = exports.NOTIFICATION_TYPES = exports.USER_ROLES = exports.FEATURE_FLAGS = exports.UI_CONFIG = exports.PASSWORD_CONFIG = exports.ROOM_CONFIG = exports.TIME_CONFIG = void 0;
// Time Configuration
exports.TIME_CONFIG = {
    // Working days of the week
    WORKING_DAYS: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    // Default working hours (24-hour format)
    WORKING_HOURS: {
        START: 8, // 8:00 AM
        END: 18, // 6:00 PM
    },
    // Time slot duration in minutes
    DEFAULT_SLOT_DURATION: 60,
    // Minimum duration for a schedule in minutes
    MIN_DURATION: 15,
    // Maximum duration for a schedule in minutes
    MAX_DURATION: 240,
    // Default view mode for calendar
    DEFAULT_VIEW: 'week',
    // Available view modes
    VIEWS: ['day', 'week', 'month'],
};
// Room Configuration
exports.ROOM_CONFIG = {
    MIN_CAPACITY: 1,
    MAX_CAPACITY: 500,
    MIN_FLOOR: -5,
    MAX_FLOOR: 100
};
// Password Configuration
exports.PASSWORD_CONFIG = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    SPECIAL_CHARS: '!@#$%^&*'
};
// UI Configuration
exports.UI_CONFIG = {
    DEFAULT_THEME: 'system',
    TOAST_DURATION: 5000,
    ENABLE_ANIMATIONS: true
};
// Feature Flags
exports.FEATURE_FLAGS = {
    NOTIFICATIONS: true,
    DARK_MODE: true,
    TEACHER_AVAILABILITY: true,
    ROOM_FEATURES: true,
    RECURRING_SCHEDULES: true
};
// User Roles
exports.USER_ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
};
// Notification Types
exports.NOTIFICATION_TYPES = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success',
    SCHEDULE_CREATED: 'schedule_created',
    SCHEDULE_UPDATED: 'schedule_updated',
    SCHEDULE_DELETED: 'schedule_deleted',
    CONFLICT_DETECTED: 'conflict_detected',
    SYSTEM_NOTIFICATION: 'system_notification',
};
// Recurrence Types
exports.RECURRENCE_TYPES = {
    ONCE: 'once',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    BIWEEKLY: 'biweekly',
    MONTHLY: 'monthly',
};
exports.CONFLICT_STATUS = {
    NONE: 'none',
    WARNING: 'warning',
    CONFLICT: 'conflict',
};
// Time slots for scheduling and availability
exports.TIME_SLOTS = [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' },
];
// Days of the week for scheduling and availability
exports.DAYS_OF_WEEK = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
];
