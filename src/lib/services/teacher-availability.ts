import { ID, Query } from 'appwrite';
import { databases, DB_CONFIG } from '$lib/config/appwrite';
import type { TeacherAvailability } from '$lib/types';

export interface CreateTeacherAvailabilityParams {
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  note?: string;
}

export interface UpdateTeacherAvailabilityParams {
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  note?: string;
}

export interface TeacherAvailabilityFilters {
  teacherId?: string;
  dayOfWeek?: string;
  isAvailable?: boolean;
}

class TeacherAvailabilityService {
  /**
   * Create a new teacher availability record
   */
  async createAvailability(params: CreateTeacherAvailabilityParams): Promise<TeacherAvailability> {
    try {
      const { teacherId, dayOfWeek, startTime, endTime, isAvailable, note } = params;
      
      const availabilityData = {
        teacherId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable,
        note: note || ''
      };
      
      const response = await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.TEACHER_AVAILABILITY,
        ID.unique(),
        availabilityData
      );
      
      return response as unknown as TeacherAvailability;
    } catch (error) {
      console.error('Error creating teacher availability:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing teacher availability record
   */
  async updateAvailability(availabilityId: string, params: UpdateTeacherAvailabilityParams): Promise<TeacherAvailability> {
    try {
      const response = await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.TEACHER_AVAILABILITY,
        availabilityId,
        params
      );
      
      return response as unknown as TeacherAvailability;
    } catch (error) {
      console.error('Error updating teacher availability:', error);
      throw error;
    }
  }
  
  /**
   * Delete a teacher availability record
   */
  async deleteAvailability(availabilityId: string): Promise<boolean> {
    try {
      await databases.deleteDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.TEACHER_AVAILABILITY,
        availabilityId
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting teacher availability:', error);
      throw error;
    }
  }
  
  /**
   * Get a teacher availability record by ID
   */
  async getAvailability(availabilityId: string): Promise<TeacherAvailability> {
    try {
      const response = await databases.getDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.TEACHER_AVAILABILITY,
        availabilityId
      );
      
      return response as unknown as TeacherAvailability;
    } catch (error) {
      console.error('Error getting teacher availability:', error);
      throw error;
    }
  }
  
  /**
   * List teacher availability records with optional filters
   */
  async listAvailability(filters?: TeacherAvailabilityFilters) {
    try {
      let queries = [];
      
      if (filters) {
        if (filters.teacherId) {
          queries.push(Query.equal('teacherId', filters.teacherId));
        }
        
        if (filters.dayOfWeek) {
          queries.push(Query.equal('dayOfWeek', filters.dayOfWeek));
        }
        
        if (filters.isAvailable !== undefined) {
          queries.push(Query.equal('isAvailable', filters.isAvailable));
        }
      }
      
      // Sort by day of week and start time
      queries.push(Query.orderAsc('dayOfWeek'));
      queries.push(Query.orderAsc('startTime'));
      
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.TEACHER_AVAILABILITY,
        queries
      );
      
      return response;
    } catch (error) {
      console.error('Error listing teacher availability:', error);
      throw error;
    }
  }
  
  /**
   * Get availability for a specific teacher
   */
  async getTeacherAvailability(teacherId: string) {
    try {
      return await this.listAvailability({ teacherId });
    } catch (error) {
      console.error('Error getting teacher availability:', error);
      throw error;
    }
  }
  
  /**
   * Get availability for a specific day
   */
  async getAvailabilityByDay(dayOfWeek: string) {
    try {
      return await this.listAvailability({ dayOfWeek });
    } catch (error) {
      console.error('Error getting availability by day:', error);
      throw error;
    }
  }
  
  /**
   * Get available teachers for a specific time slot
   */
  async getAvailableTeachers(dayOfWeek: string, startTime: string, endTime: string) {
    try {
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.TEACHER_AVAILABILITY,
        [
          Query.equal('dayOfWeek', dayOfWeek),
          Query.lessThanEqual('startTime', startTime),
          Query.greaterThanEqual('endTime', endTime),
          Query.equal('isAvailable', true)
        ]
      );
      
      return response;
    } catch (error) {
      console.error('Error getting available teachers:', error);
      throw error;
    }
  }
  
  /**
   * Set a teacher's availability for multiple days
   */
  async setBulkAvailability(
    teacherId: string,
    availabilityData: Array<Omit<CreateTeacherAvailabilityParams, 'teacherId'>>
  ): Promise<TeacherAvailability[]> {
    try {
      // First, delete all existing availability for this teacher
      const existingAvailability = await this.getTeacherAvailability(teacherId);
      
      const deletePromises = existingAvailability.documents.map(
        (availability: any) => this.deleteAvailability(availability.$id)
      );
      
      await Promise.all(deletePromises);
      
      // Then create new availability records
      const createPromises = availabilityData.map(data => 
        this.createAvailability({
          teacherId,
          ...data
        })
      );
      
      return await Promise.all(createPromises);
    } catch (error) {
      console.error('Error setting bulk availability:', error);
      throw error;
    }
  }
}

export const teacherAvailabilityService = new TeacherAvailabilityService(); 