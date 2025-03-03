import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '$lib/services/auth';
import { account, databases } from '$lib/config/appwrite';
import { USER_ROLES } from '$lib/config/constants';
import type { Models } from 'appwrite';
import type { User } from '$lib/types';

// Mock browser environment
vi.stubGlobal('window', {
    location: {
        origin: 'http://localhost:5173'
    }
});

describe('OAuth Authentication', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('loginWithGoogle', () => {
        it('should initiate Google OAuth flow', async () => {
            vi.spyOn(account, 'createOAuth2Session').mockResolvedValueOnce();

            await authService.loginWithGoogle();

            expect(account.createOAuth2Session).toHaveBeenCalledWith(
                'google',
                'http://localhost:5173/auth/callback',
                'http://localhost:5173/auth/callback',
                ['profile', 'email']
            );
        });

        it('should handle Google OAuth error', async () => {
            vi.spyOn(account, 'createOAuth2Session').mockRejectedValueOnce(new Error('OAuth failed'));

            await expect(authService.loginWithGoogle()).rejects.toThrow('Google login failed');
        });
    });

    describe('handleOAuthCallback', () => {
        it('should handle new OAuth user', async () => {
            const mockAppwriteUser: Models.User<any> = {
                $id: 'user123',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                name: 'Test User',
                email: 'test@example.com',
                phone: '',
                emailVerification: true,
                phoneVerification: false,
                status: true,
                passwordUpdate: '',
                registration: new Date().toISOString(),
                prefs: {},
                accessedAt: new Date().toISOString(),
                labels: []
            };

            const mockUserDoc = {
                $id: mockAppwriteUser.$id,
                $collectionId: 'users',
                $databaseId: 'timetablepro',
                $createdAt: mockAppwriteUser.$createdAt,
                $updatedAt: mockAppwriteUser.$updatedAt,
                $permissions: [],
                userId: mockAppwriteUser.$id,
                email: mockAppwriteUser.email,
                name: mockAppwriteUser.name,
                role: USER_ROLES.STUDENT,
                isActive: true,
                emailVerified: true,
                preferences: {},
                createdAt: mockAppwriteUser.$createdAt,
                lastLoginAt: expect.any(String)
            };

            vi.spyOn(account, 'get').mockResolvedValueOnce(mockAppwriteUser);
            vi.spyOn(authService, 'getUserByEmail').mockResolvedValueOnce(null);
            vi.spyOn(databases, 'createDocument').mockResolvedValueOnce(mockUserDoc);

            const result = await authService.handleOAuthCallback();

            expect(result).toEqual(mockUserDoc);
            expect(databases.createDocument).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                mockAppwriteUser.$id,
                expect.objectContaining({
                    userId: mockAppwriteUser.$id,
                    email: mockAppwriteUser.email,
                    name: mockAppwriteUser.name,
                    role: USER_ROLES.STUDENT,
                    isActive: true,
                    emailVerified: true
                })
            );
        });

        it('should handle existing OAuth user', async () => {
            const mockAppwriteUser: Models.User<any> = {
                $id: 'user123',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                name: 'Test User',
                email: 'test@example.com',
                phone: '',
                emailVerification: true,
                phoneVerification: false,
                status: true,
                passwordUpdate: '',
                registration: new Date().toISOString(),
                prefs: {},
                accessedAt: new Date().toISOString(),
                labels: []
            };

            const mockUserDoc = {
                $id: mockAppwriteUser.$id,
                $collectionId: 'users',
                $databaseId: 'timetablepro',
                $createdAt: mockAppwriteUser.$createdAt,
                $updatedAt: mockAppwriteUser.$updatedAt,
                $permissions: [],
                userId: mockAppwriteUser.$id,
                email: mockAppwriteUser.email,
                name: mockAppwriteUser.name,
                role: USER_ROLES.STUDENT,
                isActive: true,
                emailVerified: true,
                preferences: {}
            };

            vi.spyOn(account, 'get').mockResolvedValueOnce(mockAppwriteUser);
            vi.spyOn(authService, 'getUserByEmail').mockResolvedValueOnce(mockUserDoc as unknown as User);
            vi.spyOn(databases, 'updateDocument').mockResolvedValueOnce(mockUserDoc);

            const result = await authService.handleOAuthCallback();

            expect(result).toEqual(mockUserDoc);
            expect(databases.updateDocument).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                mockAppwriteUser.$id,
                expect.objectContaining({
                    lastLoginAt: expect.any(String)
                })
            );
        });

        it('should handle OAuth callback error', async () => {
            vi.spyOn(account, 'get').mockRejectedValueOnce(new Error('OAuth failed'));

            await expect(authService.handleOAuthCallback()).rejects.toThrow('Failed to complete authentication');
        });
    });
}); 