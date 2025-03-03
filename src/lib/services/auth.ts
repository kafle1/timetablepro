import { ID, Query, AppwriteException } from 'appwrite';
import { account, databases, DB_CONFIG } from '$lib/config/appwrite';
import type { User } from '$lib/types';
import { USER_ROLES } from '$lib/config/constants';
import { browser } from '$app/environment';

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role: keyof typeof USER_ROLES;
}

export interface AuthError extends Error {
  code?: number;
  type?: string;
}

export interface UpdateUserParams {
  name?: string;
  email?: string;
  password?: string;
  role?: keyof typeof USER_ROLES;
  isActive?: boolean;
  preferences?: Record<string, any>;
}

class AuthService {
  private static instance: AuthService;
  private loginAttempts: Map<string, { count: number; lastAttempt: number }>;
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  private constructor() {
    this.loginAttempts = new Map();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  }

  private checkLoginAttempts(email: string): boolean {
    const now = Date.now();
    const attempts = this.loginAttempts.get(email);

    if (!attempts) {
      this.loginAttempts.set(email, { count: 0, lastAttempt: now });
      return true;
    }

    if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = now - attempts.lastAttempt;
      if (timeSinceLastAttempt < this.LOCKOUT_DURATION) {
        const remainingLockout = Math.ceil((this.LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60);
        throw new Error(`Account temporarily locked. Please try again in ${remainingLockout} minutes.`);
      }
      // Reset attempts after lockout period
      this.loginAttempts.set(email, { count: 0, lastAttempt: now });
    }

    return true;
  }

  private incrementLoginAttempts(email: string): void {
    const attempts = this.loginAttempts.get(email);
    if (attempts) {
      this.loginAttempts.set(email, {
        count: attempts.count + 1,
        lastAttempt: Date.now()
      });
    }
  }

  private resetLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }

  /**
   * Create a new account
   */
  async createAccount(params: CreateUserParams): Promise<User> {
    try {
      const { email, password, name, role } = params;
      
      // Validate password
      if (!this.validatePassword(password)) {
        throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.');
      }

      // Validate role
      if (!Object.keys(USER_ROLES).includes(role)) {
        throw new Error('Invalid user role.');
      }

      // Create account in Appwrite Auth
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      // Create user document in database
      const userData = {
        userId: newAccount.$id,
        email,
        name,
        role,
        isActive: true,
        emailVerified: false,
        preferences: {},
        createdAt: new Date().toISOString(),
        lastLoginAt: null
      };
      
      const userDoc = await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        newAccount.$id,
        userData
      );
      
      // Send verification email
      if (browser) {
        await this.sendVerificationEmail();
      }
      
      return userDoc as unknown as User;
    } catch (error) {
      console.error('Error creating account:', error);
      if (error instanceof AppwriteException) {
        switch (error.code) {
          case 409:
            throw new Error('An account with this email already exists.');
          case 400:
            throw new Error('Invalid email or password format.');
          default:
            throw new Error('Failed to create account. Please try again.');
        }
      }
      throw error;
    }
  }
  
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      // Check login attempts
      this.checkLoginAttempts(email);

      // Login with Appwrite Auth
      await account.createEmailSession(email, password);
      
      // Get the current account
      const currentAccount = await account.get();
      
      // Get the user document from database
      const user = await this.getUserById(currentAccount.$id);

      // Update last login timestamp
      await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        user.$id,
        { lastLoginAt: new Date().toISOString() }
      );

      // Reset login attempts on successful login
      this.resetLoginAttempts(email);
      
      return user;
    } catch (error) {
      // Increment failed login attempts
      this.incrementLoginAttempts(email);

      console.error('Error logging in:', error);
      if (error instanceof AppwriteException) {
        switch (error.code) {
          case 401:
            throw new Error('Invalid email or password.');
          case 429:
            throw new Error('Too many login attempts. Please try again later.');
          default:
            throw new Error('Login failed. Please try again.');
        }
      }
      throw error;
    }
  }
  
  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout. Please try again.');
    }
  }
  
  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const currentAccount = await account.get();
      
      // Get the user document from database
      const user = await this.getUserById(currentAccount.$id);
      
      return user;
    } catch (error) {
      // If no session exists, return null
      return null;
    }
  }
  
  /**
   * Get a user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const user = await databases.getDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        userId
      );
      
      return user as unknown as User;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('User not found.');
    }
  }
  
  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        [Query.equal('email', [email])]
      );
      
      return response.documents[0] as unknown as User || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }
  
  /**
   * Update a user
   */
  async updateUser(userId: string, params: UpdateUserParams): Promise<User> {
    try {
      const user = await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        userId,
        params
      );
      
      return user as unknown as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete user document from database
      await databases.deleteDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        userId
      );
      
      // Note: Deleting the actual account from Appwrite Auth
      // requires admin privileges and is typically done through
      // server-side functions
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    try {
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS
      );
      
      return response.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }
  
  /**
   * Get all teachers
   */
  async getTeachers(): Promise<User[]> {
    try {
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        [Query.equal('role', USER_ROLES.TEACHER)]
      );
      
      return response.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting teachers:', error);
      throw error;
    }
  }
  
  /**
   * Get all students
   */
  async getStudents(): Promise<User[]> {
    try {
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        [Query.equal('role', USER_ROLES.STUDENT)]
      );
      
      return response.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  }
  
  /**
   * Get all admins
   */
  async getAdmins(): Promise<User[]> {
    try {
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        [Query.equal('role', USER_ROLES.ADMIN)]
      );
      
      return response.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting admins:', error);
      throw error;
    }
  }
  
  /**
   * Send verification email
   */
  async sendVerificationEmail(): Promise<void> {
    try {
      if (!browser) return;
      const redirectUrl = `${window.location.origin}/verify-email`;
      await account.createVerification(redirectUrl);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  }
  
  /**
   * Verify email
   */
  async verifyEmail(userId: string, secret: string): Promise<void> {
    try {
      await account.updateVerification(userId, secret);
      // Update user document to mark email as verified
      await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        userId,
        { emailVerified: true }
      );
    } catch (error) {
      console.error('Error verifying email:', error);
      throw new Error('Failed to verify email. The link may be expired or invalid.');
    }
  }
  
  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      if (!browser) return;
      const redirectUrl = `${window.location.origin}/reset-password`;
      await account.createRecovery(email, redirectUrl);
    } catch (error) {
      console.error('Error sending password reset:', error);
      throw new Error('Failed to send password reset email. Please try again.');
    }
  }
  
  /**
   * Reset password
   */
  async resetPassword(userId: string, secret: string, newPassword: string): Promise<void> {
    try {
      if (!this.validatePassword(newPassword)) {
        throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.');
      }
      await account.updateRecovery(userId, secret, newPassword, newPassword);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new Error('Failed to reset password. The link may be expired or invalid.');
    }
  }
  
  /**
   * Update password
   */
  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      if (!this.validatePassword(newPassword)) {
        throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.');
      }
      await account.updatePassword(newPassword, oldPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Failed to update password. Please check your current password and try again.');
    }
  }
  
  /**
   * Update email
   */
  async updateEmail(newEmail: string, password: string): Promise<void> {
    try {
      await account.updateEmail(newEmail, password);
      const currentAccount = await account.get();
      await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        currentAccount.$id,
        { 
          email: newEmail,
          emailVerified: false
        }
      );
      // Send verification email for new email
      await this.sendVerificationEmail();
    } catch (error) {
      console.error('Error updating email:', error);
      throw new Error('Failed to update email. Please check your password and try again.');
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      if (!browser) return;

      const redirectUrl = `${window.location.origin}/auth/callback`;
      await account.createOAuth2Session(
        'google',
        redirectUrl,
        redirectUrl,
        ['profile', 'email']
      );
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Google login failed. Please try again.');
    }
  }

  async handleOAuthCallback(): Promise<User> {
    try {
      const currentAccount = await account.get();
      let user = await this.getUserByEmail(currentAccount.email);

      if (!user) {
        // Create new user document for OAuth user
        const userData = {
          userId: currentAccount.$id,
          email: currentAccount.email,
          name: currentAccount.name,
          role: USER_ROLES.STUDENT, // Default role for OAuth users
          isActive: true,
          emailVerified: true,
          preferences: {},
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        user = await databases.createDocument(
          DB_CONFIG.databaseId,
          DB_CONFIG.collections.USERS,
          currentAccount.$id,
          userData
        ) as unknown as User;
      } else {
        // Update last login for existing user
        await databases.updateDocument(
          DB_CONFIG.databaseId,
          DB_CONFIG.collections.USERS,
          user.$id,
          { lastLoginAt: new Date().toISOString() }
        );
      }

      return user;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw new Error('Failed to complete authentication. Please try again.');
    }
  }
}

export const authService = AuthService.getInstance(); 