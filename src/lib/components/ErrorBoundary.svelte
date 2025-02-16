<script lang="ts">
    import { handleErrorBoundary } from '$lib/utils/error';
    import { toasts } from '$lib/stores/toastStore';
    import { onMount } from 'svelte';

    let error: Error | null = null;
    let componentStack: string = '';
    let hasError = false;

    onMount(() => {
        if (hasError) {
            toasts.error('Something went wrong. Please try again.');
        }
    });

    function handleError(event: Event) {
        if (event instanceof ErrorEvent) {
            const currentError = event.error || new Error('Unknown error occurred');
            error = currentError;
            componentStack = currentError.stack || '';
            hasError = true;

            const { message } = handleErrorBoundary(currentError, componentStack);
            toasts.error(message);

            // Prevent the error from being logged to the console
            event.preventDefault();
        }
    }

    function handleReset() {
        error = null;
        componentStack = '';
        hasError = false;
    }
</script>

<svelte:window on:error={handleError} />

{#if hasError}
    <div class="flex min-h-[400px] w-full flex-col items-center justify-center p-4 text-center">
        <div class="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900 dark:text-red-200">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
        </div>
        <h2 class="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p class="mb-4 text-muted-foreground">
            We're sorry, but something went wrong. Please try again or contact support if the problem
            persists.
        </p>
        <div class="flex gap-4">
            <button
                class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                on:click={() => window.location.reload()}
            >
                Reload Page
            </button>
            <button
                class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                on:click={handleReset}
            >
                Try Again
            </button>
        </div>
        {#if import.meta.env.DEV && error}
            <div class="mt-8 w-full max-w-2xl overflow-auto rounded-md bg-muted p-4 text-left">
                <p class="font-mono text-sm text-muted-foreground">{error.message}</p>
                {#if componentStack}
                    <pre class="mt-2 text-xs text-muted-foreground">{componentStack}</pre>
                {/if}
            </div>
        {/if}
    </div>
{:else}
    <slot />
{/if} 