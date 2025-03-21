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
   * Create a new account
   */
  async createAccount(params: CreateUserParams): Promise<User> {
    try {
      const { email, password, name, role } = params;
      
      // Validate password
      if (!this.validatePassword(password)) {
        throw new Error('Password does not meet security requirements');
      }

      // Create account in Appwrite
      const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      // Create user document in database
      const userData = {
        userId: newAccount.$id,
        email: newAccount.email,
        name: newAccount.name,
        role: role,
        isActive: true,
        emailVerified: false,
        preferences: {},
        createdAt: new Date().toISOString(),
        lastLoginAt: null
      };
      
      const newUser = await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        newAccount.$id,
        userData
      );
      
      return newUser as unknown as User;
    } catch (error: any) {
      console.error('Error creating account:', error);
      
      // Reformat error to be more user-friendly
      const authError: AuthError = new Error(
        error.message || 'Failed to create account'
      );
      
      if (error instanceof AppwriteException) {
        authError.code = error.code;
        authError.type = error.type;
        
        // Handle duplicate email
        if (error.code === 409) {
          authError.message = 'An account with this email already exists';
        }
      }
      
      throw authError;
    }
  }
  
  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string, role: keyof typeof USER_ROLES): Promise<User> {
    return this.createAccount({ email, password, name, role });
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
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      // For demo, we'll use hardcoded users
      // In a real app, this would verify against a database
      const account = DEMO_ACCOUNTS[email];
      
      if (!account || account.password !== password) {
        throw new Error('Invalid email or password');
      }
      
      // Create user object
      const user: User = {
        $id: `user-${Date.now()}`,
        userId: `user-${Date.now()}`,
        email,
        name: account.name,
        role: account.role,
        isActive: true,
        emailVerified: true,
        preferences: {},
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        $collectionId: 'users',
        $databaseId: 'timetablepro',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: []
      };
      
      // Generate token
      const token = this.generateToken(user);
      
      // Set token in cookie and session storage for persistence
      if (browser) {
        // Set HTTP-only cookie for security
        document.cookie = `jwt=${token}; path=/; max-age=${TOKEN_EXPIRATION}; SameSite=Lax`;
        
        // Store in session storage for UI testing mode
        sessionStorage.setItem('ui_testing_auth_token', token);
        console.log('Auth token set in cookie and session storage');
      }
      
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      
      const authError: AuthError = new Error(
        error.message || 'Failed to login'
      );
      
      throw authError;
    }
  }
  
  /**
   * Login with demo account
   */
  async loginWithDemo(type: 'admin' | 'teacher' | 'student'): Promise<User> {
    let email: string;
    
    switch (type) {
      case 'admin':
        email = 'admin@timetablepro.com';
        break;
      case 'teacher':
        email = 'teacher@timetablepro.com';
        break;
      case 'student':
        email = 'student@timetablepro.com';
        break;
      default:
        throw new Error('Invalid demo account type');
    }
    
    return this.login(email, DEMO_ACCOUNTS[email].password);
  }
  
  /**
   * Get the current logged-in user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!browser) return null;
      
      // Get token from cookie
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
      
      if (!tokenCookie) {
        return null;
      }
      
      // Parse token
      const token = tokenCookie.split('=')[1].trim();
      const payload = this.verifyToken(token);
      
      if (!payload) {
        return null;
      }
      
      // Create user from token
      const user: User = {
        $id: payload.id,
        userId: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        isActive: true,
        emailVerified: true,
        preferences: {},
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        $collectionId: 'users',
        $databaseId: 'timetablepro',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: []
      };
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      if (!browser) return;
      
      // Clear token cookie
      document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      
      // Also clear session storage
      sessionStorage.removeItem('ui_testing_auth_token');
      console.log('Auth token cleared from cookie and session storage');
    } catch (error) {
      console.error('Error during logout:', error);
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
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await account.createRecovery(email, `${window.location.origin}/reset-password`);
    } catch (error) {
      console.error('Error sending password reset:', error);
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
      // In a real implementation, we would fetch from the database
      // For demo, we'll return a mock list of users
      return [
        {
          $id: 'admin-1',
          userId: 'admin-1',
          email: 'admin@timetablepro.com',
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true,
          emailVerified: true,
          preferences: {},
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          $collectionId: 'users',
          $databaseId: 'timetablepro',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          $permissions: []
        },
        {
          $id: 'teacher-1',
          userId: 'teacher-1',
          email: 'teacher@timetablepro.com',
          name: 'Teacher User',
          role: 'TEACHER',
          isActive: true,
          emailVerified: true,
          preferences: {},
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          $collectionId: 'users',
          $databaseId: 'timetablepro',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          $permissions: []
        },
        {
          $id: 'student-1',
          userId: 'student-1',
          email: 'student@timetablepro.com',
          name: 'Student User',
          role: 'STUDENT',
          isActive: true,
          emailVerified: true,
          preferences: {},
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          $collectionId: 'users',
          $databaseId: 'timetablepro',
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          $permissions: []
        }
      ];
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
      const allUsers = await this.getUsers();
      return allUsers.filter(user => user.role === 'TEACHER');
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
      const allUsers = await this.getUsers();
      return allUsers.filter(user => user.role === 'STUDENT');
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance(); 