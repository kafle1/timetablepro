<!-- src/lib/components/ui/tabs/tabs-content.svelte -->
<script lang="ts">
    import { getContext } from 'svelte';
    import { cn } from '$lib/utils';
    import { fade } from 'svelte/transition';

    export let value: string;

    const currentValue = getContext('tabValue');
</script>

{#if $currentValue === value}
    <div
        role="tabpanel"
        id={`${value}-tab`}
        aria-labelledby={value}
        tabindex="0"
        class={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2')}
        transition:fade
        {...$$restProps}
    >
        <slot />
    </div>
{/if}

<style>
    div {
        outline: none;
    }
</style> 