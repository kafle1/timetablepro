import type { LayoutServerLoad } from './$types';

// Keep imports for types if needed, remove redirect and ROUTE imports if no longer used
// import { redirect } from '@sveltejs/kit'; 
// import { ROUTES, USER_ROLES } from '$lib/config';

export const load: LayoutServerLoad = async ({ locals }) => {
    const { user } = locals;

    // Simply return the user object obtained from the server hook (hooks.server.ts)
    // The hook is responsible for verifying the session from cookies.
    // Client-side guards in +layout.ts or specific pages will handle redirection 
    // if the user data is missing after load.
    return {
        user // This will be null if the hook didn't find/validate a session
    };
}; 