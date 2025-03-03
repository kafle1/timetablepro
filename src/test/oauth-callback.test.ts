import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { authService } from '$lib/services/auth';
import OAuthCallback from '../routes/(auth)/auth/callback/+page.svelte';
import { goto } from '$app/navigation';
import { authStore } from '$lib/stores/auth';
import type { User } from '$lib/types';
import { ROUTES } from '$lib/config';

// Mock modules
vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

describe('OAuth Callback Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should handle successful OAuth callback', async () => {
        const mockUser: User = {
            $id: 'user123',
            $collectionId: 'users',
            $databaseId: 'timetablepro',
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            userId: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'STUDENT',
            isActive: true,
            emailVerified: true,
            preferences: {}
        };

        vi.spyOn(authService, 'handleOAuthCallback').mockResolvedValueOnce(mockUser);
        vi.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(mockUser);
        vi.spyOn(authStore, 'getDashboardRoute').mockReturnValueOnce(ROUTES.STUDENT_DASHBOARD);

        render(OAuthCallback);

        expect(screen.getByText(/completing authentication/i)).toBeInTheDocument();
        expect(screen.getByText(/please wait/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(authService.handleOAuthCallback).toHaveBeenCalled();
            expect(authService.getCurrentUser).toHaveBeenCalled();
            expect(goto).toHaveBeenCalledWith(ROUTES.STUDENT_DASHBOARD);
        });
    });

    it('should handle OAuth callback error', async () => {
        vi.spyOn(authService, 'handleOAuthCallback').mockRejectedValueOnce(new Error('OAuth failed'));
        vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
            fn();
            return 0 as any;
        });

        render(OAuthCallback);

        await waitFor(() => {
            expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
            expect(screen.getByText(/oauth failed/i)).toBeInTheDocument();
            expect(screen.getByText(/redirecting back to login/i)).toBeInTheDocument();
            expect(goto).toHaveBeenCalledWith('/login?error=google_auth_failed');
        });
    });

    it('should handle missing user after OAuth callback', async () => {
        vi.spyOn(authService, 'handleOAuthCallback').mockResolvedValueOnce(undefined as any);
        vi.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce(null);
        vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
            fn();
            return 0 as any;
        });

        render(OAuthCallback);

        await waitFor(() => {
            expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
            expect(screen.getByText(/failed to get user after oauth callback/i)).toBeInTheDocument();
            expect(screen.getByText(/redirecting back to login/i)).toBeInTheDocument();
            expect(goto).toHaveBeenCalledWith('/login?error=google_auth_failed');
        });
    });

    it('should show loading state initially', () => {
        vi.spyOn(authService, 'handleOAuthCallback').mockImplementation(() => new Promise(() => {}));

        render(OAuthCallback);

        expect(screen.getByText(/completing authentication/i)).toBeInTheDocument();
        expect(screen.getByText(/please wait/i)).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveClass('animate-spin');
    });
});