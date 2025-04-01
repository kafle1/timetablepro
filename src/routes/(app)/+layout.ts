import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { ROUTES, USER_ROLES } from '$lib/config';
import { authService } from '$lib/services/auth';
import { browser } from '$app/environment';
import { dev } from '$app/environment';

// Constant for UI testing mode
const UI_TESTING_MODE = true; // Always enable for development

export const load: LayoutLoad = async ({ url, fetch }) => {
  // Get auth token from session storage or URL
  if (browser) {
    const sessionAuthToken = sessionStorage?.getItem('ui_testing_auth_token');
    const urlAuthToken = url.searchParams.get('_auth');
    
    if (sessionAuthToken || urlAuthToken) {
      console.log('Layout.ts detected UI testing auth token');
      
      // Check if token is valid
      const token = sessionAuthToken || urlAuthToken;
      if (token) {
        const payload = authService.verifyToken(token);
        if (payload) {
          console.log('Valid token found in session storage');
          // Return the user from token payload
          return {
            user: {
              $id: payload.id,
              userId: payload.id,
              email: payload.email,
              name: payload.name,
              role: payload.role,
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
        }
      }
    }
  }
  
  // Try to check authentication status
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const userData = await response.json();
      
      // If we have a user, return it
      if (userData && userData.user) {
        return {
          user: userData.user
        };
      }
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Continue with UI testing mode
  }
  
  // For UI testing, return a mock admin user
  if (UI_TESTING_MODE) {
    console.log('Using UI testing mode fallback user');
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
  }
  
  // If not in UI testing mode and no user, redirect to login
  throw redirect(302, `${ROUTES.LOGIN}?redirect=${encodeURIComponent(url.pathname)}`);
}; 