<script lang="ts" generics="T">
    import { cn } from '$lib/utils';
    import { createEventDispatcher } from 'svelte';

    export let value: T | undefined = undefined;
    export let options: { label: string; value: T; disabled?: boolean }[] = [];
    export let name: string | undefined = undefined;
    export let disabled = false;
    export let required = false;
    export let className: string | undefined = undefined;
    export let orientation: 'horizontal' | 'vertical' = 'vertical';

    const dispatch = createEventDispatcher<{
        change: { value: T | undefined };
    }>();

    function handleChange(option: { label: string; value: T; disabled?: boolean }) {
        if (!disabled && !option.disabled) {
            value = option.value;
            dispatch('change', { value });
        }
    }

    function handleKeyDown(
        event: KeyboardEvent,
        option: { label: string; value: T; disabled?: boolean }
    ) {
        if (disabled || option.disabled) return;

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            handleChange(option);
        }
    }
</script>

<div
    role="radiogroup"
    aria-required={required}
    class={cn(
        'flex gap-2',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        className
    )}
>
    {#each options as option (option.value)}
        <div class="flex items-center space-x-2">
            <button
                type="button"
                role="radio"
                aria-checked={value === option.value}
                disabled={disabled || option.disabled}
                class={cn(
                    'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    value === option.value && 'bg-primary'
                )}
                on:click={() => handleChange(option)}
                on:keydown={event => handleKeyDown(event, option)}
            >
                {#if value === option.value}
                    <div class="relative flex h-full w-full items-center justify-center">
                        <div class="h-2 w-2 rounded-full bg-primary-foreground" />
                    </div>
                {/if}
            </button>
            <label
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                {option.label}
            </label>
            {#if name}
                <input
                    type="radio"
                    {name}
                    value={option.value}
                    checked={value === option.value}
                    class="hidden"
                />
            {/if}
        </div>
    {/each}
</div> 