import { account, databases, DB_CONFIG } from '$lib/config/appwrite';
import { ID, Query, Permission, Role } from 'appwrite';
import type { User } from '$lib/types';
import { goto } from '$app/navigation';
import { userStore } from '$lib/stores/userStore';
import { handleAppwriteError } from '$lib/utils/error';
import { USER_ROLES, ROUTES } from '$lib/config';
import { authStore } from '$lib/stores/auth';

export class AuthService {
    async register(email: string, password: string, name: string, role: keyof typeof USER_ROLES): Promise<User> {
        try {
            // Enhanced validation
            if (!email?.trim() || !password?.trim() || !name?.trim() || !role) {
                console.log('Validation failed:', { email, password, name, role });
                throw new Error('All fields are required');
            }

            // Create account in Appwrite
            const accountResponse = await account.create(
                ID.unique(),
                email.trim(),
                password,
                name.trim()
            );

            if (!accountResponse || !accountResponse.$id) {
                throw new Error('Failed to create account');
            }

            try {
                // Create user document in database with proper permissions
                const user = await databases.createDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    accountResponse.$id,
                    {
                        userId: accountResponse.$id,
                        email: email.trim(),
                        name: name.trim(),
                        role,
                        availability: []
                    },
                    [
                        Permission.read(Role.any()),
                        Permission.update(Role.user(accountResponse.$id)),
                        Permission.delete(Role.user(accountResponse.$id))
                    ]
                ) as User;

                // Automatically log in after registration
                await this.login(email, password);
                return user;
            } catch (dbError) {
                console.error('Database error during registration:', dbError);
                // If database creation fails, clean up the account and sessions
                try {
                    await account.deleteSession('current');
                    await account.deleteSessions();
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError);
                }
                throw dbError;
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw handleAppwriteError(error);
        }
    }

    async login(email: string, password: string): Promise<void> {
        try {
            await account.createEmailSession(email, password);
            const accountDetails = await account.get();
            const user = await this.getUserByEmail(accountDetails.email);
            
            if (!user) {
                throw new Error('User not found in database');
            }

            authStore.set({ user, loading: false, error: null });
            this.redirectToDashboard(user);
        } catch (error) {
            console.error('Login error:', error);
            throw handleAppwriteError(error);
        }
    }

    async loginWithGoogle(): Promise<void> {
        try {
            const origin = window.location.origin;
            const successUrl = `${origin}/auth/callback`;
            const failureUrl = `${origin}/login?error=google_auth_failed`;

            await account.createOAuth2Session(
                'google',
                successUrl,
                failureUrl,
                ['email', 'profile']  // Request these OAuth scopes
            );
        } catch (error) {
            console.error('Google login error:', error);
            if (error instanceof Error) {
                if (error.message.includes('OAuth provider is not configured')) {
                    throw new Error('Google OAuth is not properly configured. Please check your Appwrite settings.');
                }
            }
            throw handleAppwriteError(error);
        }
    }

    async handleOAuthCallback(): Promise<void> {
        try {
            // Get the current session first
            const session = await account.getSession('current');
            if (!session) {
                throw new Error('No active session found');
            }

            const accountDetails = await account.get();
            if (!accountDetails || !accountDetails.email) {
                throw new Error('Failed to get account details');
            }

            // Get or create user document
            let user = await this.getUserByEmail(accountDetails.email);
            
            if (!user) {
                // Create new user document with proper permissions
                user = await databases.createDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    accountDetails.$id,
                    {
                        userId: accountDetails.$id,
                        email: accountDetails.email,
                        name: accountDetails.name || accountDetails.email.split('@')[0],
                        role: USER_ROLES.STUDENT,
                        availability: []
                    },
                    [
                        Permission.read(Role.any()),
                        Permission.update(Role.user(accountDetails.$id)),
                        Permission.delete(Role.user(accountDetails.$id))
                    ]
                ) as User;
            }
            
            authStore.set({ user, loading: false, error: null });
            this.redirectToDashboard(user);
        } catch (error) {
            console.error('OAuth callback error:', error);
            // Clean up the session if something goes wrong
            try {
                await account.deleteSession('current');
            } catch (cleanupError) {
                console.error('Session cleanup error:', cleanupError);
            }
            throw handleAppwriteError(error);
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const response = await databases.listDocuments(
                DB_CONFIG.databaseId,
                DB_CONFIG.collections.USERS,
                [Query.equal('email', [email])]
            );
            
            return response.documents[0] as User || null;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    async logout(): Promise<void> {
        try {
            await account.deleteSession('current');
            authStore.set({ user: null, loading: false, error: null });
            goto(ROUTES.LOGIN);
        } catch (error) {
            console.error('Logout error:', error);
            throw handleAppwriteError(error);
        }
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const accountDetails = await account.get();
            return await this.getUserByEmail(accountDetails.email);
        } catch (error) {
            return null;
        }
    }

    private redirectToDashboard(user: User) {
        switch (user.role) {
            case USER_ROLES.ADMIN:
                goto(ROUTES.ADMIN_DASHBOARD);
                break;
            case USER_ROLES.TEACHER:
                goto(ROUTES.TEACHER_DASHBOARD);
                break;
            default:
                goto(ROUTES.STUDENT_DASHBOARD);
        }
    }
}

export const authService = new AuthService();

export async function updateProfile(user: Partial<User>) {
    try {
        if (user.name) {
            await account.updateName(user.name);
        }
        if (user.email) {
            await account.updateEmail(user.email, user.password);
        }
        return await account.get();
    } catch (error) {
        throw handleAppwriteError(error);
    }
} 