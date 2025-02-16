import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

// Mock Appwrite
vi.mock('appwrite', () => {
    return {
        Client: class {
            setEndpoint() { return this; }
            setProject() { return this; }
        },
        Account: class {
            create: ReturnType<typeof vi.fn>;
            createEmailSession: ReturnType<typeof vi.fn>;
            get: ReturnType<typeof vi.fn>;
            delete: ReturnType<typeof vi.fn>;
            updateEmail: ReturnType<typeof vi.fn>;
            updateName: ReturnType<typeof vi.fn>;
            updatePassword: ReturnType<typeof vi.fn>;

            constructor() {
                this.create = vi.fn();
                this.createEmailSession = vi.fn();
                this.get = vi.fn();
                this.delete = vi.fn();
                this.updateEmail = vi.fn();
                this.updateName = vi.fn();
                this.updatePassword = vi.fn();
            }
        },
        Databases: class {
            createDocument: ReturnType<typeof vi.fn>;
            listDocuments: ReturnType<typeof vi.fn>;
            getDocument: ReturnType<typeof vi.fn>;
            updateDocument: ReturnType<typeof vi.fn>;
            deleteDocument: ReturnType<typeof vi.fn>;

            constructor() {
                this.createDocument = vi.fn();
                this.listDocuments = vi.fn();
                this.getDocument = vi.fn();
                this.updateDocument = vi.fn();
                this.deleteDocument = vi.fn();
            }
        }
    };
});

// Mock environment variables
vi.stubGlobal('import.meta', {
    env: {
        TEST: true,
        VITE_APPWRITE_ENDPOINT: 'http://localhost',
        VITE_APPWRITE_PROJECT_ID: 'test-project',
        VITE_APPWRITE_DATABASE_ID: 'test-database'
    }
});

// Mock IntersectionObserver
class IntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver
});

Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver
});

// Mock ResizeObserver
class ResizeObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver
});

Object.defineProperty(global, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
});

// Cleanup after each test
afterEach(() => {
    cleanup();
}); 