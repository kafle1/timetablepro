<!-- src/routes/(auth)/auth/callback/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authService } from '$lib/services/auth';
    import { Loader2, AlertCircle } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { ROUTES } from '$lib/config';
    import { page } from '$app/stores';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';

    let error: string | null = null;
    let loading = true;
    let message = 'Completing authentication...';

    onMount(async () => {
        try {
            // Check if there's an error parameter in the URL
            const urlError = $page.url.searchParams.get('error');
            if (urlError) {
                throw new Error(decodeURIComponent(urlError));
            }

            message = 'Verifying your account...';
            const user = await authService.handleOAuthCallback();
            
            if (user) {
                message = 'Authentication successful! Redirecting...';
                
                // Get the redirect URL from the query parameters or use the default dashboard
                const redirectTo = $page.url.searchParams.get('redirect') || '';
                
                // Redirect to the appropriate dashboard based on user role or the specified redirect URL
                setTimeout(() => {
                    if (redirectTo) {
                        goto(redirectTo);
                    } else {
                        const dashboardRoute = user.role === 'ADMIN' 
                            ? ROUTES.ADMIN_DASHBOARD 
                            : user.role === 'TEACHER' 
                                ? ROUTES.TEACHER_DASHBOARD 
                                : ROUTES.STUDENT_DASHBOARD;
                        goto(dashboardRoute);
                    }
                }, 1000);
            } else {
                throw new Error('Failed to get user after OAuth callback');
            }
        } catch (err) {
            console.error('OAuth callback error:', err);
            loading = false;
            error = err instanceof Error ? err.message : 'Authentication failed';
            
            // Redirect to login page after a delay
            setTimeout(() => {
                goto(`${ROUTES.LOGIN}?error=google_auth_failed`);
            }, 3000);
        }
    });
</script>

<div class="flex min-h-screen bg-background">
    <div class="flex flex-col justify-center flex-1 px-4 py-12 mx-auto sm:px-6 lg:flex-none lg:px-20 xl:px-24 max-w-md">
        <div class="w-full text-center">
            <h1 class="text-2xl font-semibold tracking-tight mb-8">
                <a href="/" class="flex items-center justify-center">
                    <span class="text-primary font-bold">Timetable</span><span class="font-bold">Pro</span>
                </a>
            </h1>
            
            <div class="p-8 bg-card rounded-lg shadow-sm border border-border/60">
                <h2 class="text-xl font-medium mb-6">
                    {#if error}
                        Authentication Failed
                    {:else}
                        Authentication in Progress
                    {/if}
                </h2>
                
                {#if error}
                    <div class="animate-in fade-in duration-300">
                        <Alert variant="destructive" class="mb-6 border-destructive/30 text-destructive">
                            <AlertCircle class="h-4 w-4 mr-2" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <p class="text-sm text-muted-foreground">
                            Redirecting back to login page...
                        </p>
                    </div>
                {:else}
                    <div class="flex flex-col items-center space-y-6 animate-in fade-in duration-300">
                        <div class="relative">
                            <div class="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                            <Loader2 class="w-12 h-12 absolute inset-0 text-primary animate-pulse opacity-75" />
                        </div>
                        <p class="text-muted-foreground">{message}</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    :global(.animate-in) {
        animation-duration: 150ms;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        --tw-enter-opacity: initial;
        --tw-enter-scale: initial;
        --tw-enter-rotate: initial;
        --tw-enter-translate-x: initial;
        --tw-enter-translate-y: initial;
    }

    :global(.fade-in) {
        animation-name: fade-in;
    }

    @keyframes fade-in {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
</style> 