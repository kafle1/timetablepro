<script lang="ts" generics="T">
    import { createEventDispatcher } from 'svelte';
    import type { FormErrors } from '$lib/types';
    import { toastStore } from '$lib/stores/toastStore';
    import LoadingButton from '../button/LoadingButton.svelte';

    export let data: T;
    export let errors: FormErrors = {};
    export let loading = false;
    export let submitText = 'Submit';
    export let cancelText = 'Cancel';
    export let showCancel = true;
    export let validateOnSubmit: (data: T) => FormErrors;
    export let onSubmit: (data: T) => Promise<void>;

    const dispatch = createEventDispatcher<{
        cancel: void;
        submit: T;
    }>();

    let submitting = false;

    async function handleSubmit() {
        submitting = true;
        errors = validateOnSubmit(data);

        if (Object.keys(errors).length === 0) {
            try {
                await onSubmit(data);
                dispatch('submit', data);
                toastStore.success('Form submitted successfully');
            } catch (error) {
                toastStore.error('Failed to submit form. Please try again.');
                console.error('Form submission error:', error);
            }
        } else {
            toastStore.error('Please fix the errors in the form');
        }
        submitting = false;
    }

    function handleCancel() {
        dispatch('cancel');
    }
</script>

<form
    on:submit|preventDefault={handleSubmit}
    class="flex w-full flex-col gap-6"
    {...$$restProps}
>
    <div class="flex flex-col gap-4">
        <slot {errors} />
    </div>

    <div class="flex items-center gap-4">
        <LoadingButton
            type="submit"
            loading={submitting || loading}
            disabled={submitting || loading}
        >
            {submitText}
        </LoadingButton>

        {#if showCancel}
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                on:click={handleCancel}
                disabled={submitting || loading}
            >
                {cancelText}
            </button>
        {/if}
    </div>
</form> 