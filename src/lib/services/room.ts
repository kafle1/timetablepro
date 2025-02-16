import { databases, DB_CONFIG } from '$lib/config/appwrite';
import { ID, Query, type Models } from 'appwrite';

// Define the base room data type
interface RoomData {
    name: string;
    capacity: number;
    floor: number;
    building: string;
    type: string;
    features?: string[];
    availability?: {
        [key: string]: boolean;
    };
}

// Extend the base type with Appwrite Document properties
export type Room = RoomData & Models.Document;

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
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.ROOMS,
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
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.ROOMS,
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
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.ROOMS,
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
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.ROOMS,
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
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.ROOMS
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
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.ROOMS
        );

        const buildings = new Set(response.documents.map(room => room.building));
        return Array.from(buildings);
    } catch (error) {
        console.error('Error fetching buildings:', error);
        throw error;
    }
}

export const RoomService = {
    async list(queries: string[] = []): Promise<Models.DocumentList<Room>> {
        try {
            const response = await databases.listDocuments(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.ROOMS
            );
            return response as Models.DocumentList<Room>;
        } catch (error) {
            console.error('Error listing rooms:', error);
            throw error;
        }
    },

    async create(room: RoomData): Promise<Room> {
        try {
            const response = await databases.createDocument(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.ROOMS,
                ID.unique(),
                room
            );
            return response as Room;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    },

    async update(roomId: string, room: Partial<RoomData>): Promise<Room> {
        try {
            const response = await databases.updateDocument(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.ROOMS,
                roomId,
                room
            );
            return response as Room;
        } catch (error) {
            console.error('Error updating room:', error);
            throw error;
        }
    },

    async delete(roomId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.ROOMS,
                roomId
            );
        } catch (error) {
            console.error('Error deleting room:', error);
            throw error;
        }
    },

    async getAvailableRooms(): Promise<Models.DocumentList<Room>> {
        try {
            const response = await databases.listDocuments(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.ROOMS
            );
            const availableRooms = {
                ...response,
                documents: response.documents.filter(doc => doc.availability === true)
            } as Models.DocumentList<Room>;
            return availableRooms;
        } catch (error) {
            console.error('Error getting available rooms:', error);
            throw error;
        }
    },

    async getRoomsByCapacity(minCapacity: number): Promise<Models.DocumentList<Room>> {
        try {
            const response = await databases.listDocuments(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.ROOMS
            );
            const filteredRooms = {
                ...response,
                documents: response.documents.filter(doc => doc.capacity >= minCapacity)
            } as Models.DocumentList<Room>;
            return filteredRooms;
        } catch (error) {
            console.error('Error getting rooms by capacity:', error);
            throw error;
        }
    }
};

// Export an instance for backward compatibility
export const roomService = RoomService; 