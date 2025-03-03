import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { authService } from '$lib/services/auth';
import Login from '../routes/(auth)/login/+page.svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import type { User } from '$lib/types';
import type { Models } from 'appwrite';
import { writable } from 'svelte/store';

// Mock modules
vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

// Create a writable store for testing
const mockPage = writable({
    url: new URL('http://localhost:5173/login'),
    params: {},
    route: { id: '/login' },
    status: 200,
    error: null,
    data: {},
    form: null
});

vi.mock('$app/stores', () => ({
    page: mockPage
}));

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Reset page store
        mockPage.set({
            url: new URL('http://localhost:5173/login'),
            params: {},
            route: { id: '/login' },
            status: 200,
            error: null,
            data: {},
            form: null
        });
    });

    it('should render login form', () => {
        render(Login);
        
        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
    });

    it('should show validation errors for empty fields', async () => {
        render(Login);
        
        const signInButton = screen.getByRole('button', { name: /sign in/i });
        await fireEvent.click(signInButton);

        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('should show validation error for invalid email', async () => {
        render(Login);
        
        const emailInput = screen.getByLabelText(/email/i);
        await fireEvent.input(emailInput, { target: { value: 'invalid-email' } });

        const signInButton = screen.getByRole('button', { name: /sign in/i });
        await fireEvent.click(signInButton);

        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    it('should handle successful login', async () => {
        const mockUser: User = {
            $id: 'user123',
            $collectionId: 'users',
            $databaseId: 'timetablepro',
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            userId: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'STUDENT',
            isActive: true,
            emailVerified: true,
            preferences: {}
        };

        vi.spyOn(authService, 'login').mockResolvedValueOnce(mockUser);
        render(Login);
        
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
        await fireEvent.input(passwordInput, { target: { value: 'Test123!@#' } });

        const signInButton = screen.getByRole('button', { name: /sign in/i });
        await fireEvent.click(signInButton);

        expect(authService.login).toHaveBeenCalledWith('test@example.com', 'Test123!@#');
    });

    it('should handle login error', async () => {
        vi.spyOn(authService, 'login').mockRejectedValueOnce(new Error('Invalid credentials'));
        render(Login);
        
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
        await fireEvent.input(passwordInput, { target: { value: 'wrong-password' } });

        const signInButton = screen.getByRole('button', { name: /sign in/i });
        await fireEvent.click(signInButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
    });

    it('should handle Google login', async () => {
        vi.spyOn(authService, 'loginWithGoogle').mockResolvedValueOnce();
        render(Login);
        
        const googleButton = screen.getByRole('button', { name: /google/i });
        await fireEvent.click(googleButton);

        expect(authService.loginWithGoogle).toHaveBeenCalled();
    });

    it('should handle Google login error', async () => {
        vi.spyOn(authService, 'loginWithGoogle').mockRejectedValueOnce(new Error('Google login failed'));
        render(Login);
        
        const googleButton = screen.getByRole('button', { name: /google/i });
        await fireEvent.click(googleButton);

        await waitFor(() => {
            expect(screen.getByText(/google login failed/i)).toBeInTheDocument();
        });
    });

    it('should handle remember me functionality', async () => {
        const mockUser: User = {
            $id: 'user123',
            $collectionId: 'users',
            $databaseId: 'timetablepro',
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            userId: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'STUDENT',
            isActive: true,
            emailVerified: true,
            preferences: {}
        };

        vi.spyOn(authService, 'login').mockResolvedValueOnce(mockUser);
        render(Login);
        
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

        await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
        await fireEvent.input(passwordInput, { target: { value: 'Test123!@#' } });
        await fireEvent.click(rememberMeCheckbox);

        const signInButton = screen.getByRole('button', { name: /sign in/i });
        await fireEvent.click(signInButton);

        expect(localStorage.getItem('rememberedEmail')).toBe('test@example.com');
    });

    it('should load remembered email on mount', () => {
        localStorage.setItem('rememberedEmail', 'test@example.com');
        render(Login);
        
        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
        const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i }) as HTMLInputElement;

        expect(emailInput.value).toBe('test@example.com');
        expect(rememberMeCheckbox.checked).toBe(true);
    });

    it('should show success message after email verification', () => {
        mockPage.set({
            url: new URL('http://localhost:5173/login?success=verification_success'),
            params: {},
            route: { id: '/login' },
            status: 200,
            error: null,
            data: {},
            form: null
        });

        render(Login);
        expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
    });

    it('should show error message for unverified email', () => {
        mockPage.set({
            url: new URL('http://localhost:5173/login?error=verification_required'),
            params: {},
            route: { id: '/login' },
            status: 200,
            error: null,
            data: {},
            form: null
        });

        render(Login);
        expect(screen.getByText(/please verify your email address/i)).toBeInTheDocument();
    });

    it('should disable form during submission', async () => {
        vi.spyOn(authService, 'login').mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
        render(Login);
        
        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
        const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
        const signInButton = screen.getByRole('button', { name: /sign in/i }) as HTMLButtonElement;
        const googleButton = screen.getByRole('button', { name: /google/i }) as HTMLButtonElement;

        await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
        await fireEvent.input(passwordInput, { target: { value: 'Test123!@#' } });
        await fireEvent.click(signInButton);

        expect(emailInput.disabled).toBe(true);
        expect(passwordInput.disabled).toBe(true);
        expect(signInButton.disabled).toBe(true);
        expect(googleButton.disabled).toBe(true);
        expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
}); 