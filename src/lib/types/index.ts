import type { NOTIFICATION_TYPES, USER_ROLES } from '$lib/config';
import type { Models } from 'appwrite';

// User types
export interface User extends Models.Document {
    userId: string;
    email: string;
    name: string;
    role: keyof typeof USER_ROLES;
    availability: Array<{
        dayOfWeek: string;
        timeSlots: string[];
    }>;
    createdAt: string;
    updatedAt: string;
}

// Room types
export interface Room {
    $id: string;
    roomName: string;
    capacity: number;
    building: string;
    floor: number;
    features: RoomFeature[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type RoomFeature = 
    | 'projector'
    | 'whiteboard'
    | 'computers'
    | 'air_conditioning'
    | 'internet'
    | 'audio_system';

// Schedule types
export interface Schedule {
    $id: string;
    className: string;
    duration: number;
    conflictStatus?: 'conflict' | 'no-conflict';
    roomId: string;
    teacherId: string;
    subject: string;
    startTime: string;
    endTime: string;
    dayOfWeek: DayOfWeek;
    recurrence: Recurrence;
    createdAt: string;
    updatedAt: string;
}

export type DayOfWeek = 
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';

export type Recurrence = 
    | 'once'
    | 'daily'
    | 'weekly'
    | 'biweekly'
    | 'monthly';

// Notification types
export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: keyof typeof NOTIFICATION_TYPES;
    isRead: boolean;
    createdAt: string;
}

// Teacher availability types
export interface TeacherAvailability {
    id: string;
    teacherId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    createdAt: string;
    updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
    total: number;
    page: number;
    perPage: number;
}

// Form validation types
export interface ValidationError {
    field: string;
    message: string;
}

export interface FormErrors<T = any> {
    [K in keyof T]?: string[];
}

// Route types
export interface RouteData {
    user?: User;
    error?: string;
}

// Store types
export interface UserStore {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
}

export type { Models }; 