import type { HTMLAttributes } from 'svelte/elements';

export type MenuTriggerProps = HTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
}; 