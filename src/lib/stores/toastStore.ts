import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

function createToastStore() {
    const { subscribe, update } = writable<Toast[]>([]);

    function addToast(toast: Omit<Toast, 'id'>) {
        const id = crypto.randomUUID();
        update(toasts => [...toasts, { ...toast, id }]);

        if (toast.duration !== 0) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration || 5000);
        }

        return id;
    }

    function removeToast(id: string) {
        update(toasts => toasts.filter(t => t.id !== id));
    }

    function clearToasts() {
        update(() => []);
    }

    return {
        subscribe,
        success: (message: string, duration?: number) => 
            addToast({ type: 'success', message, duration }),
        error: (message: string, duration?: number) => 
            addToast({ type: 'error', message, duration }),
        info: (message: string, duration?: number) => 
            addToast({ type: 'info', message, duration }),
        warning: (message: string, duration?: number) => 
            addToast({ type: 'warning', message, duration }),
        remove: removeToast,
        clear: clearToasts
    };
}

export const toasts = createToastStore(); 