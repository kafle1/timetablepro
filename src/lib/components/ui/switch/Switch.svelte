<script lang="ts">
    import { cn } from '$lib/utils';
    import { createEventDispatcher } from 'svelte';

    export let checked = false;
    export let disabled = false;
    export let required = false;
    export let name: string | undefined = undefined;
    export let value: string | undefined = undefined;
    export let id: string | undefined = undefined;
    export let className: string | undefined = undefined;
    export let labelClassName: string | undefined = undefined;

    const dispatch = createEventDispatcher<{
        change: { checked: boolean };
    }>();

    function handleChange() {
        if (!disabled) {
            checked = !checked;
            dispatch('change', { checked });
        }
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (disabled) return;

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            handleChange();
        }
    }
</script>

<div class="flex items-center space-x-2">
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-required={required}
        {disabled}
        {id}
        class={cn(
            'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-primary' : 'bg-input',
            className
        )}
        on:click={handleChange}
        on:keydown={handleKeyDown}
    >
        <span
            class={cn(
                'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
                checked ? 'translate-x-5' : 'translate-x-0'
            )}
        />
    </button>
    {#if $$slots.default}
        <label
            for={id}
            class={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                labelClassName
            )}
        >
            <slot />
        </label>
    {/if}
    {#if name}
        <input type="checkbox" {name} {value} {checked} class="hidden" />
    {/if}
</div> 