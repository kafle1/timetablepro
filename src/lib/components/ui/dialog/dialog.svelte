<!-- src/lib/components/ui/dialog/dialog.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import { cn } from '$lib/utils';

    export let open = false;
    export let className: string | undefined = undefined;
    export let closeOnClickOutside = true;
    export let closeOnEscape = true;

    const dispatch = createEventDispatcher<{
        close: void;
    }>();

    let dialog: HTMLDialogElement;

    $: if (dialog) {
        if (open) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }

    function handleClose() {
        if (closeOnClickOutside) {
            open = false;
            dispatch('close');
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && closeOnEscape) {
            handleClose();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
    <dialog
        bind:this={dialog}
        class={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
            className
        )}
    >
        <slot />
    </dialog>

    <button
        type="button"
        class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        on:click={handleClose}
        aria-label="Close dialog"
        transition:fade={{ duration: 150 }}
    ></button>
{/if} 