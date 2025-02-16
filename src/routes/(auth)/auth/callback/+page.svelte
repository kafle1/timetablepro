<!-- src/routes/(auth)/auth/callback/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authService } from '$lib/services/auth';
    import { Card } from '$lib/components/ui/card';

    let error: string | null = null;

    onMount(async () => {
        try {
            await authService.handleOAuthCallback();
        } catch (err) {
            error = 'Failed to complete authentication. Please try again.';
            console.error('OAuth callback error:', err);
        }
    });
</script>

<Card class="p-6">
    <div class="space-y-2 text-center">
        <h1 class="text-2xl font-bold">Completing Sign In</h1>
        <p class="text-muted-foreground">Please wait while we complete your authentication...</p>
    </div>

    {#if error}
        <div class="mt-4 p-4 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/50 dark:text-red-100">
            {error}
            <div class="mt-2">
                <a href="/login" class="text-primary hover:underline">Return to login</a>
            </div>
        </div>
    {/if}
</Card> 