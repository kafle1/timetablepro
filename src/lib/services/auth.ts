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
        // First check if we need to clear any existing session
        try {
          if (browser && localStorage.getItem('cookieFallback')) {
            await account.deleteSession('current');
            // Clear the cookie fallback to ensure we're starting fresh
            localStorage.removeItem('cookieFallback');
          }
        } catch (e) {
          // Ignore errors when no session exists or session deletion fails
          console.log('No existing session to clear or error clearing session');
        }
        
        // For test accounts, create a mock user without creating a real session in Appwrite
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
          lastLoginAt: new Date().toISOString(),
          // Add required Appwrite document properties
          $collectionId: DB_CONFIG.collections.USERS,
          $databaseId: DB_CONFIG.databaseId,
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          $permissions: []
        };
        
        // Create a custom session token for our mock authentication
        const mockSessionToken = btoa(JSON.stringify({
          userId: mockUser.$id,
          email: mockUser.email,
          exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days expiry
        }));
        
        // Store the mock session and user in localStorage to maintain session
        if (browser) {
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
          localStorage.setItem('mockSessionToken', mockSessionToken);
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
   * Get the current authenticated user
   */
  async getCurrentUser(retryCount = 0): Promise<User | null> {
    // Prevent infinite recursion
    if (retryCount > 2) {
      console.error('[AuthService] Maximum retry count reached, returning null');
      return null;
    }
    
    try {
      console.log('[AuthService] getCurrentUser called', { retryCount, browser });
      
      // Check if we're in a browser environment
      if (!browser) {
        console.log('[AuthService] Not in browser environment, returning null');
        return null;
      }
      
      // First check for mock session (test accounts)
      const mockSessionToken = localStorage.getItem('mockSessionToken');
      const storedUser = localStorage.getItem('currentUser');
      const cookieFallback = localStorage.getItem('cookieFallback');
      
      console.log('[AuthService] Checking localStorage:', { 
        hasMockToken: !!mockSessionToken, 
        hasStoredUser: !!storedUser,
        hasCookieFallback: !!cookieFallback 
      });
      
      if (mockSessionToken && storedUser) {
        try {
          console.log('[AuthService] Found mock session, validating');
          // Verify the mock session isn't expired
          const mockSession = JSON.parse(atob(mockSessionToken));
          console.log('[AuthService] Mock session data:', mockSession);
          
          if (mockSession.exp > Date.now()) {
            const user = JSON.parse(storedUser) as User;
            console.log('[AuthService] Mock session valid, returning user:', user);
            return user;
          } else {
            // Clear expired mock session
            console.log('[AuthService] Mock session expired, clearing data');
            localStorage.removeItem('mockSessionToken');
            localStorage.removeItem('currentUser');
          }
        } catch (e) {
          console.error('[AuthService] Error parsing mock session:', e);
          localStorage.removeItem('mockSessionToken');
          localStorage.removeItem('currentUser');
        }
      }
      
      // Then check for a regular Appwrite session
      const hasAppwriteSession = localStorage.getItem('cookieFallback') !== null;
      
      console.log('[AuthService] Checking for Appwrite session:', { hasAppwriteSession });
      
      if (!hasAppwriteSession) {
        console.log('[AuthService] No Appwrite session found, returning null');
        return null;
      }
      
      try {
        console.log('[AuthService] Attempting to get account details from Appwrite');
        const currentAccount = await account.get();
        console.log('[AuthService] Retrieved account details:', currentAccount);
        
        // Check if this is a stored user
        if (storedUser) {
          console.log('[AuthService] Found stored user, comparing with account');
          const user = JSON.parse(storedUser) as User;
          if (user.email === currentAccount.email) {
            console.log('[AuthService] Stored user matches account, returning stored user');
            return user;
          }
          console.log('[AuthService] Stored user does not match account, fetching from database');
        }
        
        // Otherwise get from database
        console.log('[AuthService] Querying database for user with email:', currentAccount.email);
        const response = await databases.listDocuments(
          DB_CONFIG.databaseId,
          DB_CONFIG.collections.USERS,
          [Query.equal('email', [currentAccount.email])]
        );
        console.log('[AuthService] Database query results:', { 
          total: response.total,
          hasDocuments: response.documents.length > 0 
        });
        
        if (response.documents.length === 0) {
          console.error('[AuthService] User not found in database for email:', currentAccount.email);
          throw new Error('User not found in database');
        }
        
        const user = response.documents[0] as unknown as User;
        console.log('[AuthService] User found in database:', { 
          userId: user.userId, 
          email: user.email,
          role: user.role
        });
        
        // Store in localStorage for future use
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('[AuthService] Updated stored user in localStorage');
        
        return user;
      } catch (error) {
        console.error('[AuthService] Error getting current user:', error);
        
        // Clear invalid session data
        if (error instanceof AppwriteException && error.code === 401) {
          console.log('[AuthService] Unauthorized (401), clearing localStorage data');
          localStorage.removeItem('cookieFallback');
          localStorage.removeItem('currentUser');
        }
        
        return null;
      }
    } catch (error) {
      console.error('[AuthService] Unexpected error in getCurrentUser:', error);
      return null;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      // Check if there's an existing session before trying to delete it
      const hasSession = browser && localStorage.getItem('cookieFallback') !== null;
      const hasMockSession = browser && localStorage.getItem('mockSessionToken') !== null;
      
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
        localStorage.removeItem('mockSessionToken');
        // Don't remove rememberedEmail as that's a user preference
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Clear localStorage even if there's an error
      if (browser) {
        localStorage.removeItem('cookieFallback');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('mockSessionToken');
      }
      throw error;
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