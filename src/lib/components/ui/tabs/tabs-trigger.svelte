<!-- src/lib/components/ui/tabs/tabs-trigger.svelte -->
<script lang="ts">
    import { getContext } from 'svelte';
    import { cn } from '$lib/utils';

    export let value: string;
    export let disabled = false;

    const currentValue = getContext('tabValue');
</script>

<button
    role="tab"
    aria-selected={$currentValue === value}
    aria-controls={`${value}-tab`}
    disabled={disabled}
    class={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        $currentValue === value
            ? 'bg-background text-foreground shadow-sm'
            : 'hover:bg-muted hover:text-muted-foreground'
    )}
    on:click={() => {
        if (!disabled) {
            $currentValue = value;
        }
    }}
    {...$$restProps}
>
    <slot />
</button>

<style>
    button {
        background-color: transparent;
        border: none;
        cursor: pointer;
    }

    button[aria-selected="true"] {
        background-color: var(--background, white);
        color: var(--foreground, black);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    button:hover:not([aria-selected="true"]) {
        background-color: var(--muted, hsl(0 0% 96.1%));
        color: var(--muted-foreground, hsl(0 0% 45.1%));
    }

    :global(.dark) button[aria-selected="true"] {
        background-color: var(--background, hsl(0 0% 3.9%));
        color: var(--foreground, white);
    }

    :global(.dark) button:hover:not([aria-selected="true"]) {
        background-color: var(--muted, hsl(0 0% 14.9%));
        color: var(--muted-foreground, hsl(0 0% 63.9%));
    }
</style> 