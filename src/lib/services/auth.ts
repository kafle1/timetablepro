import { account, teams } from '$lib/config/appwrite';
import { authStore } from '$lib/stores/auth';
import type { AppUser } from '$lib/stores/auth';
import { ID } from 'appwrite';
import { get } from 'svelte/store';

export const checkSession = async () => {
    try {
        await account.getSession('current');
        const user = await account.get();
        const userTeams = await teams.list();
        
        const isAdmin = userTeams.teams.some(team => team.name === 'Administrators');
        const role = isAdmin ? 'admin' : 'teacher'; // Default to teacher if not admin

        const appUser: AppUser = {
            ...user,
            role
        };

        authStore.setUser(appUser);
        return appUser;
    } catch {
        authStore.setUser(null);
        return null;
    }
};

export const login = async (email: string, password: string) => {
    try {
        authStore.setLoading(true);
        await account.createSession(email, password);
        const user = await account.get();
        const userTeams = await teams.list();
        
        const isAdmin = userTeams.teams.some(team => team.name === 'Administrators');
        const role = isAdmin ? 'admin' : 'teacher';

        const appUser: AppUser = {
            ...user,
            role
        };

        authStore.setUser(appUser);
        return appUser;
    } catch (error) {
        if (error instanceof Error) {
            authStore.setError(error.message);
        } else {
            authStore.setError('An unknown error occurred');
        }
        throw error;
    }
};

export const register = async (email: string, password: string, name: string) => {
    try {
        authStore.setLoading(true);
        const user = await account.create(
            ID.unique(),
            email,
            password,
            name
        );
        
        // By default, new users are teachers
        const role = 'teacher';
        
        await login(email, password);
        
        const appUser: AppUser = {
            ...user,
            role
        };
        
        authStore.setUser(appUser);
        return appUser;
    } catch (error) {
        if (error instanceof Error) {
            authStore.setError(error.message);
        } else {
            authStore.setError('An unknown error occurred');
        }
        throw error;
    }
};

export const logout = async () => {
    try {
        await account.deleteSession('current');
        authStore.reset();
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

export const updateProfile = async (name: string, avatarFile?: File) => {
    try {
        await account.updateName(name);
        
        if (avatarFile) {
            // Avatar upload logic will be implemented here
            // using storage.createFile() in the avatars bucket
        }
        
        const user = await account.get();
        const currentState = get(authStore);
        
        const appUser: AppUser = {
            ...user,
            role: currentState.user?.role || 'teacher'
        };
        
        authStore.setUser(appUser);
        return appUser;
    } catch (error) {
        if (error instanceof Error) {
            authStore.setError(error.message);
        } else {
            authStore.setError('An unknown error occurred');
        }
        throw error;
    }
}; 