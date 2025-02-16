// Custom error classes
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public status: number = 500,
        public data?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export class ValidationError extends AppError {
    constructor(message: string, data?: any) {
        super(message, 'VALIDATION_ERROR', 400, data);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 'AUTHENTICATION_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 'AUTHORIZATION_ERROR', 403);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 'NOT_FOUND_ERROR', 404);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 'CONFLICT_ERROR', 409);
        this.name = 'ConflictError';
    }
}

// Error handling utilities
export function isAppError(error: any): error is AppError {
    return error instanceof AppError;
}

export function handleError(error: any): AppError {
    if (isAppError(error)) {
        return error;
    }

    // Handle Appwrite errors
    if (error?.code && error?.message) {
        return new AppError(
            error.message,
            error.code,
            error.status || 500
        );
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return new AppError(
            'Network error. Please check your connection.',
            'NETWORK_ERROR',
            503
        );
    }

    // Handle unknown errors
    console.error('Unhandled error:', error);
    return new AppError(
        'An unexpected error occurred',
        'INTERNAL_ERROR',
        500
    );
}

// Error response formatter
export function formatErrorResponse(error: AppError) {
    return {
        error: {
            message: error.message,
            code: error.code,
            ...(error.data && { data: error.data })
        }
    };
}

// Error logging utility
export function logError(error: any, context: Record<string, any> = {}) {
    const errorToLog = {
        timestamp: new Date().toISOString(),
        name: error.name || 'Error',
        message: error.message,
        code: error.code,
        stack: error.stack,
        ...context
    };

    // In development, log to console
    if (import.meta.env.DEV) {
        console.error('Error:', errorToLog);
    }

    // TODO: In production, send to error tracking service
    // if (import.meta.env.PROD) {
    //     // Send to error tracking service
    // }
}

// HTTP error handler
export function handleHttpError(error: any) {
    const appError = handleError(error);
    
    return {
        status: appError.status,
        body: formatErrorResponse(appError)
    };
}

// Form error handler
export function handleFormError(error: AppError) {
    return {
        message: error.message,
        errors: error.data || {},
        code: error.code
    };
}

// Async error handler
export async function handleAsync<T>(
    promise: Promise<T>
): Promise<[T | null, AppError | null]> {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        const appError = handleError(error);
        return [null, appError];
    }
}

interface ErrorBoundaryResult {
    message: string;
    retry: () => void;
    error: Error;
    componentStack: string;
}

export function handleErrorBoundary(error: Error, componentStack: string): ErrorBoundaryResult {
    logError(error, { componentStack });
    
    return {
        message: 'Something went wrong',
        retry: () => window.location.reload(),
        error,
        componentStack
    };
}

// Appwrite error handler
export function handleAppwriteError(error: any): AppError {
    if (error?.code && error?.message) {
        return new AppError(
            error.message,
            error.code,
            error.status || 500
        );
    }
    return handleError(error);
} 