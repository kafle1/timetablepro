import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    timeout: number;
}

interface ToastStore {
    toasts: Toast[];
}

const DEFAULT_TIMEOUT = 5000; // 5 seconds

function createToastStore() {
    const { subscribe, update } = writable<ToastStore>({ toasts: [] });

    function addToast(message: string, type: ToastType, timeout: number = DEFAULT_TIMEOUT) {
        if (!browser) return;
        
        const id = crypto.randomUUID();
        
        update(store => {
            // Add new toast to the beginning of the array
            store.toasts = [{ id, message, type, timeout }, ...store.toasts];
            return store;
        });
        
        // Auto-remove toast after timeout
        setTimeout(() => removeToast(id), timeout);
        
        return id;
    }

    function removeToast(id: string) {
        update(store => {
            store.toasts = store.toasts.filter(toast => toast.id !== id);
            return store;
        });
    }

    return {
        subscribe,
        
        success: (message: string, timeout?: number) => 
            addToast(message, 'success', timeout),
            
        error: (message: string, timeout?: number) => 
            addToast(message, 'error', timeout),
            
        warning: (message: string, timeout?: number) => 
            addToast(message, 'warning', timeout),
            
        info: (message: string, timeout?: number) => 
            addToast(message, 'info', timeout),
        
        remove: removeToast,
        
        clear: () => update(store => ({ toasts: [] }))
    };
}

export const toastStore = createToastStore(); 