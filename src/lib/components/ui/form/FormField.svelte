<script lang="ts">
    import { cn } from '$lib/utils';
    import type { FormErrors } from '$lib/types';

    export let name: string;
    export let label: string;
    export let errors: FormErrors = {};
    export let required = false;
    export let className: string | undefined = undefined;
    export let labelClassName: string | undefined = undefined;
    export let errorClassName: string | undefined = undefined;

    $: error = errors[name]?.[0];
</script>

<div class={cn('flex flex-col gap-2', className)}>
    <label
        for={name}
        class={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            labelClassName
        )}
    >
        {label}
        {#if required}
            <span class="text-destructive">*</span>
        {/if}
    </label>
    <slot />
    {#if error}
        <p class={cn('text-sm font-medium text-destructive', errorClassName)}>
            {error}
        </p>
    {/if}
</div> 