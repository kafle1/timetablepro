import { AppError } from './error';
import type { Schedule, Room, TeacherAvailability, User } from '$lib/types';
import { TIME_CONFIG, ROOM_CONFIG, PASSWORD_CONFIG, USER_ROLES } from '../config/constants';

// Define our own constants for testing compatibility
// These will be used if the imports from constants.ts fail
// or if we're in a test environment
const DEFAULT_TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const DEFAULT_RECURRENCE_TYPES = ['once', 'daily', 'weekly', 'monthly'];

// Get time slots and recurrence types from constants or use defaults
function getTimeSlots(): string[] {
  try {
    // Try to import from constants
    const constants = require('../config/constants');
    if (constants.TIME_SLOTS) {
      if (Array.isArray(constants.TIME_SLOTS)) {
        if (typeof constants.TIME_SLOTS[0] === 'string') {
          return constants.TIME_SLOTS;
        } else {
          return constants.TIME_SLOTS.map((slot: any) => slot.value);
        }
      } else if (typeof constants.TIME_SLOTS === 'object') {
        return Object.values(constants.TIME_SLOTS);
      }
    }
  } catch (error) {
    // Fallback for tests
  }
  return DEFAULT_TIME_SLOTS;
}

function getRecurrenceTypes(): string[] {
  try {
    // Try to import from constants
    const constants = require('../config/constants');
    if (constants.RECURRENCE_TYPES) {
      if (Array.isArray(constants.RECURRENCE_TYPES)) {
        return constants.RECURRENCE_TYPES;
      } else if (typeof constants.RECURRENCE_TYPES === 'object') {
        return Object.values(constants.RECURRENCE_TYPES);
      }
    }
  } catch (error) {
    // Fallback for tests
  }
  return DEFAULT_RECURRENCE_TYPES;
}

// Initialize the constants
const TIME_SLOTS = getTimeSlots();
const RECURRENCE_TYPES = getRecurrenceTypes();

type FormErrors<T> = {
    [K in keyof T]?: string[];
};

// Generic validation utilities
export function validateRequired(value: any, field: string): string[] {
    const errors: string[] = [];
    if (value === undefined || value === null || value === '') {
        errors.push(`${field} is required`);
    }
    return errors;
}

export function validateEmail(email: string): string[] {
    const errors: string[] = [];
    if (!email) {
        errors.push('Email is required');
        return errors;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
    }
    return errors;
}

export function validatePassword(password: string): string[] {
    const errors: string[] = [];
    if (!password) {
        errors.push('Password is required');
        return errors;
    }

    if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
        errors.push(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters long`);
    }

    if (PASSWORD_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (PASSWORD_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (PASSWORD_CONFIG.REQUIRE_NUMBER && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (PASSWORD_CONFIG.REQUIRE_SPECIAL && !new RegExp(`[${PASSWORD_CONFIG.SPECIAL_CHARS}]`).test(password)) {
        errors.push(`Password must contain at least one special character (${PASSWORD_CONFIG.SPECIAL_CHARS})`);
    }

    return errors;
}

// Schedule validation
export function validateSchedule(schedule: Partial<Schedule>): FormErrors<Schedule> {
    const errors: FormErrors<Schedule> = {};

    // Required fields
    if (!schedule.subject) {
        errors.subject = ['Subject is required'];
    }

    if (!schedule.roomId) {
        errors.roomId = ['Room is required'];
    }

    if (!schedule.teacherId) {
        errors.teacherId = ['Teacher is required'];
    }

    if (!schedule.startTime) {
        errors.startTime = ['Start time is required'];
    }

    if (!schedule.endTime) {
        errors.endTime = ['End time is required'];
    }

    if (!schedule.dayOfWeek) {
        errors.dayOfWeek = ['Day of week is required'];
    }

    if (!schedule.recurrence) {
        errors.recurrence = ['Recurrence is required'];
    }

    // Time validation
    if (schedule.startTime && schedule.endTime) {
        const start = new Date(schedule.startTime);
        const end = new Date(schedule.endTime);

        if (end <= start) {
            errors.endTime = [...(errors.endTime || []), 'End time must be after start time'];
        }

        const startTime = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTime = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        if (!TIME_SLOTS.includes(startTime)) {
            errors.startTime = [...(errors.startTime || []), 'Invalid start time'];
        }

        if (!TIME_SLOTS.includes(endTime)) {
            errors.endTime = [...(errors.endTime || []), 'Invalid end time'];
        }
    }

    if (schedule.dayOfWeek && !TIME_CONFIG.WORKING_DAYS.includes(schedule.dayOfWeek as any)) {
        errors.dayOfWeek = [...(errors.dayOfWeek || []), 'Invalid day of week'];
    }

    if (schedule.recurrence && !RECURRENCE_TYPES.includes(schedule.recurrence as any)) {
        errors.recurrence = [...(errors.recurrence || []), 'Invalid recurrence type'];
    }

    return errors;
}

// Room validation
export function validateRoom(room: Partial<Room>): FormErrors<Room> {
    const errors: FormErrors<Room> = {};

    // Required fields
    errors.name = validateRequired(room.name, 'Room name');
    errors.capacity = validateRequired(room.capacity, 'Capacity');
    errors.building = validateRequired(room.building, 'Building');
    errors.floor = validateRequired(room.floor, 'Floor');

    // Capacity validation
    if (room.capacity !== undefined) {
        if (room.capacity < ROOM_CONFIG.MIN_CAPACITY) {
            errors.capacity = [...(errors.capacity || []), `Capacity must be at least ${ROOM_CONFIG.MIN_CAPACITY}`];
        }
        if (room.capacity > ROOM_CONFIG.MAX_CAPACITY) {
            errors.capacity = [...(errors.capacity || []), `Capacity cannot exceed ${ROOM_CONFIG.MAX_CAPACITY}`];
        }
    }

    // Floor validation
    if (room.floor !== undefined) {
        if (room.floor < -5) {
            errors.floor = ['Floor cannot be lower than -5'];
        }
        if (room.floor > 100) {
            errors.floor = ['Floor cannot exceed 100'];
        }
    }

    return errors;
}

// Teacher availability validation
export function validateTeacherAvailability(availability: Partial<TeacherAvailability>): FormErrors<TeacherAvailability> {
    const errors: FormErrors<TeacherAvailability> = {};

    // Required fields
    if (!availability.teacherId) {
        errors.teacherId = ['Teacher is required'];
    }

    if (!availability.dayOfWeek) {
        errors.dayOfWeek = ['Day of week is required'];
    }

    if (!availability.startTime) {
        errors.startTime = ['Start time is required'];
    }

    if (!availability.endTime) {
        errors.endTime = ['End time is required'];
    }

    // Time validation
    if (availability.startTime && availability.endTime) {
        const start = new Date(availability.startTime);
        const end = new Date(availability.endTime);

        if (end <= start) {
            errors.endTime = [...(errors.endTime || []), 'End time must be after start time'];
        }

        const startTime = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const endTime = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        if (!TIME_SLOTS.includes(startTime)) {
            errors.startTime = [...(errors.startTime || []), 'Invalid start time'];
        }

        if (!TIME_SLOTS.includes(endTime)) {
            errors.endTime = [...(errors.endTime || []), 'Invalid end time'];
        }
    }

    if (availability.dayOfWeek && !TIME_CONFIG.WORKING_DAYS.includes(availability.dayOfWeek as any)) {
        errors.dayOfWeek = [...(errors.dayOfWeek || []), 'Invalid day of week'];
    }

    return errors;
}

// User validation
export function validateUser(user: Partial<User>): FormErrors<User> {
    const errors: FormErrors<User> = {};

    // Required fields
    errors.email = validateEmail(user.email || '');
    errors.name = validateRequired(user.name, 'Name');
    errors.role = validateRequired(user.role, 'Role');

    // Name validation
    if (user.name) {
        if (user.name.length < 2) {
            errors.name = ['Name must be at least 2 characters long'];
        }
        if (user.name.length > 50) {
            errors.name = ['Name cannot exceed 50 characters'];
        }
    }

    return errors;
}

// Helper function to check if a form has errors
export function hasErrors(errors: FormErrors<any>): boolean {
    return Object.values(errors).some(fieldErrors => fieldErrors && fieldErrors.length > 0);
}

// Helper function to get the first error message for a field
export function getFieldError(errors: FormErrors<any>, field: string): string | undefined {
    return errors[field]?.[0];
}

export function validateScheduleTime(startTime: string, duration: number): void {
    const start = new Date(startTime);
    const hour = start.getHours();
    const minutes = start.getMinutes();

    // Check if time is within allowed hours
    if (hour < TIME_CONFIG.TIME_SLOTS.START_HOUR || hour > TIME_CONFIG.TIME_SLOTS.END_HOUR) {
        throw new AppError(
            `Schedule must be between ${TIME_CONFIG.TIME_SLOTS.START_HOUR}:00 and ${TIME_CONFIG.TIME_SLOTS.END_HOUR}:00`,
            'INVALID_TIME'
        );
    }

    // Check if minutes align with slot duration
    if (minutes % TIME_CONFIG.TIME_SLOTS.SLOT_DURATION !== 0) {
        throw new AppError(
            `Start time minutes must be in increments of ${TIME_CONFIG.TIME_SLOTS.SLOT_DURATION}`,
            'INVALID_TIME'
        );
    }

    // Check if duration is valid
    if (duration < TIME_CONFIG.TIME_SLOTS.SLOT_DURATION || duration % TIME_CONFIG.TIME_SLOTS.SLOT_DURATION !== 0) {
        throw new AppError(
            `Duration must be in increments of ${TIME_CONFIG.TIME_SLOTS.SLOT_DURATION} minutes`,
            'INVALID_DURATION'
        );
    }

    // Check if schedule ends before closing time
    const end = new Date(start.getTime() + duration * 60000);
    if (end.getHours() > TIME_CONFIG.TIME_SLOTS.END_HOUR) {
        throw new AppError(
            `Schedule must end before ${TIME_CONFIG.TIME_SLOTS.END_HOUR}:00`,
            'INVALID_TIME'
        );
    }
}

export function validateScheduleConflict(
    newSchedule: Partial<Schedule>,
    existingSchedules: Schedule[]
): void {
    if (!newSchedule.startTime || !newSchedule.endTime) {
        throw new AppError('Invalid schedule times', 'VALIDATION_ERROR');
    }

    const newStart = new Date(newSchedule.startTime);
    const newEnd = new Date(newSchedule.endTime);

    const conflicts = existingSchedules.some(schedule => {
        const existingStart = new Date(schedule.startTime);
        const existingEnd = new Date(schedule.endTime);

        return (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
        );
    });

    if (conflicts) {
        throw new AppError('Schedule conflicts with existing bookings', 'SCHEDULE_CONFLICT');
    }
}

export function validateRoomCapacity(capacity: number): void {
    if (!Number.isInteger(capacity) || capacity < ROOM_CONFIG.MIN_CAPACITY || capacity > ROOM_CONFIG.MAX_CAPACITY) {
        throw new AppError(
            `Room capacity must be an integer between ${ROOM_CONFIG.MIN_CAPACITY} and ${ROOM_CONFIG.MAX_CAPACITY}`,
            'VALIDATION_ERROR'
        );
    }
} 