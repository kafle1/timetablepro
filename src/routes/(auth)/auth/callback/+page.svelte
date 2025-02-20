<!-- src/routes/(auth)/auth/callback/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authService } from '$lib/services/auth';
    import { Loader2 } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { ROUTES } from '$lib/config';
    import { authStore } from '$lib/stores/auth';

    let error: string | null = null;

    onMount(async () => {
        try {
            await authService.handleOAuthCallback();
            const user = await authService.getCurrentUser();
            if (user) {
                await authStore.redirectToDashboard(user);
            } else {
                throw new Error('Failed to get user after OAuth callback');
            }
        } catch (err) {
            console.error('OAuth callback error:', err);
            error = err instanceof Error ? err.message : 'Authentication failed';
            setTimeout(() => {
                goto(ROUTES.LOGIN + '?error=google_auth_failed');
            }, 2000);
        }
    });
</script>

<div class="min-h-screen bg-background flex items-center justify-center">
    <div class="w-full max-w-md p-8 space-y-4 text-center">
        {#if error}
            <div class="space-y-2">
                <h2 class="text-lg font-semibold text-destructive">Authentication Failed</h2>
                <p class="text-sm text-muted-foreground">{error}</p>
                <p class="text-sm text-muted-foreground">Redirecting back to login...</p>
            </div>
        {:else}
            <div class="space-y-4">
                <Loader2 class="w-8 h-8 animate-spin mx-auto text-primary" />
                <h2 class="text-lg font-semibold">Completing Authentication</h2>
                <p class="text-sm text-muted-foreground">Please wait while we set up your account...</p>
            </div>
        {/if}
    </div>
</div> 