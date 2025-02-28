import { ID, Query } from 'appwrite';
import { account, databases, DB_CONFIG } from '$lib/config/appwrite';
import type { User } from '$lib/types';
import { USER_ROLES } from '$lib/config/constants';

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  role: keyof typeof USER_ROLES;
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
  /**
   * Create a new account
   */
  async createAccount(params: CreateUserParams): Promise<User> {
    try {
      const { email, password, name, role } = params;
      
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
        preferences: {}
      };
      
      const userDoc = await databases.createDocument(
        DB_CONFIG.databaseId,
        DB_CONFIG.collections.USERS,
        newAccount.$id,
        userData
      );
      
      return userDoc as unknown as User;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }
  
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      // Login with Appwrite Auth
      await account.createEmailSession(email, password);
      
      // Get the current account
      const currentAccount = await account.get();
      
      // Get the user document from database
      const user = await this.getUserById(currentAccount.$id);
      
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
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
      console.error('Error logging out:', error);
      throw error;
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
      throw error;
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
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await account.createRecovery(email, 'http://localhost:5173/reset-password');
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
  
  /**
   * Update password
   */
  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await account.updatePassword(newPassword, oldPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 