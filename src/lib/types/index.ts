import type { Models } from 'appwrite';
import type { NOTIFICATION_TYPES, USER_ROLES } from '$lib/config/constants';

// Base Appwrite document type
export interface AppwriteDocument extends Models.Document {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

// User type
export interface User extends AppwriteDocument {
  userId: string;
  email: string;
  name: string;
  role: keyof typeof USER_ROLES;
  isActive: boolean;
  preferences?: Record<string, any>;
}

// Room type
export interface Room extends AppwriteDocument {
  roomName: string;
  capacity: number;
  building: string;
  floor: number;
  features: RoomFeature[];
  isActive: boolean;
}

// Schedule type
export interface Schedule extends AppwriteDocument {
  className: string;
  subject: string;
  teacherId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  duration: number;
  dayOfWeek: DayOfWeek;
  recurrence: Recurrence;
  conflictStatus?: 'none' | 'warning' | 'conflict';
}

// Notification type
export interface Notification extends AppwriteDocument {
  userId: string;
  title: string;
  message: string;
  type: keyof typeof NOTIFICATION_TYPES;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// Teacher availability type
export interface TeacherAvailability extends AppwriteDocument {
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  note?: string;
}

// Calendar view type
export type CalendarViewType = 'day' | 'week' | 'month';

// Schedule filter type
export interface ScheduleFilter {
  startDate?: string;
  endDate?: string;
  teacherId?: string;
  roomId?: string;
  dayOfWeek?: DayOfWeek;
}

// Conflict check result
export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType: 'none' | 'warning' | 'conflict';
  conflictingSchedules?: Schedule[];
  message?: string;
}

// Room feature types
export type RoomFeature = 
  | 'projector'
  | 'whiteboard'
  | 'computer'
  | 'internet'
  | 'air_conditioning'
  | 'wheelchair_accessible'
  | 'video_conferencing'
  | 'audio_system';

// Day of week type
export type DayOfWeek = 
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// Recurrence type
export type Recurrence = 
  | 'once'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly';

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

// Simple string array map for form errors
export type FormErrors = Record<string, string[]>;

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