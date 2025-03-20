import { databases } from '$lib/config/appwrite';
import { DB_CONFIG } from '$lib/config/appwrite';
import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';

export type AvailabilityData = {
    teacherId: string;
    dayOfWeek: string;
    availableSlots: string[];
};

export interface Availability extends Models.Document, AvailabilityData {}

export const getTeacherAvailability = async (teacherId: string) => {
    try {
        const response = await databases.listDocuments<Availability>(
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.TEACHER_AVAILABILITY,
            [Query.equal('teacherId', teacherId)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching teacher availability:', error);
        return [];
    }
};

export const updateTeacherAvailability = async (availability: Availability) => {
    try {
        // Check if availability already exists for this teacher and day
        const existing = await databases.listDocuments<Availability>(
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.TEACHER_AVAILABILITY,
            [
                Query.equal('teacherId', availability.teacherId),
                Query.equal('dayOfWeek', availability.dayOfWeek)
            ]
        );

        if (existing.documents.length > 0) {
            // Update existing availability
            const response = await databases.updateDocument<Availability>(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.TEACHER_AVAILABILITY,
                existing.documents[0].$id,
                { availableSlots: availability.availableSlots }
            );
            return response;
        } else {
            // Create new availability
            const response = await databases.createDocument<Availability>(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.TEACHER_AVAILABILITY,
                ID.unique(),
                availability
            );
            return response;
        }
    } catch (error) {
        console.error('Error updating teacher availability:', error);
        throw error;
    }
};

export const deleteTeacherAvailability = async (availabilityId: string) => {
    try {
        await databases.deleteDocument(
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.TEACHER_AVAILABILITY,
            availabilityId
        );
    } catch (error) {
        console.error('Error deleting teacher availability:', error);
        throw error;
    }
};

export function generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let hour = 8; hour < 18; hour++) {
        const hourStr = hour.toString().padStart(2, '0');
        slots.push(`${hourStr}:00`);
        slots.push(`${hourStr}:30`);
    }
    return slots;
}

export function isTimeSlotAvailable(
    availabilities: Availability[],
    day: string,
    timeSlot: string
): boolean {
    const dayAvailability = availabilities.find(a => a.dayOfWeek === day);
    return dayAvailability ? dayAvailability.availableSlots.includes(timeSlot) : false;
} 