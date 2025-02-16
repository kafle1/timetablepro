import { describe, it, expect } from 'vitest';
import {
    validateRequired,
    validateEmail,
    validatePassword,
    validateSchedule,
    validateRoom,
    validateTeacherAvailability,
    validateUser,
    hasErrors,
    getFieldError,
    validateScheduleConflict,
    validateRoomCapacity,
    validateScheduleTime
} from './validation';
import type { Schedule, Room, TeacherAvailability, User } from '$lib/types';
import { AppError } from './error';
import { ROOM_CONFIG, PASSWORD_CONFIG, USER_ROLES } from '../config/constants';

describe('Validation Utilities', () => {
    describe('validateRequired', () => {
        it('should return error for undefined value', () => {
            expect(validateRequired(undefined, 'Field')).toEqual(['Field is required']);
        });

        it('should return error for null value', () => {
            expect(validateRequired(null, 'Field')).toEqual(['Field is required']);
        });

        it('should return error for empty string', () => {
            expect(validateRequired('', 'Field')).toEqual(['Field is required']);
        });

        it('should return empty array for valid value', () => {
            expect(validateRequired('value', 'Field')).toEqual([]);
            expect(validateRequired(0, 'Field')).toEqual([]);
            expect(validateRequired(false, 'Field')).toEqual([]);
        });
    });

    describe('validateEmail', () => {
        it('should return error for empty email', () => {
            expect(validateEmail('')).toEqual(['Email is required']);
        });

        it('should return error for invalid email format', () => {
            expect(validateEmail('invalid')).toEqual(['Invalid email format']);
            expect(validateEmail('invalid@')).toEqual(['Invalid email format']);
            expect(validateEmail('invalid@domain')).toEqual(['Invalid email format']);
            expect(validateEmail('@domain.com')).toEqual(['Invalid email format']);
        });

        it('should return empty array for valid email', () => {
            expect(validateEmail('test@example.com')).toEqual([]);
            expect(validateEmail('user.name+tag@example.co.uk')).toEqual([]);
            expect(validateEmail('user123@subdomain.example.com')).toEqual([]);
        });
    });

    describe('validatePassword', () => {
        it('should return error for empty password', () => {
            expect(validatePassword('')).toEqual(['Password is required']);
        });

        it('should validate minimum length', () => {
            expect(validatePassword('Abc1!')).toContain('Password must be at least 8 characters long');
            expect(validatePassword('Abcd1!@#')).not.toContain('Password must be at least 8 characters long');
        });

        it('should validate uppercase requirement', () => {
            expect(validatePassword('abcd1!@#')).toContain('Password must contain at least one uppercase letter');
            expect(validatePassword('Abcd1!@#')).not.toContain('Password must contain at least one uppercase letter');
        });

        it('should validate lowercase requirement', () => {
            expect(validatePassword('ABCD1!@#')).toContain('Password must contain at least one lowercase letter');
            expect(validatePassword('ABCDe1!@#')).not.toContain('Password must contain at least one lowercase letter');
        });

        it('should validate number requirement', () => {
            expect(validatePassword('Abcd!@#$')).toContain('Password must contain at least one number');
            expect(validatePassword('Abcd1!@#')).not.toContain('Password must contain at least one number');
        });

        it('should validate special character requirement', () => {
            expect(validatePassword('Abcd1234')).toContain(`Password must contain at least one special character (${PASSWORD_CONFIG.SPECIAL_CHARS})`);
            expect(validatePassword('Abcd1!@#')).not.toContain(`Password must contain at least one special character (${PASSWORD_CONFIG.SPECIAL_CHARS})`);
        });

        it('should return empty array for valid password', () => {
            expect(validatePassword('StrongP@ss1')).toEqual([]);
            expect(validatePassword('C0mplex!ty')).toEqual([]);
            expect(validatePassword('P@ssw0rd123')).toEqual([]);
        });
    });

    describe('validateSchedule', () => {
        it('should validate required fields', () => {
            const schedule: Partial<Schedule> = {};
            const errors = validateSchedule(schedule);
            
            expect(errors.roomId).toContain('Room is required');
            expect(errors.teacherId).toContain('Teacher is required');
            expect(errors.subject).toContain('Subject is required');
            expect(errors.startTime).toContain('Start time is required');
            expect(errors.endTime).toContain('End time is required');
            expect(errors.dayOfWeek).toContain('Day of week is required');
            expect(errors.recurrence).toContain('Recurrence is required');
        });

        it('should validate time order', () => {
            const schedule: Partial<Schedule> = {
                startTime: '2024-03-20T11:00:00',
                endTime: '2024-03-20T10:00:00'
            };
            const errors = validateSchedule(schedule);
            expect(errors.endTime).toContain('End time must be after start time');
        });

        it('should validate time slots', () => {
            const schedule: Partial<Schedule> = {
                startTime: '2024-03-20T07:30:00',
                endTime: '2024-03-20T18:30:00'
            };
            const errors = validateSchedule(schedule);
            expect(errors.startTime).toContain('Invalid start time');
            expect(errors.endTime).toContain('Invalid end time');
        });

        it('should validate day of week', () => {
            const schedule: Partial<Schedule> = {
                dayOfWeek: 'invalid' as any
            };
            const errors = validateSchedule(schedule);
            expect(errors.dayOfWeek).toContain('Invalid day of week');
        });

        it('should validate recurrence type', () => {
            const schedule: Partial<Schedule> = {
                recurrence: 'invalid' as any
            };
            const errors = validateSchedule(schedule);
            expect(errors.recurrence).toContain('Invalid recurrence type');
        });

        it('should return no errors for valid schedule', () => {
            const schedule: Schedule = {
                id: '1',
                roomId: '1',
                teacherId: '1',
                subject: 'Math',
                startTime: '2024-03-20T09:00:00',
                endTime: '2024-03-20T10:00:00',
                dayOfWeek: 'monday',
                recurrence: 'weekly',
                createdAt: '',
                updatedAt: ''
            };
            const errors = validateSchedule(schedule);
            expect(Object.values(errors).every(arr => !arr || arr.length === 0)).toBe(true);
        });
    });

    describe('validateRoom', () => {
        it('should validate required fields', () => {
            const room: Partial<Room> = {};
            const errors = validateRoom(room);
            
            expect(errors.name).toContain('Room name is required');
            expect(errors.capacity).toContain('Capacity is required');
            expect(errors.building).toContain('Building is required');
            expect(errors.floor).toContain('Floor is required');
        });

        it('should validate capacity constraints', () => {
            const room: Partial<Room> = {
                capacity: 0
            };
            const errors = validateRoom(room);
            expect(errors.capacity).toContain(`Capacity must be at least ${ROOM_CONFIG.MIN_CAPACITY}`);

            room.capacity = ROOM_CONFIG.MAX_CAPACITY + 1;
            const errors2 = validateRoom(room);
            expect(errors2.capacity).toContain(`Capacity cannot exceed ${ROOM_CONFIG.MAX_CAPACITY}`);
        });

        it('should validate floor constraints', () => {
            const room: Partial<Room> = {
                floor: -6
            };
            const errors = validateRoom(room);
            expect(errors.floor).toContain('Floor cannot be lower than -5');

            room.floor = 101;
            const errors2 = validateRoom(room);
            expect(errors2.floor).toContain('Floor cannot exceed 100');
        });

        it('should return no errors for valid room', () => {
            const room: Room = {
                id: '1',
                name: 'Room 101',
                capacity: 30,
                building: 'Main Building',
                floor: 1,
                features: ['projector', 'whiteboard'],
                isActive: true,
                createdAt: '',
                updatedAt: ''
            };
            const errors = validateRoom(room);
            expect(Object.values(errors).every(arr => !arr || arr.length === 0)).toBe(true);
        });
    });

    describe('validateTeacherAvailability', () => {
        it('should validate required fields', () => {
            const availability: Partial<TeacherAvailability> = {};
            const errors = validateTeacherAvailability(availability);
            
            expect(errors.teacherId).toContain('Teacher is required');
            expect(errors.dayOfWeek).toContain('Day of week is required');
            expect(errors.startTime).toContain('Start time is required');
            expect(errors.endTime).toContain('End time is required');
        });

        it('should validate time order', () => {
            const availability: Partial<TeacherAvailability> = {
                startTime: '2024-03-20T11:00:00',
                endTime: '2024-03-20T10:00:00'
            };
            const errors = validateTeacherAvailability(availability);
            expect(errors.endTime).toContain('End time must be after start time');
        });

        it('should validate time slots', () => {
            const availability: Partial<TeacherAvailability> = {
                startTime: '2024-03-20T07:30:00',
                endTime: '2024-03-20T18:30:00'
            };
            const errors = validateTeacherAvailability(availability);
            expect(errors.startTime).toContain('Invalid start time');
            expect(errors.endTime).toContain('Invalid end time');
        });

        it('should validate day of week', () => {
            const availability: Partial<TeacherAvailability> = {
                dayOfWeek: 'invalid' as any
            };
            const errors = validateTeacherAvailability(availability);
            expect(errors.dayOfWeek).toContain('Invalid day of week');
        });

        it('should return no errors for valid availability', () => {
            const availability: TeacherAvailability = {
                id: '1',
                teacherId: '1',
                dayOfWeek: 'monday',
                startTime: '2024-03-20T09:00:00',
                endTime: '2024-03-20T10:00:00',
                isRecurring: true,
                createdAt: '',
                updatedAt: ''
            };
            const errors = validateTeacherAvailability(availability);
            expect(Object.values(errors).every(arr => !arr || arr.length === 0)).toBe(true);
        });
    });

    describe('validateUser', () => {
        it('should validate required fields', () => {
            const user: Partial<User> = {};
            const errors = validateUser(user);
            
            expect(errors.email).toContain('Email is required');
            expect(errors.name).toContain('Name is required');
            expect(errors.role).toContain('Role is required');
        });

        it('should validate email format', () => {
            const user: Partial<User> = {
                email: 'invalid'
            };
            const errors = validateUser(user);
            expect(errors.email).toContain('Invalid email format');
        });

        it('should validate name length', () => {
            const user: Partial<User> = {
                name: 'a'
            };
            const errors = validateUser(user);
            expect(errors.name).toContain('Name must be at least 2 characters long');

            user.name = 'a'.repeat(51);
            const errors2 = validateUser(user);
            expect(errors2.name).toContain('Name cannot exceed 50 characters');
        });

        it('should return no errors for valid user', () => {
            const user: User = {
                id: '1',
                email: 'test@example.com',
                name: 'John Doe',
                role: 'TEACHER',
                createdAt: '',
                updatedAt: ''
            };
            const errors = validateUser(user);
            expect(Object.values(errors).every(arr => !arr || arr.length === 0)).toBe(true);
        });
    });

    describe('validateScheduleConflict', () => {
        const existingSchedules: Schedule[] = [{
            id: '1',
            roomId: '1',
            teacherId: '1',
            subject: 'Math',
            startTime: '2024-03-20T10:00:00',
            endTime: '2024-03-20T11:00:00',
            dayOfWeek: 'monday',
            recurrence: 'weekly',
            createdAt: '',
            updatedAt: ''
        }];

        it('should throw error for missing times', () => {
            expect(() => validateScheduleConflict({}, [])).toThrow(AppError);
            expect(() => validateScheduleConflict({}, [])).toThrow('Invalid schedule times');
        });

        it('should detect overlapping start time', () => {
            const newSchedule: Partial<Schedule> = {
                startTime: '2024-03-20T10:30:00',
                endTime: '2024-03-20T11:30:00'
            };
            expect(() => validateScheduleConflict(newSchedule, existingSchedules)).toThrow(AppError);
            expect(() => validateScheduleConflict(newSchedule, existingSchedules)).toThrow('Schedule conflicts with existing bookings');
        });

        it('should detect overlapping end time', () => {
            const newSchedule: Partial<Schedule> = {
                startTime: '2024-03-20T09:30:00',
                endTime: '2024-03-20T10:30:00'
            };
            expect(() => validateScheduleConflict(newSchedule, existingSchedules)).toThrow(AppError);
        });

        it('should detect encompassing schedule', () => {
            const newSchedule: Partial<Schedule> = {
                startTime: '2024-03-20T09:00:00',
                endTime: '2024-03-20T12:00:00'
            };
            expect(() => validateScheduleConflict(newSchedule, existingSchedules)).toThrow(AppError);
        });

        it('should not throw error for non-conflicting schedule', () => {
            const newSchedule: Partial<Schedule> = {
                startTime: '2024-03-20T11:00:00',
                endTime: '2024-03-20T12:00:00'
            };
            expect(() => validateScheduleConflict(newSchedule, existingSchedules)).not.toThrow();
        });
    });

    describe('validateRoomCapacity', () => {
        it('should throw error for non-integer capacity', () => {
            expect(() => validateRoomCapacity(1.5)).toThrow(AppError);
            expect(() => validateRoomCapacity(1.5)).toThrow(`Room capacity must be an integer between ${ROOM_CONFIG.MIN_CAPACITY} and ${ROOM_CONFIG.MAX_CAPACITY}`);
        });

        it('should throw error for capacity below minimum', () => {
            expect(() => validateRoomCapacity(ROOM_CONFIG.MIN_CAPACITY - 1)).toThrow(AppError);
        });

        it('should throw error for capacity above maximum', () => {
            expect(() => validateRoomCapacity(ROOM_CONFIG.MAX_CAPACITY + 1)).toThrow(AppError);
        });

        it('should not throw error for valid capacity', () => {
            expect(() => validateRoomCapacity(ROOM_CONFIG.MIN_CAPACITY)).not.toThrow();
            expect(() => validateRoomCapacity(30)).not.toThrow();
            expect(() => validateRoomCapacity(ROOM_CONFIG.MAX_CAPACITY)).not.toThrow();
        });
    });

    describe('hasErrors', () => {
        it('should return true when errors exist', () => {
            const errors = { field: ['Error message'] };
            expect(hasErrors(errors)).toBe(true);
        });

        it('should return false when no errors exist', () => {
            const errors = { field: [] };
            expect(hasErrors(errors)).toBe(false);
        });

        it('should return false for empty error object', () => {
            const errors = {};
            expect(hasErrors(errors)).toBe(false);
        });
    });

    describe('getFieldError', () => {
        it('should return first error message', () => {
            const errors = { field: ['First error', 'Second error'] };
            expect(getFieldError(errors, 'field')).toBe('First error');
        });

        it('should return undefined when no errors exist', () => {
            const errors = { field: [] };
            expect(getFieldError(errors, 'field')).toBeUndefined();
        });

        it('should return undefined for non-existent field', () => {
            const errors = { field: ['Error'] };
            expect(getFieldError(errors, 'nonexistent')).toBeUndefined();
        });
    });
}); 