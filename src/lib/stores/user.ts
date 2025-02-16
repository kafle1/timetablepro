import { writable } from 'svelte/store';
import type { User } from '$lib/types';

function createUserStore() {
    const { subscribe, set, update } = writable<User | null>(null);

    return {
        subscribe,
        set,
        update,
        reset: () => set(null)
    };
}

export const userStore = createUserStore(); 