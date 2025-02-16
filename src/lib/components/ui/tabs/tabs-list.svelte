<!-- src/lib/components/ui/tabs/tabs-list.svelte -->
<script lang="ts">
    import { getContext } from 'svelte';
</script>

<div
    class="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
    role="tablist"
    {...$$restProps}
>
    <slot />
</div>

<style>
    div {
        background-color: var(--muted, hsl(0 0% 96.1%));
        color: var(--muted-foreground, hsl(0 0% 45.1%));
    }

    :global(.dark) div {
        background-color: var(--muted, hsl(0 0% 14.9%));
        color: var(--muted-foreground, hsl(0 0% 63.9%));
    }
</style> 