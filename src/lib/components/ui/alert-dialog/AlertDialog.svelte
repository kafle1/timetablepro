<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import { X } from 'lucide-svelte';
    import { cn } from '$lib/utils';
    import LoadingButton from '../button/LoadingButton.svelte';

    export let open = false;
    export let title: string;
    export let description: string;
    export let confirmText = 'Confirm';
    export let cancelText = 'Cancel';
    export let destructive = false;
    export let loading = false;
    export let className: string | undefined = undefined;

    const dispatch = createEventDispatcher<{
        confirm: void;
        cancel: void;
    }>();

    let dialog: HTMLDialogElement;

    $: if (dialog) {
        if (open) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }

    function handleConfirm() {
        dispatch('confirm');
    }

    function handleCancel() {
        open = false;
        dispatch('cancel');
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            handleCancel();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
    <dialog
        bind:this={dialog}
        class={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
            className
        )}
        on:close={handleCancel}
    >
        <div class="flex flex-col space-y-2 text-center sm:text-left">
            <h2 class="text-lg font-semibold leading-none tracking-tight">{title}</h2>
            <p class="text-sm text-muted-foreground">{description}</p>
        </div>

        <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                on:click={handleCancel}
                disabled={loading}
            >
                {cancelText}
            </button>
            <LoadingButton
                type="button"
                variant={destructive ? 'destructive' : 'default'}
                {loading}
                on:click={handleConfirm}
            >
                {confirmText}
            </LoadingButton>
        </div>

        <button
            type="button"
            class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            on:click={handleCancel}
            disabled={loading}
        >
            <X class="h-4 w-4" />
            <span class="sr-only">Close</span>
        </button>
    </dialog>

    <div
        class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        transition:fade={{ duration: 150 }}
    />
{/if} 