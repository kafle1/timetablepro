import { databases } from '$lib/config/appwrite';
import { appwriteConfig } from '$lib/config/appwrite';
import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';

export type AvailabilityData = {
    teacherId: string;
    dayOfWeek: string;
    availableSlots: string[];
};

export interface Availability extends Models.Document, AvailabilityData {}

export async function getTeacherAvailability(teacherId: string) {
    try {
        const response = await databases.listDocuments<Availability>(
            appwriteConfig.databaseId,
            appwriteConfig.collections.availability,
            [Query.equal('teacherId', teacherId)]
        );

        return response.documents;
    } catch (error) {
        console.error('Error fetching teacher availability:', error);
        throw error;
    }
}

export async function setAvailability(availability: AvailabilityData) {
    try {
        // Check if availability already exists for this teacher and day
        const existing = await databases.listDocuments<Availability>(
            appwriteConfig.databaseId,
            appwriteConfig.collections.availability,
            [
                Query.equal('teacherId', availability.teacherId),
                Query.equal('dayOfWeek', availability.dayOfWeek)
            ]
        );

        if (existing.documents.length > 0) {
            // Update existing availability
            const response = await databases.updateDocument<Availability>(
                appwriteConfig.databaseId,
                appwriteConfig.collections.availability,
                existing.documents[0].$id,
                { availableSlots: availability.availableSlots }
            );
            return response;
        } else {
            // Create new availability
            const response = await databases.createDocument<Availability>(
                appwriteConfig.databaseId,
                appwriteConfig.collections.availability,
                ID.unique(),
                availability
            );
            return response;
        }
    } catch (error) {
        console.error('Error setting availability:', error);
        throw error;
    }
}

export async function deleteAvailability(availabilityId: string) {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.availability,
            availabilityId
        );
    } catch (error) {
        console.error('Error deleting availability:', error);
        throw error;
    }
}

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