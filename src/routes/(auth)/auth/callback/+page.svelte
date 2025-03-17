<!-- src/routes/(auth)/auth/callback/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authService } from '$lib/services/auth';
    import { Loader2, AlertCircle } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { ROUTES } from '$lib/config';
    import { page } from '$app/stores';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { userStore } from '$lib/stores/userStore';

    let error: string | null = null;
    let loading = false;
    let message = 'Auth callback page - UI testing mode';

    // For UI testing, we're not redirecting
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
                <h2 class="text-xl font-medium mb-6">Auth Callback Page</h2>
                <p class="text-muted-foreground mb-4">This is the OAuth callback page.</p>
                <p class="text-muted-foreground">In normal operation, you would be redirected to your dashboard.</p>
                <div class="mt-6">
                    <a href="/admin/dashboard" class="text-primary hover:underline">Go to Admin Dashboard</a>
                </div>
                <div class="mt-2">
                    <a href="/teacher/dashboard" class="text-primary hover:underline">Go to Teacher Dashboard</a>
                </div>
                <div class="mt-2">
                    <a href="/student/dashboard" class="text-primary hover:underline">Go to Student Dashboard</a>
                </div>
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