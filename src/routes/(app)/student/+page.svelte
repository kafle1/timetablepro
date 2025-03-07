<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { ROUTES } from '$lib/config';

    onMount(() => {
        if (browser) {
            goto(ROUTES.STUDENT_DASHBOARD);
        }
    });
</script>

<div class="flex items-center justify-center h-screen">
    <p class="text-lg">Redirecting to dashboard...</p>
</div> 