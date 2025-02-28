import { ID, Query, type Models } from 'appwrite';
import { databases, DB_CONFIG } from '$lib/config/appwrite';
import type { Room, RoomFeature } from '$lib/types';

export interface CreateRoomParams {
  roomName: string;
  capacity: number;
  building?: string;
  floor?: number;
  features?: RoomFeature[];
  isActive?: boolean;
}

export interface UpdateRoomParams {
  roomName?: string;
  capacity?: number;
  building?: string;
  floor?: number;
  features?: RoomFeature[];
  isActive?: boolean;
}

export interface RoomFilters {
  capacity?: number;
  building?: string;
  floor?: number;
  features?: RoomFeature[];
  isActive?: boolean;
}

/**
 * Service for managing rooms in the application
 */
class RoomService {
  /**
   * Create a new room
   */
  async createRoom(params: CreateRoomParams): Promise<Room> {
    try {
      const { roomName, capacity, building, floor, features, isActive = true } = params;
      
      // Validate inputs
      if (!roomName || !capacity) {
        throw new Error('Room name and capacity are required');
      }
      
      const roomData = {
        roomName,
        capacity,
        building: building || '',
        floor: floor || 0,
        features: features || [],
        isActive
      };
      
      const response = await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.ROOMS,
        ID.unique(),
        roomData
      );
      
      return response as unknown as Room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing room
   */
  async updateRoom(roomId: string, params: UpdateRoomParams): Promise<Room> {
    try {
      // Validate inputs
      if (!roomId) {
        throw new Error('Room ID is required');
      }
      
      const response = await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.ROOMS,
        roomId,
        params
      );
      
      return response as unknown as Room;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  }
  
  /**
   * Delete a room
   */
  async deleteRoom(roomId: string): Promise<boolean> {
    try {
      // Validate inputs
      if (!roomId) {
        throw new Error('Room ID is required');
      }
      
      await databases.deleteDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.ROOMS,
        roomId
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }
  
  /**
   * Get a room by ID
   */
  async getRoom(roomId: string): Promise<Room> {
    try {
      // Validate inputs
      if (!roomId) {
        throw new Error('Room ID is required');
      }
      
      const response = await databases.getDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.ROOMS,
        roomId
      );
      
      return response as unknown as Room;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  }
  
  /**
   * List all rooms with optional filters
   */
  async list(filters?: RoomFilters) {
    try {
      let queries = [];
      
      if (filters) {
        if (filters.capacity) {
          queries.push(Query.greaterThanEqual('capacity', filters.capacity));
        }
        
        if (filters.building) {
          queries.push(Query.equal('building', filters.building));
        }
        
        if (filters.floor !== undefined) {
          queries.push(Query.equal('floor', filters.floor));
        }
        
        if (filters.features && filters.features.length > 0) {
          // For each feature, check if it's in the features array
          filters.features.forEach(feature => {
            queries.push(Query.search('features', feature));
          });
        }
        
        if (filters.isActive !== undefined) {
          queries.push(Query.equal('isActive', filters.isActive));
        }
      }
      
      // Default to only active rooms if not specified
      if (!filters || filters.isActive === undefined) {
        queries.push(Query.equal('isActive', true));
      }
      
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.ROOMS,
        queries
      );
      
      return response;
    } catch (error) {
      console.error('Error listing rooms:', error);
      throw error;
    }
  }
  
  /**
   * Get available rooms for a specific time slot
   */
  async getAvailableRooms(startTime: string, endTime: string, capacity?: number) {
    try {
      // First, get all active rooms that meet capacity requirements
      const roomFilters: RoomFilters = {
        isActive: true
      };
      
      if (capacity) {
        roomFilters.capacity = capacity;
      }
      
      const allRooms = await this.list(roomFilters);
      
      // TODO: Implement logic to check room availability based on schedules
      // This would require checking the schedule collection for any schedules
      // that overlap with the requested time slot
      
      return allRooms;
    } catch (error) {
      console.error('Error getting available rooms:', error);
      throw error;
    }
  }
  
  /**
   * Get room types (buildings, features, etc.)
   */
  async getRoomTypes(): Promise<string[]> {
    try {
      const response = await this.list();
      const buildings = new Set(response.documents.map(room => (room as unknown as Room).building));
      return Array.from(buildings);
    } catch (error) {
      console.error('Error fetching room types:', error);
      throw error;
    }
  }
  
  /**
   * Get buildings
   */
  async getBuildings(): Promise<string[]> {
    try {
      const response = await this.list();
      const buildings = new Set(response.documents.map(room => (room as unknown as Room).building));
      return Array.from(buildings);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      throw error;
    }
  }
}

// Export the room service instance
export const roomService = new RoomService(); 