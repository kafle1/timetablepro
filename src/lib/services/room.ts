import { databases } from '$lib/config/appwrite';
import { appwriteConfig } from '$lib/config/appwrite';
import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';

export type RoomData = {
    name: string;
    capacity: number;
    type: string;
    building: string;
};

export interface Room extends Models.Document, RoomData {}

export async function getRooms(filters: { building?: string; type?: string } = {}) {
    try {
        const queries: string[] = [];
        
        if (filters.building) {
            queries.push(Query.equal('building', filters.building));
        }
        if (filters.type) {
            queries.push(Query.equal('type', filters.type));
        }

        const response = await databases.listDocuments<Room>(
            appwriteConfig.databaseId,
            appwriteConfig.collections.rooms,
            queries
        );

        return response.documents;
    } catch (error) {
        console.error('Error fetching rooms:', error);
        throw error;
    }
}

export async function createRoom(room: RoomData) {
    try {
        const response = await databases.createDocument<Room>(
            appwriteConfig.databaseId,
            appwriteConfig.collections.rooms,
            ID.unique(),
            room
        );

        return response;
    } catch (error) {
        console.error('Error creating room:', error);
        throw error;
    }
}

export async function updateRoom(roomId: string, room: Partial<RoomData>) {
    try {
        const response = await databases.updateDocument<Room>(
            appwriteConfig.databaseId,
            appwriteConfig.collections.rooms,
            roomId,
            room
        );

        return response;
    } catch (error) {
        console.error('Error updating room:', error);
        throw error;
    }
}

export async function deleteRoom(roomId: string) {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.collections.rooms,
            roomId
        );
    } catch (error) {
        console.error('Error deleting room:', error);
        throw error;
    }
}

export async function getRoomTypes(): Promise<string[]> {
    try {
        const response = await databases.listDocuments<Room>(
            appwriteConfig.databaseId,
            appwriteConfig.collections.rooms
        );

        const types = new Set(response.documents.map(room => room.type));
        return Array.from(types);
    } catch (error) {
        console.error('Error fetching room types:', error);
        throw error;
    }
}

export async function getBuildings(): Promise<string[]> {
    try {
        const response = await databases.listDocuments<Room>(
            appwriteConfig.databaseId,
            appwriteConfig.collections.rooms
        );

        const buildings = new Set(response.documents.map(room => room.building));
        return Array.from(buildings);
    } catch (error) {
        console.error('Error fetching buildings:', error);
        throw error;
    }
} 