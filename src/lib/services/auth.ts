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
            // Create account in Appwrite
            const accountResponse = await account.create(
                ID.unique(),
                email,
                password,
                name
            );

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
            const redirectUrl = window.location.origin + '/auth/callback';
            const failureUrl = window.location.origin + '/login';
            
            // Create OAuth2 session
            account.createOAuth2Session(
                'google',
                redirectUrl,
                failureUrl,
                ['profile', 'email']
            );
        } catch (error) {
            console.error('Google login error:', error);
            throw handleAppwriteError(error);
        }
    }

    async handleOAuthCallback(): Promise<void> {
        try {
            // Get the current session
            const session = await account.getSession('current');
            
            // Get account details
            const accountDetails = await account.get();
            
            // Check if user exists in database
            let user = await this.getUserByEmail(accountDetails.email);
            
            if (!user) {
                // Create new user document
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