import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { databases, DB_CONFIG } from '$lib/config/appwrite';
import { Query } from 'appwrite';
import type { User } from '$lib/types';

export async function GET(event: RequestEvent) {
    try {
        const email = event.url.searchParams.get('email');
        
        if (!email) {
            return json({ error: 'Email is required' }, { status: 400 });
        }

        const response = await databases.listDocuments(
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.USERS,
            [Query.equal('email', [email])]
        );

        const user = response.documents[0];

        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
} 