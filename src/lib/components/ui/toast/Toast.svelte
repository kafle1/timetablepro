<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-svelte';
    import { cn } from '$lib/utils';
    import type { ToastType } from "$lib/stores/toastStore";

    export let id: string;
    export let type: ToastType = "info";
    export let message: string;
    export let onDismiss: (id: string) => void;
    export let timeout: number = 0;

    const icons = {
        success: Check,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle
    };

    const variants = {
        success: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
        error: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
        info: 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
        warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
    };

    const iconColors = {
        success: 'text-green-500 dark:text-green-400',
        error: 'text-red-500 dark:text-red-400',
        info: 'text-blue-500 dark:text-blue-400',
        warning: 'text-yellow-500 dark:text-yellow-400'
    };

    let timeoutId: number;

    $: {
        if (timeout > 0) {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => onDismiss(id), timeout);
        }
    }

    function handleMouseEnter() {
        clearTimeout(timeoutId);
    }

    function handleMouseLeave() {
        if (timeout > 0) {
            timeoutId = window.setTimeout(() => onDismiss(id), timeout);
        }
    }

    function onClose() {
        onDismiss(id);
    }

    // Determine the icon based on the toast type
    $: icon = icons[type] || Info;
    $: bgClass = variants[type] || variants.info;
    $: iconClass = iconColors[type] || iconColors.info;
</script>

<div
    class={cn(
        'pointer-events-auto flex w-full max-w-md rounded-lg shadow-lg',
        bgClass
    )}
    role="alert"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    in:fly={{ x: 100, duration: 200 }}
    out:fade
>
    <div class="flex w-0 flex-1 items-center p-4">
        <div class="flex-shrink-0">
            <svelte:component
                this={icon}
                class={cn('h-5 w-5', iconClass)}
            />
        </div>
        <div class="ml-3 flex-1">
            <p class="text-sm font-medium">{message}</p>
        </div>
    </div>
    <div class="flex border-l border-gray-200 dark:border-gray-700">
        <button
            class="flex items-center justify-center p-4 hover:text-gray-500 dark:hover:text-gray-400"
            on:click={onClose}
        >
            <span class="sr-only">Close</span>
            <X class="h-5 w-5" />
        </button>
    </div>
</div> 