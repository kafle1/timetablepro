<!-- src/lib/components/ui/tabs/tabs.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    export let value: string;
    export let onValueChange: (value: string) => void = () => {};
    
    const dispatch = createEventDispatcher();
    
    $: if (value) {
        onValueChange(value);
        dispatch('change', value);
    }
</script>

<div class="tabs" {...$$restProps}>
    <slot />
</div>

<style>
    .tabs {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style> 