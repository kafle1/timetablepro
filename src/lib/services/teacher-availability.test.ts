import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ID, Query } from 'appwrite';
import type { Models } from 'appwrite';
import type { TeacherAvailability } from '../types';

// Mock the teacher availability service
vi.mock('./teacher-availability', () => {
  return {
    teacherAvailabilityService: {
      createAvailability: vi.fn(),
      updateAvailability: vi.fn(),
      deleteAvailability: vi.fn(),
      getAvailability: vi.fn(),
      listAvailability: vi.fn(),
      getTeacherAvailability: vi.fn(),
      getAvailabilityByDay: vi.fn(),
      getAvailableTeachers: vi.fn(),
      setBulkAvailability: vi.fn()
    }
  };
});

// Import the mocked service
import { teacherAvailabilityService } from './teacher-availability';

describe('TeacherAvailabilityService', () => {
  const mockTeacherId = 'teacher-123';
  const mockAvailabilityId = 'availability-123';
  const mockDayOfWeek = 'monday';
  const mockStartTime = '09:00';
  const mockEndTime = '11:00';
  
  // Create a complete mock document that matches both Appwrite's Document structure and TeacherAvailability
  const createMockDocument = (overrides = {}): Models.Document & TeacherAvailability => {
    return {
      $id: mockAvailabilityId,
      $collectionId: 'teacher-availability',
      $databaseId: 'test-db',
      $createdAt: '2023-01-01T00:00:00.000Z',
      $updatedAt: '2023-01-01T00:00:00.000Z',
      $permissions: [],
      teacherId: mockTeacherId,
      dayOfWeek: mockDayOfWeek,
      startTime: mockStartTime,
      endTime: mockEndTime,
      isAvailable: true,
      note: 'Test note',
      ...(overrides as any)
    };
  };
  
  // Create a mock document list
  const createMockDocumentList = <T extends Models.Document>(documents: T[]): Models.DocumentList<T> => {
    return {
      documents,
      total: documents.length
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAvailability', () => {
    it('should create a new teacher availability record', async () => {
      // Setup
      const mockDocument = createMockDocument();
      vi.mocked(teacherAvailabilityService.createAvailability).mockResolvedValueOnce(mockDocument);

      // Execute
      const result = await teacherAvailabilityService.createAvailability({
        teacherId: mockTeacherId,
        dayOfWeek: mockDayOfWeek,
        startTime: mockStartTime,
        endTime: mockEndTime,
        isAvailable: true,
        note: 'Test note'
      });

      // Verify
      expect(teacherAvailabilityService.createAvailability).toHaveBeenCalledWith({
        teacherId: mockTeacherId,
        dayOfWeek: mockDayOfWeek,
        startTime: mockStartTime,
        endTime: mockEndTime,
        isAvailable: true,
        note: 'Test note'
      });
      expect(result).toEqual(mockDocument);
    });

    it('should handle errors when creating availability', async () => {
      // Setup
      const mockError = new Error('Database error');
      vi.mocked(teacherAvailabilityService.createAvailability).mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(teacherAvailabilityService.createAvailability({
        teacherId: mockTeacherId,
        dayOfWeek: mockDayOfWeek,
        startTime: mockStartTime,
        endTime: mockEndTime,
        isAvailable: true
      })).rejects.toThrow(mockError);
    });
  });

  describe('updateAvailability', () => {
    it('should update an existing teacher availability record', async () => {
      // Setup
      const mockDocument = createMockDocument({ startTime: '10:00', isAvailable: false });
      vi.mocked(teacherAvailabilityService.updateAvailability).mockResolvedValueOnce(mockDocument);
      
      const updateParams = {
        startTime: '10:00',
        isAvailable: false
      };

      // Execute
      const result = await teacherAvailabilityService.updateAvailability(
        mockAvailabilityId, 
        updateParams
      );

      // Verify
      expect(teacherAvailabilityService.updateAvailability).toHaveBeenCalledWith(
        mockAvailabilityId,
        updateParams
      );
      expect(result).toEqual(mockDocument);
    });

    it('should handle errors when updating availability', async () => {
      // Setup
      const mockError = new Error('Database error');
      vi.mocked(teacherAvailabilityService.updateAvailability).mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(teacherAvailabilityService.updateAvailability(
        mockAvailabilityId, 
        { isAvailable: false }
      )).rejects.toThrow(mockError);
    });
  });

  describe('deleteAvailability', () => {
    it('should delete a teacher availability record', async () => {
      // Setup
      vi.mocked(teacherAvailabilityService.deleteAvailability).mockResolvedValueOnce(true);
      
      // Execute
      const result = await teacherAvailabilityService.deleteAvailability(mockAvailabilityId);

      // Verify
      expect(teacherAvailabilityService.deleteAvailability).toHaveBeenCalledWith(
        mockAvailabilityId
      );
      expect(result).toBe(true);
    });

    it('should handle errors when deleting availability', async () => {
      // Setup
      const mockError = new Error('Database error');
      vi.mocked(teacherAvailabilityService.deleteAvailability).mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(teacherAvailabilityService.deleteAvailability(mockAvailabilityId))
        .rejects.toThrow(mockError);
    });
  });

  describe('getAvailability', () => {
    it('should get a teacher availability record by ID', async () => {
      // Setup
      const mockDocument = createMockDocument();
      vi.mocked(teacherAvailabilityService.getAvailability).mockResolvedValueOnce(mockDocument);
      
      // Execute
      const result = await teacherAvailabilityService.getAvailability(mockAvailabilityId);

      // Verify
      expect(teacherAvailabilityService.getAvailability).toHaveBeenCalledWith(
        mockAvailabilityId
      );
      expect(result).toEqual(mockDocument);
    });

    it('should handle errors when getting availability', async () => {
      // Setup
      const mockError = new Error('Database error');
      vi.mocked(teacherAvailabilityService.getAvailability).mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(teacherAvailabilityService.getAvailability(mockAvailabilityId))
        .rejects.toThrow(mockError);
    });
  });

  describe('listAvailability', () => {
    it('should list teacher availability records with no filters', async () => {
      // Setup
      const mockDocument = createMockDocument();
      const mockResponse = createMockDocumentList([mockDocument]);
      vi.mocked(teacherAvailabilityService.listAvailability).mockResolvedValueOnce(mockResponse);
      
      // Execute
      const result = await teacherAvailabilityService.listAvailability();

      // Verify
      expect(teacherAvailabilityService.listAvailability).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
    });

    it('should list teacher availability records with filters', async () => {
      // Setup
      const mockDocument = createMockDocument();
      const mockResponse = createMockDocumentList([mockDocument]);
      vi.mocked(teacherAvailabilityService.listAvailability).mockResolvedValueOnce(mockResponse);
      
      const filters = {
        teacherId: mockTeacherId,
        dayOfWeek: mockDayOfWeek,
        isAvailable: true
      };
      
      // Execute
      const result = await teacherAvailabilityService.listAvailability(filters);

      // Verify
      expect(teacherAvailabilityService.listAvailability).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when listing availability', async () => {
      // Setup
      const mockError = new Error('Database error');
      vi.mocked(teacherAvailabilityService.listAvailability).mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(teacherAvailabilityService.listAvailability())
        .rejects.toThrow(mockError);
    });
  });

  describe('getTeacherAvailability', () => {
    it('should get availability for a specific teacher', async () => {
      // Setup
      const mockDocument = createMockDocument();
      const mockResponse = createMockDocumentList([mockDocument]);
      vi.mocked(teacherAvailabilityService.getTeacherAvailability).mockResolvedValueOnce(mockResponse);
      
      // Execute
      const result = await teacherAvailabilityService.getTeacherAvailability(mockTeacherId);

      // Verify
      expect(teacherAvailabilityService.getTeacherAvailability).toHaveBeenCalledWith(mockTeacherId);
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when getting teacher availability', async () => {
      // Setup
      const mockError = new Error('Database error');
      vi.mocked(teacherAvailabilityService.getTeacherAvailability).mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(teacherAvailabilityService.getTeacherAvailability(mockTeacherId))
        .rejects.toThrow(mockError);
    });
  });

  describe('getAvailabilityByDay', () => {
    it('should get availability for a specific day', async () => {
      // Setup
      const mockDocument = createMockDocument();
      const mockResponse = createMockDocumentList([mockDocument]);
      vi.mocked(teacherAvailabilityService.getAvailabilityByDay).mockResolvedValueOnce(mockResponse);
      
      // Execute
      const result = await teacherAvailabilityService.getAvailabilityByDay(mockDayOfWeek);

      // Verify
      expect(teacherAvailabilityService.getAvailabilityByDay).toHaveBeenCalledWith(mockDayOfWeek);
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when getting availability by day', async () => {
      // Setup
      const mockError = new Error('Database error');
      vi.mocked(teacherAvailabilityService.getAvailabilityByDay).mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(teacherAvailabilityService.getAvailabilityByDay(mockDayOfWeek))
        .rejects.toThrow(mockError);
    });
  });

  describe('getAvailableTeachers', () => {
    it('should get available teachers for a specific time slot', async () => {
      // Setup
      const mockDocument = createMockDocument();
      const mockResponse = createMockDocumentList([mockDocument]);
      vi.mocked(teacherAvailabilityService.getAvailableTeachers).mockResolvedValueOnce(mockResponse);
      
      // Execute
      const result = await teacherAvailabilityService.getAvailableTeachers(
        mockDayOfWeek,
        mockStartTime,
        mockEndTime
      );

      // Verify
      expect(teacherAvailabilityService.getAvailableTeachers).toHaveBeenCalledWith(
        mockDayOfWeek,
        mockStartTime,
        mockEndTime
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when getting available teachers', async () => {
      // Setup
      const mockError = new Error('Database error');
      vi.mocked(teacherAvailabilityService.getAvailableTeachers).mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(teacherAvailabilityService.getAvailableTeachers(
        mockDayOfWeek,
        mockStartTime,
        mockEndTime
      )).rejects.toThrow(mockError);
    });
  });

  describe('setBulkAvailability', () => {
    it('should set a teacher\'s availability for multiple days', async () => {
      // Setup
      const mondayDoc = createMockDocument({ dayOfWeek: 'monday' });
      const tuesdayDoc = createMockDocument({ 
        dayOfWeek: 'tuesday', 
        startTime: '13:00', 
        endTime: '15:00',
        note: 'Afternoon availability'
      });
      
      const newAvailabilityData = [
        {
          dayOfWeek: 'monday',
          startTime: '09:00',
          endTime: '11:00',
          isAvailable: true
        },
        {
          dayOfWeek: 'tuesday',
          startTime: '13:00',
          endTime: '15:00',
          isAvailable: true,
          note: 'Afternoon availability'
        }
      ];
      
      vi.mocked(teacherAvailabilityService.setBulkAvailability).mockResolvedValueOnce([mondayDoc, tuesdayDoc]);
      
      // Execute
      const result = await teacherAvailabilityService.setBulkAvailability(
        mockTeacherId,
        newAvailabilityData
      );

      // Verify
      expect(teacherAvailabilityService.setBulkAvailability).toHaveBeenCalledWith(
        mockTeacherId,
        newAvailabilityData
      );
      expect(result).toEqual([mondayDoc, tuesdayDoc]);
    });

    it('should handle errors when setting bulk availability', async () => {
      // Setup
      const mockError = new Error('Database error');
      vi.mocked(teacherAvailabilityService.setBulkAvailability).mockRejectedValueOnce(mockError);
      
      // Execute & Verify
      await expect(teacherAvailabilityService.setBulkAvailability(
        mockTeacherId,
        [{ dayOfWeek: 'monday', startTime: '09:00', endTime: '11:00', isAvailable: true }]
      )).rejects.toThrow(mockError);
    });
  });
}); 