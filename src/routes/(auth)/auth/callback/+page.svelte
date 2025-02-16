<!-- src/routes/(auth)/auth/callback/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authService } from '$lib/services/auth';
    import { Loader2 } from 'lucide-svelte';
    import { goto } from '$app/navigation';

    let error: string | null = null;

    onMount(async () => {
        try {
            await authService.handleOAuthCallback();
        } catch (err: any) {
            console.error('OAuth callback error:', err);
            error = err.message || 'Authentication failed. Please try again.';
            setTimeout(() => {
                goto('/login?error=google_auth_failed');
            }, 2000);
        }
    });
</script>

<div class="min-h-screen bg-background flex items-center justify-center">
    <div class="w-full max-w-md p-8 space-y-4 text-center">
        {#if error}
            <div class="space-y-2">
                <h2 class="text-lg font-semibold text-red-600">Authentication Failed</h2>
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