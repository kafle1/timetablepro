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

describe('AuthService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('createAccount', () => {
        it('should create a new account successfully', async () => {
            const mockAppwriteUser: Models.User<any> = {
                $id: 'user123',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                name: 'Test User',
                email: 'test@example.com',
                phone: '',
                emailVerification: false,
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
                emailVerified: false,
                preferences: {}
            };

            vi.spyOn(account, 'create').mockResolvedValueOnce(mockAppwriteUser);
            vi.spyOn(databases, 'createDocument').mockResolvedValueOnce(mockUserDoc);
            vi.spyOn(authService, 'sendVerificationEmail').mockResolvedValueOnce();

            const result = await authService.createAccount({
                email: 'test@example.com',
                password: 'Test123!@#',
                name: 'Test User',
                role: 'STUDENT'
            });

            expect(result).toEqual(mockUserDoc);
            expect(account.create).toHaveBeenCalledWith(
                expect.any(String),
                'test@example.com',
                'Test123!@#',
                'Test User'
            );
        });

        it('should throw error for weak password', async () => {
            await expect(authService.createAccount({
                email: 'test@example.com',
                password: 'weak',
                name: 'Test User',
                role: 'STUDENT'
            })).rejects.toThrow('Password must be at least 8 characters long');
        });

        it('should throw error for invalid role', async () => {
            await expect(authService.createAccount({
                email: 'test@example.com',
                password: 'Test123!@#',
                name: 'Test User',
                role: 'INVALID' as any
            })).rejects.toThrow('Invalid user role');
        });

        it('should handle existing email error', async () => {
            vi.spyOn(account, 'create').mockRejectedValueOnce({ code: 409 });

            await expect(authService.createAccount({
                email: 'existing@example.com',
                password: 'Test123!@#',
                name: 'Test User',
                role: 'STUDENT'
            })).rejects.toThrow('An account with this email already exists');
        });
    });

    describe('login', () => {
        it('should login successfully', async () => {
            const mockSession: Models.Session = {
                $id: 'session123',
                $createdAt: new Date().toISOString(),
                userId: 'user123',
                expire: new Date(Date.now() + 86400000).toISOString(),
                provider: 'email',
                providerUid: 'test@example.com',
                providerAccessToken: '',
                providerAccessTokenExpiry: '',
                providerRefreshToken: '',
                ip: '127.0.0.1',
                osCode: 'MAC',
                osName: 'macOS',
                osVersion: '12.0',
                clientType: 'browser',
                clientCode: 'CH',
                clientName: 'Chrome',
                clientVersion: '96.0',
                clientEngine: 'Blink',
                clientEngineVersion: '96.0',
                deviceName: 'Desktop',
                deviceBrand: '',
                deviceModel: '',
                countryCode: 'US',
                countryName: 'United States',
                current: true
            };

            const mockAppwriteUser: Models.User<any> = {
                $id: 'user123',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                name: 'Test User',
                email: 'test@example.com',
                phone: '',
                emailVerification: false,
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

            vi.spyOn(account, 'createEmailSession').mockResolvedValueOnce(mockSession);
            vi.spyOn(account, 'get').mockResolvedValueOnce(mockAppwriteUser);
            vi.spyOn(authService, 'getUserById').mockResolvedValueOnce(mockUserDoc as unknown as User);
            vi.spyOn(databases, 'updateDocument').mockResolvedValueOnce(mockUserDoc);

            const result = await authService.login('test@example.com', 'Test123!@#');

            expect(result).toEqual(mockUserDoc);
            expect(account.createEmailSession).toHaveBeenCalledWith(
                'test@example.com',
                'Test123!@#'
            );
        });

        it('should handle invalid credentials', async () => {
            vi.spyOn(account, 'createEmailSession').mockRejectedValueOnce({ code: 401 });

            await expect(authService.login('test@example.com', 'wrong')).rejects.toThrow('Invalid email or password');
        });

        it('should handle too many attempts', async () => {
            vi.spyOn(account, 'createEmailSession').mockRejectedValueOnce({ code: 429 });

            await expect(authService.login('test@example.com', 'Test123!@#')).rejects.toThrow('Too many login attempts');
        });
    });

    describe('logout', () => {
        it('should logout successfully', async () => {
            vi.spyOn(account, 'deleteSession').mockResolvedValueOnce({} as any);

            await authService.logout();

            expect(account.deleteSession).toHaveBeenCalledWith('current');
        });

        it('should handle logout error', async () => {
            vi.spyOn(account, 'deleteSession').mockRejectedValueOnce(new Error('Logout failed'));

            await expect(authService.logout()).rejects.toThrow('Failed to logout');
        });
    });

    describe('getCurrentUser', () => {
        it('should return current user', async () => {
            const mockAppwriteUser: Models.User<any> = {
                $id: 'user123',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                name: 'Test User',
                email: 'test@example.com',
                phone: '',
                emailVerification: false,
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
            vi.spyOn(authService, 'getUserById').mockResolvedValueOnce(mockUserDoc as unknown as User);

            const result = await authService.getCurrentUser();

            expect(result).toEqual(mockUserDoc);
        });

        it('should return null when no session', async () => {
            vi.spyOn(account, 'get').mockRejectedValueOnce(new Error('No session'));

            const result = await authService.getCurrentUser();

            expect(result).toBeNull();
        });
    });

    describe('password management', () => {
        it('should send password reset email', async () => {
            vi.spyOn(account, 'createRecovery').mockResolvedValueOnce({} as any);

            await authService.sendPasswordReset('test@example.com');

            expect(account.createRecovery).toHaveBeenCalledWith(
                'test@example.com',
                'http://localhost:5173/reset-password'
            );
        });

        it('should reset password', async () => {
            vi.spyOn(account, 'updateRecovery').mockResolvedValueOnce({} as any);

            await authService.resetPassword('user123', 'secret', 'NewTest123!@#');

            expect(account.updateRecovery).toHaveBeenCalledWith(
                'user123',
                'secret',
                'NewTest123!@#',
                'NewTest123!@#'
            );
        });

        it('should update password', async () => {
            vi.spyOn(account, 'updatePassword').mockResolvedValueOnce({} as any);

            await authService.updatePassword('OldTest123!@#', 'NewTest123!@#');

            expect(account.updatePassword).toHaveBeenCalledWith(
                'NewTest123!@#',
                'OldTest123!@#'
            );
        });

        it('should validate password on reset', async () => {
            await expect(authService.resetPassword('user123', 'secret', 'weak')).rejects.toThrow('Password must be at least 8 characters long');
        });
    });

    describe('email management', () => {
        it('should send verification email', async () => {
            vi.spyOn(account, 'createVerification').mockResolvedValueOnce({} as any);

            await authService.sendVerificationEmail();

            expect(account.createVerification).toHaveBeenCalledWith(
                'http://localhost:5173/verify-email'
            );
        });

        it('should verify email', async () => {
            vi.spyOn(account, 'updateVerification').mockResolvedValueOnce({} as any);
            vi.spyOn(databases, 'updateDocument').mockResolvedValueOnce({} as any);

            await authService.verifyEmail('user123', 'secret');

            expect(account.updateVerification).toHaveBeenCalledWith('user123', 'secret');
            expect(databases.updateDocument).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                'user123',
                { emailVerified: true }
            );
        });

        it('should update email', async () => {
            const mockAppwriteUser: Models.User<any> = {
                $id: 'user123',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                name: 'Test User',
                email: 'old@example.com',
                phone: '',
                emailVerification: false,
                phoneVerification: false,
                status: true,
                passwordUpdate: '',
                registration: new Date().toISOString(),
                prefs: {},
                accessedAt: new Date().toISOString(),
                labels: []
            };

            vi.spyOn(account, 'updateEmail').mockResolvedValueOnce({} as any);
            vi.spyOn(account, 'get').mockResolvedValueOnce(mockAppwriteUser);
            vi.spyOn(databases, 'updateDocument').mockResolvedValueOnce({} as any);
            vi.spyOn(authService, 'sendVerificationEmail').mockResolvedValueOnce();

            await authService.updateEmail('new@example.com', 'Test123!@#');

            expect(account.updateEmail).toHaveBeenCalledWith('new@example.com', 'Test123!@#');
            expect(databases.updateDocument).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                'user123',
                {
                    email: 'new@example.com',
                    emailVerified: false
                }
            );
        });
    });
}); 