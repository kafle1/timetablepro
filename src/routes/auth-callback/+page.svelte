<!-- src/routes/auth-callback/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authService } from '$lib/services/auth';
    import { Loader2 } from 'lucide-svelte';

    onMount(async () => {
        try {
            await authService.handleOAuthCallback();
        } catch (error) {
            console.error('OAuth callback error:', error);
            window.location.href = '/login?error=google_auth_failed';
        }
    });
</script>

<div class="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
    <div class="text-center space-y-4">
        <Loader2 class="w-8 h-8 animate-spin mx-auto" />
        <p class="text-muted-foreground">Completing authentication...</p>
    </div>
</div> 