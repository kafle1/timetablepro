import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /api/auth/me
 * Returns the current authenticated user or null
 */
export const GET: RequestHandler = async ({ locals }) => {
  // Get the user from request locals (set by hooks.server.ts)
  const user = locals.user;
  
  // If no user is found, return empty user object
  if (!user) {
    return json({
      user: null
    });
  }
  
  // Return user info
  return json({
    user
  });
}; 