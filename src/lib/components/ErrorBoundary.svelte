<script lang="ts">
    import { toastStore } from '$lib/stores/toastStore';
    import { onMount } from 'svelte';

    export let error: Error | null = null;

    // Show error toast when error is provided
    onMount(() => {
        if (error) {
            toastStore.error(error.message || 'An unexpected error occurred');
        }
    });
</script>

{#if error}
    <div class="p-4 mt-4 border border-red-200 rounded-md bg-red-50">
        <h3 class="text-lg font-medium text-red-800">An error occurred</h3>
        <p class="mt-2 text-sm text-red-700">{error.message}</p>
        {#if error.stack}
            <details class="mt-2">
                <summary class="text-sm text-red-700 cursor-pointer">Show details</summary>
                <pre class="p-2 mt-1 overflow-auto text-xs bg-red-100 rounded">{error.stack}</pre>
            </details>
        {/if}
    </div>
{:else}
    <slot />
{/if} 