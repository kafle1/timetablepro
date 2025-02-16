import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    isAppError,
    handleError,
    formatErrorResponse,
    logError,
    handleHttpError,
    handleFormError,
    handleAsync,
    handleErrorBoundary
} from './error';

describe('Error Utilities', () => {
    describe('AppError', () => {
        it('should create an AppError with default status', () => {
            const error = new AppError('Test error', 'TEST_ERROR');
            expect(error.message).toBe('Test error');
            expect(error.code).toBe('TEST_ERROR');
            expect(error.status).toBe(500);
            expect(error.name).toBe('AppError');
        });

        it('should create an AppError with custom status and data', () => {
            const error = new AppError('Test error', 'TEST_ERROR', 400, { field: 'value' });
            expect(error.status).toBe(400);
            expect(error.data).toEqual({ field: 'value' });
        });
    });

    describe('ValidationError', () => {
        it('should create a ValidationError', () => {
            const error = new ValidationError('Invalid data');
            expect(error.message).toBe('Invalid data');
            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.status).toBe(400);
            expect(error.name).toBe('ValidationError');
        });
    });

    describe('AuthenticationError', () => {
        it('should create an AuthenticationError with default message', () => {
            const error = new AuthenticationError();
            expect(error.message).toBe('Authentication required');
            expect(error.code).toBe('AUTHENTICATION_ERROR');
            expect(error.status).toBe(401);
            expect(error.name).toBe('AuthenticationError');
        });
    });

    describe('AuthorizationError', () => {
        it('should create an AuthorizationError with default message', () => {
            const error = new AuthorizationError();
            expect(error.message).toBe('Access denied');
            expect(error.code).toBe('AUTHORIZATION_ERROR');
            expect(error.status).toBe(403);
            expect(error.name).toBe('AuthorizationError');
        });
    });

    describe('NotFoundError', () => {
        it('should create a NotFoundError with resource name', () => {
            const error = new NotFoundError('User');
            expect(error.message).toBe('User not found');
            expect(error.code).toBe('NOT_FOUND_ERROR');
            expect(error.status).toBe(404);
            expect(error.name).toBe('NotFoundError');
        });
    });

    describe('ConflictError', () => {
        it('should create a ConflictError', () => {
            const error = new ConflictError('Resource already exists');
            expect(error.message).toBe('Resource already exists');
            expect(error.code).toBe('CONFLICT_ERROR');
            expect(error.status).toBe(409);
            expect(error.name).toBe('ConflictError');
        });
    });

    describe('isAppError', () => {
        it('should return true for AppError instances', () => {
            expect(isAppError(new AppError('Test', 'TEST'))).toBe(true);
            expect(isAppError(new ValidationError('Test'))).toBe(true);
            expect(isAppError(new AuthenticationError())).toBe(true);
        });

        it('should return false for non-AppError instances', () => {
            expect(isAppError(new Error('Test'))).toBe(false);
            expect(isAppError({ message: 'Test' })).toBe(false);
            expect(isAppError(null)).toBe(false);
        });
    });

    describe('handleError', () => {
        it('should return the same error if it is an AppError', () => {
            const error = new AppError('Test', 'TEST');
            expect(handleError(error)).toBe(error);
        });

        it('should handle Appwrite errors', () => {
            const appwriteError = {
                code: 401,
                message: 'Unauthorized',
                status: 401
            };
            const error = handleError(appwriteError);
            expect(error.message).toBe('Unauthorized');
            expect(error.code).toBe(401);
            expect(error.status).toBe(401);
        });

        it('should handle network errors', () => {
            const networkError = new TypeError('Failed to fetch');
            const error = handleError(networkError);
            expect(error.message).toBe('Network error. Please check your connection.');
            expect(error.code).toBe('NETWORK_ERROR');
            expect(error.status).toBe(503);
        });

        it('should handle unknown errors', () => {
            const unknownError = new Error('Unknown error');
            const error = handleError(unknownError);
            expect(error).toBeInstanceOf(AppError);
            expect(error.message).toBe('An unexpected error occurred');
            expect(error.code).toBe('INTERNAL_ERROR');
            expect(error.status).toBe(500);
        });
    });

    describe('formatErrorResponse', () => {
        it('should format error response with basic fields', () => {
            const error = new AppError('Test error', 'TEST_ERROR');
            const response = formatErrorResponse(error);
            expect(response).toEqual({
                error: {
                    message: 'Test error',
                    code: 'TEST_ERROR'
                }
            });
        });

        it('should include data in error response if present', () => {
            const error = new AppError('Test error', 'TEST_ERROR', 400, { field: 'value' });
            const response = formatErrorResponse(error);
            expect(response.error.data).toEqual({ field: 'value' });
        });
    });

    describe('logError', () => {
        const originalConsoleError = console.error;
        const mockConsoleError = vi.fn();

        beforeEach(() => {
            console.error = mockConsoleError;
            vi.resetAllMocks();
        });

        afterEach(() => {
            console.error = originalConsoleError;
        });

        it('should log error with context in development', () => {
            const error = new Error('Test error');
            const context = { userId: '123' };
            logError(error, context);
            expect(mockConsoleError).toHaveBeenCalled();
            const loggedError = mockConsoleError.mock.calls[0][1];
            expect(loggedError.message).toBe('Test error');
            expect(loggedError.userId).toBe('123');
        });
    });

    describe('handleHttpError', () => {
        it('should format error for HTTP response', () => {
            const error = new AppError('Test error', 'TEST_ERROR', 400);
            const response = handleHttpError(error);
            expect(response.status).toBe(400);
            expect(response.body.error.message).toBe('Test error');
            expect(response.body.error.code).toBe('TEST_ERROR');
        });
    });

    describe('handleFormError', () => {
        it('should format error for form response', () => {
            const error = new ValidationError('Invalid form', { field: ['Required'] });
            const response = handleFormError(error);
            expect(response.message).toBe('Invalid form');
            expect(response.errors).toEqual({ field: ['Required'] });
            expect(response.code).toBe('VALIDATION_ERROR');
        });
    });

    describe('handleAsync', () => {
        it('should handle successful promise', async () => {
            const [data, error] = await handleAsync(Promise.resolve('success'));
            expect(data).toBe('success');
            expect(error).toBeNull();
        });

        it('should handle failed promise', async () => {
            const [data, error] = await handleAsync(Promise.reject(new Error('failed')));
            expect(data).toBeNull();
            expect(error).toBeInstanceOf(AppError);
            expect(error?.message).toBe('An unexpected error occurred');
        });
    });

    describe('handleErrorBoundary', () => {
        it('should handle component errors', () => {
            const error = new Error('Component error');
            const componentStack = 'Component stack trace';
            const result = handleErrorBoundary(error, componentStack);
            expect(result.message).toBe('Something went wrong');
            expect(typeof result.retry).toBe('function');
            expect(result.error).toBe(error);
            expect(result.componentStack).toBe(componentStack);
        });
    });
}); 