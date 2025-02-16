import type { PageLoad } from './$types';
import { authService } from '$lib/services/auth';

export const load: PageLoad = async () => {
    try {
        await authService.handleOAuthCallback();
    } catch (error) {
        console.error('OAuth callback error:', error);
        // The error will be handled by the page component
    }
}; 