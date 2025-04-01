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

// Secret key for JWT signing (in a real production app, this would be an environment variable)
const JWT_SECRET = 'timetablepro-jwt-secret';

// Define the type for our demo accounts
interface DemoAccount {
  password: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

// Demo accounts for easy testing
const DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  'admin@timetablepro.com': {
    password: 'Admin@123',
    name: 'Admin User',
    role: USER_ROLES.ADMIN as 'ADMIN'
  },
  'teacher@timetablepro.com': {
    password: 'Teacher@123',
    name: 'Teacher User',
    role: USER_ROLES.TEACHER as 'TEACHER'
  },
  'student@timetablepro.com': {
    password: 'Student@123',
    name: 'Student User',
    role: USER_ROLES.STUDENT as 'STUDENT'
  }
};

// Token payload interface
interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  exp: number;
}

// Token expiration in seconds (24 hours)
const TOKEN_EXPIRATION = 24 * 60 * 60;

class AuthService {
  private static instance: AuthService;

  private constructor() {}

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

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!browser) return null;

      // Get current session
      let session;
      try {
        session = await account.getSession('current');
      } catch (error) {
        if (error instanceof AppwriteException && error.code === 401) {
          return null;
        }
        throw error;
      }

      if (!session) return null;

      // Get user data from database
      const userData = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        [Query.equal('userId', session.userId)]
      );

      if (userData.documents.length === 0) {
        return null;
      }

      return userData.documents[0] as unknown as User;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      // Create email session
      await account.createEmailSession(email, password);

      // Get user data
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User not found in database');
      }

      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 401) {
        throw new Error('Invalid email or password');
      } else if (error.code === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      throw new Error(error.message || 'Failed to login');
    }
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string, role: string): Promise<User> {
    try {
      // Create user account
      const userAccount = await account.create(ID.unique(), email, password, name);

      // Create user document in database
      const userDoc = await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        ID.unique(),
        {
          userId: userAccount.$id,
          email,
          name,
          role,
          isActive: true,
          emailVerified: userAccount.emailVerification,
          preferences: {}
        }
      );

      return userDoc as unknown as User;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register');
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await account.createRecovery(email, `${window.location.origin}/auth/reset-password`);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Generate a JWT token
   */
  private generateToken(user: User): string {
    // Simple JWT payload
    const payload: TokenPayload = {
      id: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION
    };

    // In a real implementation, we would sign this with JWT library
    // For demo, we'll use base64 encoding
    return btoa(JSON.stringify(payload));
  }

  /**
   * Parse and verify a JWT token
   */
  public verifyToken(token: string): TokenPayload | null {
    try {
      // Handle both formats - our custom token and simple auth flag
      if (token === 'authenticated') {
        // Handle simplified auth format
        return {
          id: 'mock-admin',
          email: 'admin@timetablepro.com',
          name: 'Admin User',
          role: 'ADMIN',
          exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION
        };
      }
      
      // Try to parse as JSON - could be a JSON string or a base64 encoded JSON
      try {
        // First attempt - direct JSON parse (for session storage tokens)
        return JSON.parse(token) as TokenPayload;
      } catch (parseError) {
        try {
          // Second attempt - base64 decode then JSON parse
          const decoded = JSON.parse(atob(token)) as TokenPayload;
          
          // Check if token is expired
          if (decoded.exp < Math.floor(Date.now() / 1000)) {
            console.log('Token expired');
            return null;
          }
          
          return decoded;
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          return null;
        }
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  /**
   * Login with demo account
   */
  async loginWithDemo(type: 'admin' | 'teacher' | 'student'): Promise<User> {
    try {
      // Get demo account credentials
      const demoEmail = `${type}@timetablepro.com`;
      const demoPassword = DEMO_ACCOUNTS[demoEmail].password;

      // First, try to delete any existing session
      try {
        await account.deleteSession('current');
      } catch (error) {
        // Ignore errors when deleting non-existent session
        console.log('No existing session to delete');
      }

      // Create email session
      await account.createEmailSession(demoEmail, demoPassword);

      // Get user data
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('Demo user not found in database');
      }

      // Ensure the user has the correct role
      if (user.role !== type.toUpperCase()) {
        throw new Error('Invalid demo account role');
      }

      return user;
    } catch (error: any) {
      console.error('Demo login error:', error);
      if (error.code === 401) {
        throw new Error('Invalid demo account credentials');
      } else if (error.code === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      throw new Error(error.message || 'Failed to login with demo account');
    }
  }

  /**
   * Create a demo account
   */
  private async createDemoAccount(email: string): Promise<void> {
    try {
      const accountData = DEMO_ACCOUNTS[email];
      if (!accountData) {
        throw new Error('Invalid demo account email');
      }

      // Create user account
      const userAccount = await account.create(
        ID.unique(),
        email,
        accountData.password,
        accountData.name
      );

      // Create user document in database
      await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        ID.unique(),
        {
          userId: userAccount.$id,
          email,
          name: accountData.name,
          role: accountData.role,
          isActive: true,
          emailVerified: true,
          preferences: {}
        }
      );
    } catch (error) {
      console.error('Error creating demo account:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
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
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }
  
  /**
   * Reset password using recovery code
   */
  async resetPassword(userId: string, secret: string, newPassword: string): Promise<void> {
    try {
      if (!this.validatePassword(newPassword)) {
        throw new Error('New password does not meet security requirements');
      }
      
      await account.updateRecovery(userId, secret, newPassword, newPassword);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
  
  /**
   * Update current user's password
   */
  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      if (!this.validatePassword(newPassword)) {
        throw new Error('New password does not meet security requirements');
      }
      
      await account.updatePassword(newPassword, oldPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    try {
      const userData = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS
      );
      
      return userData.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Get teachers
   */
  async getTeachers(): Promise<User[]> {
    try {
      const userData = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        [Query.equal('role', USER_ROLES.TEACHER)]
      );
      
      return userData.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting teachers:', error);
      throw error;
    }
  }

  /**
   * Get students
   */
  async getStudents(): Promise<User[]> {
    try {
      const userData = await databases.listDocuments(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        [Query.equal('role', USER_ROLES.STUDENT)]
      );
      
      return userData.documents as unknown as User[];
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance(); 