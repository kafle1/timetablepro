import { vi } from 'vitest';

export class Client {
    setEndpoint() {
        return this;
    }

    setProject() {
        return this;
    }
}

export class Account {
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
}

export class Databases {
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