import { redirect, type Handle } from '@sveltejs/kit';
import { ROUTES } from '$lib/config';
import { serverAccount, serverDatabases } from '$lib/server/appwrite'; // Use server client
import { Query } from 'node-appwrite';
import { AppwriteException } from 'node-appwrite'; // Import Exception type
import { env as publicEnv } from '$env/dynamic/public'; // Public env for DB/Collection IDs
import type { User } from '$lib/types';
import { parse, serialize } from 'cookie'; // Utility for cookie handling

// Set to true for debug logging in development
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Define routes that don't require authentication
const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  // Add other public routes like /reset-password, /about etc.
  '/reset-password',
  '/auth/',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
  ROUTES.HOME // Assuming homepage is public
];

// Debug logging function
function logDebug(...args: any[]) {
  if (DEBUG_MODE) {
    console.log('[Server Hook]', ...args);
  }
}

// Determine if a route is public
function isPublicRoute(path: string): boolean {
  // Check exact matches or if path starts with a public route + /
  return PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/')) || 
         path.includes('.') || // Basic check for static assets
         path.startsWith('/favicon'); 
}

// Global handle function for all requests
export const handle: Handle = async ({ event, resolve }) => {
  event.locals.user = null;
  const path = event.url.pathname;

  // Skip auth for specific internal/static paths explicitly if needed
  if (path.startsWith('/_app') || path.startsWith('/@vite')) {
      return resolve(event);
  }

  logDebug(`Handling request for: ${path}`);

  // --- Appwrite Server-Side Session Verification --- 
  const cookies = parse(event.request.headers.get('cookie') || '');
  // Find the Appwrite session cookie (adjust name if needed, often starts with 'a_session_')
  const sessionCookieName = Object.keys(cookies).find(name => name.startsWith('a_session_'));
  const sessionToken = sessionCookieName ? cookies[sessionCookieName] : null;

  if (sessionToken) {
    logDebug('Found session cookie:', sessionCookieName);
    // Set the session cookie for the server client to verify
    // Note: The Node SDK currently doesn't have a direct setCookies method.
    // Verification relies on the API Key having appropriate scopes OR potentially 
    // using JWT if Appwrite is configured for it. Let's assume API key access for now.
    // A more robust method might involve custom JWT or specific Appwrite functions.
    
    // We will try to get the account details using the API key, assuming it has access.
    // If this fails, it implies the session linked to the API key (if any) or the 
    // general access is insufficient, OR the underlying session cookie is invalid.
    // A direct session *verification* from cookie isn't standard in Node SDK yet.
    try {
      // Try getting account info - this verifies session indirectly via API key scopes
      const accountData = await serverAccount.get(); 
      
      logDebug('Server verified account for user:', accountData.$id);

      // Fetch user details from DB using server client
      try {
        const userDocs = await serverDatabases.listDocuments(
          publicEnv.PUBLIC_VITE_APPWRITE_DATABASE_ID!,
          publicEnv.PUBLIC_VITE_APPWRITE_USERS_COLLECTION_ID!,
          [Query.equal('userId', accountData.$id)]
        );
        if (userDocs.documents.length > 0) {
          event.locals.user = userDocs.documents[0] as User;
          logDebug('User data loaded into locals:', event.locals.user?.email);
        } else {
          logDebug('User account exists but no DB record found for ID:', accountData.$id);
          // Handle missing DB record - potentially log out on client?
        }
      } catch (dbError) {
        console.error('Error fetching user DB data on server:', dbError);
        // Handle DB error
      }

    } catch (error: unknown) {
      // Handle AppwriteExceptions, specifically 401 means no valid session for the API key context
      if (error instanceof AppwriteException && error.code === 401) {
        logDebug('Server session check returned 401 (No valid session associated with API key/request)');
      } else {
        console.error('Error during server session check:', error);
      }
      // Clear potentially invalid session cookie(s) on the response
      const expiredCookieHeader = Object.keys(cookies)
        .filter(name => name.startsWith('a_session_'))
        .map(name => serialize(name, '', { path: '/', expires: new Date(0), httpOnly: true, secure: event.url.protocol === 'https:' }))
        .join(', ');
       if (expiredCookieHeader) {
           // We need to modify the response later, store this header for now
           event.locals.clearCookiesHeader = expiredCookieHeader;
       }
    }
  } else {
    logDebug('No Appwrite session cookie found in request');
  }
  // --- End Verification ---

  // Redirect logic
  const isUserLoggedIn = !!event.locals.user;
  const isReqPublic = isPublicRoute(path);

  logDebug(`User logged in (server check): ${isUserLoggedIn}, Path: ${path}, Public: ${isReqPublic}`);

  // --- MODIFIED REDIRECT LOGIC ---
  // Only redirect logged-in users *away* from public auth routes.
  // Let client-side handle protection for non-public routes if server check fails initially.
  if (isUserLoggedIn && (path === ROUTES.LOGIN || path === ROUTES.REGISTER || path === '/')) {
      logDebug('User logged in, redirecting from auth/home page to dashboard...');
      
      let dashboardRoute: string = ROUTES.STUDENT_DASHBOARD; // Default to student
      if (event.locals.user) { 
          switch(event.locals.user.role.toUpperCase()) { 
              case 'ADMIN': dashboardRoute = ROUTES.ADMIN_DASHBOARD; break;
              case 'TEACHER': dashboardRoute = ROUTES.TEACHER_DASHBOARD; break;
              // STUDENT case already handled by default
          }
      }
      throw redirect(302, dashboardRoute);
  }
  
  // --- REMOVED/COMMENTED OUT AGGRESSIVE REDIRECT ---
  // if (!isUserLoggedIn && !isReqPublic) {
  //   logDebug('Redirecting to login (server check failed for non-public route)...');
  //   // This was likely causing the loop after client-side login.
  //   // Client-side +layout.ts load function will handle missing user state.
  //   // throw redirect(302, `${ROUTES.LOGIN}?redirect=${encodeURIComponent(path)}&error=unauthorized`);
  // }
  
  // (Removed the redundant check for logged-in user on auth pages here as it's covered above)

  logDebug('Resolving request (allowing client layout to potentially handle auth)...');
  const response = await resolve(event);

  // Attach headers to clear cookies if necessary
  if (event.locals.clearCookiesHeader) {
      logDebug('Attaching Set-Cookie header to clear invalid session cookies');
      response.headers.append('Set-Cookie', event.locals.clearCookiesHeader);
  }

  return response;
}; 