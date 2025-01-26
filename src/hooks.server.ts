import { account } from '$lib/config/appwrite';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    try {
        const session = await account.get();
        event.locals.user = {
            id: session.$id,
            email: session.email,
            name: session.name,
            role: 'admin' // This should be fetched from your database based on the user's ID
        };
    } catch {
        event.locals.user = null;
    }

    const response = await resolve(event);
    return response;
}; 