import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { ROUTES } from '$lib/config';
import { authService } from '$lib/services/auth';

export const load: LayoutLoad = async ({ url }) => {
  // Always return a mock admin user for UI testing
  return {
    user: {
      $id: 'mock-admin',
      userId: 'mock-admin',
      email: 'admin@timetablepro.com',
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
      preferences: {},
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      $collectionId: 'users',
      $databaseId: 'default',
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: []
    }
  };
}; 