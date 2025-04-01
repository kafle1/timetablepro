import { redirect, type Handle } from '@sveltejs/kit';
import { ROUTES } from '$lib/config';
import { authService } from '$lib/services/auth';
import type { User } from '$lib/types';

// Set to true for debug logging in development
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Define routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/reset-password',
  '/auth/',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  '/'
];

// Debug logging function
function logDebug(...args: any[]) {
  if (DEBUG_MODE) {
    console.log('[Server]', ...args);
  }
}

// Determine if a route is public
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => path.startsWith(route)) || 
         path.includes('.') || // Static assets
         path.startsWith('/favicon');
}

// Get appropriate dashboard route based on user role
function getDashboardRoute(role: string): string {
  switch (role) {
    case 'ADMIN':
      return ROUTES.ADMIN_DASHBOARD;
    case 'TEACHER':
      return ROUTES.TEACHER_DASHBOARD;
    default:
      return ROUTES.STUDENT_DASHBOARD;
  }
}

// Parse and verify JWT token
function verifyToken(token: string): { id: string; email: string; name: string; role: string } | null {
  try {
    if (!token) return null;
    
    // Basic token verification - in a real app, you'd verify the signature
    const decoded = JSON.parse(atob(token));
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      logDebug('Token expired');
      return null;
    }
    
    // Ensure required fields are present
    if (!decoded.id || !decoded.email || !decoded.role) {
      logDebug('Token missing required fields');
      return null;
    }
    
    return decoded;
  } catch (error) {
    logDebug('Token verification failed', error);
    return null;
  }
}

// Global handle function for all requests
export const handle: Handle = async ({ event, resolve }) => {
  // Initialize user in locals
  event.locals.user = null;
  
  // Get path
  const path = event.url.pathname;
  logDebug(`Request path: ${path}`);

  // Always skip auth for internal SvelteKit data endpoints and static assets
  if (path.includes('/__data.json') || 
      path.includes('/.svelte-kit/') || 
      path.includes('/src/routes/') || 
      path.includes('.')) {
    logDebug('Internal route or asset, bypassing auth');
    return resolve(event);
  }

  // Check if it's a public route
  if (isPublicRoute(path)) {
    logDebug('Public route, bypassing auth');
    return resolve(event);
  }

  try {
    // Try to get user from auth service
    const user = await authService.getCurrentUser();
    
    if (!user && !isPublicRoute(path)) {
      logDebug('No user found, redirecting to login');
      throw redirect(302, `${ROUTES.LOGIN}?redirect=${encodeURIComponent(path)}`);
    }

    // Set user in locals if found
    if (user) {
      event.locals.user = user;
    }

    return resolve(event);
  } catch (error) {
    logDebug('Error handling request:', error);
    if (!isPublicRoute(path)) {
      throw redirect(302, `${ROUTES.LOGIN}?redirect=${encodeURIComponent(path)}`);
    }
    return resolve(event);
  }
}; 