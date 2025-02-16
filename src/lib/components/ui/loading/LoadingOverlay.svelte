<script lang="ts">
    import { fade } from 'svelte/transition';
    import LoadingSpinner from './LoadingSpinner.svelte';

    export let message = 'Loading...';
    export let fullScreen = false;
</script>

<div
    class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    class:fixed={fullScreen}
    class:absolute={!fullScreen}
    transition:fade={{ duration: 150 }}
>
    <div class="flex flex-col items-center gap-4 text-center">
        <LoadingSpinner size="lg" />
        {#if message}
            <p class="text-lg font-medium text-foreground/80">{message}</p>
        {/if}
    </div>
</div> 