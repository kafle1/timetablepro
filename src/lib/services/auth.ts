import { account, databases, DB_CONFIG } from '$lib/config/appwrite';
import { ID, Query } from 'appwrite';
import type { User } from '$lib/types';
import { goto } from '$app/navigation';
import { userStore } from '$lib/stores/userStore';
import { handleAppwriteError } from '$lib/utils/error';
import { USER_ROLES, ROUTES } from '$lib/config';

export class AuthService {
    async register(email: string, password: string, name: string, role: keyof typeof USER_ROLES): Promise<User> {
        try {
            // Validate inputs
            if (!email || !password || !name || !role) {
                throw new Error('All fields are required');
            }

            // Create account in Appwrite
            const accountResponse = await account.create(
                ID.unique(),
                email,
                password,
                name
            );

            if (!accountResponse || !accountResponse.$id) {
                throw new Error('Failed to create account');
            }

            try {
                // Create user document in database
                const user = await databases.createDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    accountResponse.$id,
                    {
                        userId: accountResponse.$id,
                        email,
                        name,
                        role,
                        availability: []
                    }
                );

                // Automatically log in after registration
                await this.login(email, password);

                return user as User;
            } catch (dbError) {
                // If database creation fails, clean up the account
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
            // Create email session
            await account.createEmailSession(email, password);
            
            // Get account details
            const accountDetails = await account.get();
            
            // Fetch user details from database
            const user = await this.getUserByEmail(email);
            
            if (user) {
                userStore.set(user);
                
                // Redirect based on role
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
        } catch (error) {
            console.error('Login error:', error);
            throw handleAppwriteError(error);
        }
    }

    async loginWithGoogle(): Promise<void> {
        try {
            const successUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:5173/(auth)/auth/callback'
                : `${window.location.origin}/(auth)/auth/callback`;
            const failureUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:5173/login?error=google_auth_failed'
                : `${window.location.origin}/login?error=google_auth_failed`;

            // Create OAuth2 session with proper redirect URLs
            await account.createOAuth2Session(
                'google',
                successUrl,
                failureUrl,
                ['openid', 'email', 'profile']
            );
        } catch (error) {
            console.error('Google login error:', error);
            throw handleAppwriteError(error);
        }
    }

    async handleOAuthCallback(): Promise<void> {
        try {
            // Get the current session and account details
            const [session, accountDetails] = await Promise.all([
                account.getSession('current'),
                account.get()
            ]).catch(error => {
                console.error('Failed to get session or account:', error);
                throw new Error('Authentication failed. Please try again.');
            });
            
            if (!session || !accountDetails) {
                throw new Error('Authentication session not found');
            }
            
            // Check if user exists in database
            let user = await this.getUserByEmail(accountDetails.email);
            
            if (!user) {
                // Create new user document with default role as STUDENT
                user = await databases.createDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.USERS,
                    accountDetails.$id,
                    {
                        userId: accountDetails.$id,
                        email: accountDetails.email,
                        name: accountDetails.name,
                        role: USER_ROLES.STUDENT,
                        availability: []
                    }
                ) as User;

                if (!user) {
                    throw new Error('Failed to create user profile');
                }
            }
            
            userStore.set(user);
            
            // Redirect based on role
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
                [Query.equal('email', email)]
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
            userStore.set(null);
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
            console.error('Get current user error:', error);
            return null;
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