<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
    import { authService } from '$lib/services/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card } from '$lib/components/ui/card';
    import { Loader2 } from 'lucide-svelte';
    import AuthIllustration from '$lib/components/illustrations/AuthIllustration.svelte';
    import { page } from '$app/stores';

    let email = '';
    let password = '';
    let loading = false;
    let error: string | null = $page.url.searchParams.get('error') || null;

    if (error === 'google_auth_failed') {
        error = 'Google authentication failed. Please try again.';
    }

    async function handleSubmit() {
        try {
            error = null;
            if (!email || !password) {
                error = 'Please enter both email and password';
                return;
            }
            loading = true;
            await authService.login(email, password);
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.code === 401) {
                error = 'Invalid email or password';
            } else if (err.message) {
                error = err.message;
            } else {
                error = 'Login failed. Please try again.';
            }
        } finally {
            loading = false;
        }
    }

    async function handleGoogleLogin() {
        try {
            loading = true;
            error = null;
            await authService.loginWithGoogle();
        } catch (err) {
            console.error('Google login error:', err);
            error = 'Google login failed. Please try again.';
            loading = false;
        }
    }
</script>

<div class="flex flex-col min-h-screen bg-background">
    <main class="flex-1">
        <div class="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div class="relative flex-col hidden h-full p-10 text-white bg-muted dark:border-r lg:flex">
                <div class="absolute inset-0">
                    <AuthIllustration type="login" className="h-full w-full object-cover opacity-80" />
                </div>
            </div>
            <div class="p-8">
                <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div class="flex flex-col space-y-2 text-center">
                        <h1 class="text-2xl font-semibold tracking-tight">Welcome back!</h1>
                        <p class="text-sm text-muted-foreground">
                            Please login to your account
                        </p>
                    </div>

                    {#if error}
                        <div class="p-3 text-sm text-red-600 rounded-md bg-red-50 dark:bg-red-900/50 dark:text-red-100">
                            {error}
                        </div>
                    {/if}

                    <div class="grid gap-6">
                        <form on:submit|preventDefault={handleSubmit}>
                            <div class="grid gap-4">
                                <div class="grid gap-2">
                                    <Label for="email">Email</Label>
                                    <Input
                                        id="email"
                                        placeholder="name@example.com"
                                        type="email"
                                        bind:value={email}
                                        autocomplete="email"
                                        disabled={loading}
                                    />
                                </div>
                                <div class="grid gap-2">
                                    <div class="flex items-center justify-between">
                                        <Label for="password">Password</Label>
                                        <a href="/forgot-password" class="text-sm text-primary hover:underline">
                                            Forgot password?
                                        </a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        bind:value={password}
                                        autocomplete="current-password"
                                        disabled={loading}
                                    />
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {#if loading}
                                        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                                        Signing in...
                                    {:else}
                                        Sign in
                                    {/if}
                                </Button>
                            </div>
                        </form>
                        <div class="relative">
                            <div class="absolute inset-0 flex items-center">
                                <span class="w-full border-t" />
                            </div>
                            <div class="relative flex justify-center text-xs uppercase">
                                <span class="px-2 bg-background text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" type="button" disabled={loading} on:click={handleGoogleLogin}>
                            {#if loading}
                                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                            {:else}
                                <svg class="w-4 h-4 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                            {/if}
                            Google
                        </Button>
                    </div>

                    <p class="px-8 text-sm text-center text-muted-foreground">
                        New to TimetablePro?
                        <a href="/register" class="underline hover:text-primary underline-offset-4">Create an account</a>
                    </p>
                </div>
            </div>
        </div>
    </main>
</div>

<footer class="absolute bottom-0 w-full py-6 text-sm text-center text-gray-500">
    © {new Date().getFullYear()} TimetablePro. All rights reserved.
</footer> 