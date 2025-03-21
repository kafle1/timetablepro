<!-- src/routes/+error.svelte -->
<script lang="ts">
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import { Button } from '$lib/components/ui/button';
    import { ROUTES } from '$lib/config';
    
    let errorType = $page.error?.message || 'Unknown error';
    let isAuth = errorType?.toLowerCase().includes('auth') || false;
    
    function resetAuthState() {
        if (browser) {
            try {
                // Clear all authentication data
                localStorage.removeItem('cookieFallback');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('mockSessionToken');
                localStorage.removeItem('isMockSession');
                
                // Clear session cookies
                document.cookie = 'redirect_count=0; path=/;';
                document.cookie = 'x-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                
                // Redirect to login with special flag
                window.location.href = `${ROUTES.LOGIN}?clear_auth=true&break_loop=true`;
            } catch (e) {
                console.error('Error clearing auth state:', e);
            }
        }
    }
    
    function goHome() {
        window.location.href = '/';
    }
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
    <div class="max-w-md p-6 space-y-6 rounded-lg border shadow-md">
        <h1 class="text-3xl font-bold tracking-tight text-primary">Oops! Something went wrong</h1>
        
        <div class="p-4 my-4 rounded-md bg-destructive/10 text-destructive">
            {#if $page.status === 404}
                <p>The page you're looking for doesn't exist.</p>
            {:else}
                <p>We're having trouble loading this page.</p>
                {#if errorType !== 'Unknown error'}
                    <p class="mt-2 text-sm">Error: {errorType}</p>
                {/if}
            {/if}
        </div>
        
        <div class="flex flex-col space-y-3">
            {#if isAuth}
                <p class="text-sm text-muted-foreground">
                    This might be due to an authentication issue. Try resetting your session.
                </p>
                <Button on:click={resetAuthState} variant="destructive">
                    Reset Authentication & Go to Login
                </Button>
            {/if}
            
            <Button on:click={() => window.location.reload()} variant="outline">
                Reload Page
            </Button>
            
            <Button on:click={goHome}>
                Go to Home
            </Button>
        </div>
    </div>
</div> 