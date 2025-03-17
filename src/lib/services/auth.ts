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
   * Register a new user (alias for createAccount for API consistency)
   */
  async register(email: string, password: string, name: string, role: keyof typeof USER_ROLES): Promise<User> {
    return this.createAccount({ email, password, name, role });
  }
  
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      // Check if user is locked out
      if (!this.checkLoginAttempts(email)) {
        throw new Error(`Too many failed login attempts. Please try again in 15 minutes.`);
      }

      // Special handling for test accounts
      type TestCredential = {
        password: string;
        role: string;
        name: string;
      };
      
      const testCredentials: Record<string, TestCredential> = {
        'admin@timetablepro.com': { password: 'Admin@123', role: 'ADMIN', name: 'Admin User' },
        'teacher@timetablepro.com': { password: 'Teacher@123', role: 'TEACHER', name: 'Teacher User' },
        'student@timetablepro.com': { password: 'Student@123', role: 'STUDENT', name: 'Student User' }
      };

      // Check if using test credentials
      if (email in testCredentials && password === testCredentials[email].password) {
        // For test accounts, create a mock user without trying to create a session
        // This avoids rate limiting issues with Appwrite
        const mockUser = {
          $id: `test-${testCredentials[email].role.toLowerCase()}`,
          userId: `test-${testCredentials[email].role.toLowerCase()}`,
          email: email,
          name: testCredentials[email].name,
          role: testCredentials[email].role,
          isActive: true,
          emailVerified: true,
          preferences: {},
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        
        // Store the mock user in localStorage to maintain session
        if (browser) {
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
        }
        
        // Reset login attempts on successful login
        this.resetLoginAttempts(email);
        
        return mockUser as unknown as User;
      }

      // Regular login with Appwrite Auth for non-test accounts
      
      // First try to delete any existing session to prevent conflicts
      try {
        const hasSession = localStorage.getItem('cookieFallback') !== null;
        if (hasSession) {
          await account.deleteSession('current');
        }
      } catch (e) {
        // Ignore errors when no session exists
      }
      
      // Create new session
      try {
        await account.createEmailSession(email, password);
      } catch (error: any) {
        // Handle rate limiting specifically
        if (error.code === 429) {
          throw new Error('Too many login attempts. Please wait a few minutes and try again.');
        }
        throw error;
      }
      
      // Get the current account
      const currentAccount = await account.get();
      
      // Get the user document from database
      let user;
      try {
        user = await this.getUserById(currentAccount.$id);
      } catch (error) {
        // If user document doesn't exist, create one
        console.log('User document not found, creating one for the user');
        user = await this.createUserForAccount(currentAccount, 'STUDENT'); // Default to student role
      }

      // Update last login timestamp
      await databases.updateDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        user.$id,
        {
          lastLoginAt: new Date().toISOString()
        }
      );
      
      // Store user in localStorage as backup
      if (browser) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      // Reset login attempts on successful login
      this.resetLoginAttempts(email);
      
      return user;
    } catch (error: any) {
      // Increment login attempts on failure
      this.incrementLoginAttempts(email);
      
      console.error('Login error:', error);
      
      if (error instanceof AppwriteException) {
        switch (error.code) {
          case 401:
            throw new Error('Invalid email or password.');
          case 429:
            throw new Error('Too many login attempts. Please try again later.');
          default:
            throw new Error(`Login failed: ${error.message}`);
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
      // Check if there's an existing session before trying to delete it
      const hasSession = browser && localStorage.getItem('cookieFallback') !== null;
      
      if (hasSession) {
        try {
          await account.deleteSession('current');
        } catch (error: any) {
          // If it's a 401 error, the session is already invalid
          if (error.code !== 401) {
            console.error('Error deleting session:', error);
          }
        }
      }
      
      // Clear any local storage items related to authentication
      if (browser) {
        localStorage.removeItem('cookieFallback');
        localStorage.removeItem('currentUser');
        // Don't remove rememberedEmail as that's a user preference
      }
      
      // UI Testing Mode - No Redirection
      if (browser) {
        console.log('UI Testing Mode - No Redirection in Auth Service Logout');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // UI Testing Mode - No Redirection
      if (browser) {
        // Clear localStorage before redirecting
        localStorage.removeItem('cookieFallback');
        localStorage.removeItem('currentUser');
        console.log('UI Testing Mode - No Redirection in Auth Service Logout (Error)');
      }
    }
  }
  
  /**
   * Get the current user
   */
  async getCurrentUser(retryCount = 0): Promise<User | null> {
    // Prevent infinite recursion
    if (retryCount > 2) {
      console.error('Maximum retry count reached, returning null');
      return null;
    }
    
    try {
      // Check if we're in a browser environment
      if (!browser) {
        return null;
      }
      
      // Try to get user from localStorage backup first
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as User;
          // Validate the user object has required fields
          if (user && user.$id && user.email && user.role) {
            return user;
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('currentUser');
        }
      }
      
      // Check localStorage for a session token
      const hasSession = localStorage.getItem('cookieFallback') !== null;
      if (!hasSession) {
        return null;
      }
      
      try {
        const currentAccount = await account.get();
        
        // Check if this is a test account
        if (currentAccount.$id.startsWith('test-')) {
          const role = currentAccount.$id.includes('admin') 
            ? 'ADMIN' 
            : currentAccount.$id.includes('teacher') 
              ? 'TEACHER' 
              : 'STUDENT';
              
          const user = {
            $id: currentAccount.$id,
            userId: currentAccount.$id,
            email: currentAccount.email,
            name: currentAccount.name,
            role: role,
            isActive: true,
            emailVerified: true,
            preferences: {},
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          } as unknown as User;
          
          // Store in localStorage as backup
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          return user;
        }
        
        // Get the user document from database for regular users
        try {
          const user = await this.getUserById(currentAccount.$id);
          // Store in localStorage as backup
          localStorage.setItem('currentUser', JSON.stringify(user));
          return user;
        } catch (error) {
          // If user document doesn't exist but session does, create the user document
          console.log('User document not found, creating one for the anonymous user');
          const user = await this.createUserForAnonymousSession(currentAccount);
          // Store in localStorage as backup
          localStorage.setItem('currentUser', JSON.stringify(user));
          return user;
        }
      } catch (error: any) {
        // Handle session errors
        console.error('Error getting current account:', error);
        
        // Check for browser extension errors
        const errorStr = error.toString ? error.toString() : '';
        const errorMsg = error.message || '';
        
        if (
          errorMsg.includes('message port closed') || 
          errorMsg.includes('back/forward cache') ||
          errorMsg.includes('runtime.lastError') ||
          errorStr.includes('runtime.lastError')
        ) {
          console.warn('Browser extension interference detected, using localStorage backup');
          
          // Try to use localStorage backup
          if (storedUser) {
            try {
              return JSON.parse(storedUser) as User;
            } catch (e) {
              console.error('Error parsing stored user:', e);
            }
          }
          
          // Wait a moment and retry
          return new Promise((resolve) => {
            setTimeout(async () => {
              try {
                const result = await this.getCurrentUser(retryCount + 1);
                resolve(result);
              } catch (retryError) {
                console.error('Failed to get current user on retry:', retryError);
                resolve(null);
              }
            }, 300);
          });
        }
        
        // If the error is related to an invalid session, clear it
        if (error.code === 401) {
          try {
            localStorage.removeItem('cookieFallback');
          } catch (e) {
            console.error('Error clearing invalid session:', e);
          }
        }
        
        return null;
      }
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }
  
  /**
   * Create an anonymous session
   */
  async createAnonymousSession(): Promise<void> {
    try {
      // First check if we already have a session
      try {
        await account.get();
        console.log('Session already exists, skipping anonymous session creation');
        return;
      } catch (error: any) {
        // Only create a new session if we got a 401 error (unauthorized)
        if (error && error.code === 401) {
          // Clear any existing session data first
          localStorage.removeItem('cookieFallback');
          
          try {
            // Create anonymous session
            await account.createAnonymousSession();
            console.log('Anonymous session created successfully');
          } catch (sessionError) {
            console.error('Failed to create anonymous session:', sessionError);
          }
        }
      }
    } catch (error) {
      console.error('Error in createAnonymousSession:', error);
    }
  }
  
  /**
   * Create a user document for an anonymous session
   */
  async createUserForAnonymousSession(accountDetails: any): Promise<User> {
    try {
      console.log('Creating user document for anonymous session');
      
      // Create a new user document for the anonymous user with only required fields
      // Remove fields that might not exist in the collection schema
      const userData = {
        userId: accountDetails.$id,
        email: accountDetails.email || `anonymous-${accountDetails.$id}@example.com`,
        name: accountDetails.name || 'Anonymous User',
        role: 'STUDENT', // Default role for anonymous users
      };
      
      try {
        const user = await databases.createDocument(
          DB_CONFIG.databaseId,
          DB_CONFIG.collections.USERS,
          accountDetails.$id,
          userData
        ) as unknown as User;
        
        console.log('User document created for anonymous session:', user);
        return user;
      } catch (error: any) {
        // If there's an error with the document structure, try with even fewer fields
        if (error.message && error.message.includes('Invalid document structure')) {
          console.log('Trying with minimal fields due to schema mismatch');
          
          // Try with absolute minimum fields
          const minimalUserData = {
            userId: accountDetails.$id,
            email: accountDetails.email || `anonymous-${accountDetails.$id}@example.com`,
            name: accountDetails.name || 'Anonymous User',
          };
          
          const user = await databases.createDocument(
            DB_CONFIG.databaseId,
            DB_CONFIG.collections.USERS,
            accountDetails.$id,
            minimalUserData
          ) as unknown as User;
          
          console.log('User document created with minimal fields:', user);
          return user;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error creating user document for anonymous session:', error);
      
      // Return a mock user as fallback to prevent infinite loops
      console.log('Returning mock user as fallback');
      return {
        $id: accountDetails.$id,
        userId: accountDetails.$id,
        email: accountDetails.email || `anonymous-${accountDetails.$id}@example.com`,
        name: accountDetails.name || 'Anonymous User',
        role: 'STUDENT',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      } as unknown as User;
    }
  }
  
  /**
   * Get a user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      // Handle test users
      if (userId.startsWith('test-')) {
        const role = userId.includes('admin') 
          ? 'ADMIN' 
          : userId.includes('teacher') 
            ? 'TEACHER' 
            : 'STUDENT';
            
        const email = role === 'ADMIN' 
          ? 'admin@timetablepro.com' 
          : role === 'TEACHER' 
            ? 'teacher@timetablepro.com' 
            : 'student@timetablepro.com';
            
        return {
          $id: userId,
          userId: userId,
          email: email,
          name: `${role.charAt(0) + role.slice(1).toLowerCase()} User`,
          role: role,
          isActive: true,
          emailVerified: true,
          preferences: {},
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        } as unknown as User;
      }
      
      // Regular database lookup for non-test users
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
      // Special handling for test credentials
      const testEmails = [
        'admin@timetablepro.com',
        'teacher@timetablepro.com',
        'student@timetablepro.com'
      ];
      
      if (testEmails.includes(email)) {
        const role = email.startsWith('admin') 
          ? 'ADMIN' 
          : email.startsWith('teacher') 
            ? 'TEACHER' 
            : 'STUDENT';
            
        const mockUser = {
          $id: `test-${role.toLowerCase()}`,
          userId: `test-${role.toLowerCase()}`,
          email: email,
          name: `${role.charAt(0) + role.slice(1).toLowerCase()} User`,
          role: role,
          isActive: true,
          emailVerified: true,
          preferences: {},
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        
        return mockUser as unknown as User;
      }
      
      // Regular database lookup for non-test accounts
      const response = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        [Query.equal('email', [email])]
      );
      
      if (response.documents.length === 0) {
        return null;
      }
      
      return response.documents[0] as unknown as User;
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

  /**
   * Create a user document for an account
   */
  async createUserForAccount(accountData: any, role: keyof typeof USER_ROLES): Promise<User> {
    try {
      const userData = {
        userId: accountData.$id,
        email: accountData.email,
        name: accountData.name || accountData.email.split('@')[0],
        role,
        isActive: true,
        emailVerified: accountData.emailVerification,
        preferences: {},
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      const userDoc = await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        accountData.$id,
        userData
      );
      
      return userDoc as unknown as User;
    } catch (error) {
      console.error('Error creating user document:', error);
      throw new Error('Failed to create user document.');
    }
  }
}

export const authService = AuthService.getInstance(); 