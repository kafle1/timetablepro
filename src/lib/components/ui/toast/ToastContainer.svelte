<script lang="ts">
    import { toasts } from '$lib/stores/toastStore';
    import Toast from './Toast.svelte';
</script>

<div
    class="fixed right-0 top-0 z-50 flex max-h-screen w-full flex-col items-end gap-2 p-4 sm:max-w-[420px]"
    aria-live="polite"
>
    {#each $toasts as toast (toast.id)}
        <Toast
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={() => toasts.remove(toast.id)}
        />
    {/each}
</div> 