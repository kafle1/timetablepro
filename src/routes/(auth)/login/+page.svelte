<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
    import { authService } from '$lib/services/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card } from '$lib/components/ui/card';
    import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-svelte';
    import AuthIllustration from '$lib/components/illustrations/AuthIllustration.svelte';
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
    import { fade } from 'svelte/transition';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Checkbox } from '$lib/components/ui/checkbox';

    let email = '';
    let password = '';
    let loading = false;
    let rememberMe = false;
    let error: string | null = $page.url.searchParams.get('error') || null;
    let success: string | null = $page.url.searchParams.get('success') || null;
    let emailError: string | null = null;
    let passwordError: string | null = null;

    if (error === 'google_auth_failed') {
        error = 'Google authentication failed. Please try again.';
    } else if (error === 'verification_required') {
        error = 'Please verify your email address before logging in.';
    }

    if (success === 'verification_success') {
        success = 'Email verified successfully. You can now log in.';
    }

    function validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateForm(): boolean {
        let isValid = true;
        emailError = null;
        passwordError = null;

        if (!email) {
            emailError = 'Email is required';
            isValid = false;
        } else if (!validateEmail(email)) {
            emailError = 'Please enter a valid email address';
            isValid = false;
        }

        if (!password) {
            passwordError = 'Password is required';
            isValid = false;
        }

        return isValid;
    }

    async function handleSubmit() {
        try {
            if (!validateForm()) {
                return;
            }

            error = null;
            success = null;
            loading = true;

            await authService.login(email, password);

            // Store email in localStorage if remember me is checked
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            error = err.message || 'Login failed. Please try again.';
        } finally {
            loading = false;
        }
    }

    async function handleGoogleLogin() {
        try {
            loading = true;
            error = null;
            success = null;
            await authService.loginWithGoogle();
        } catch (err) {
            console.error('Google login error:', err);
            error = 'Google login failed. Please try again.';
            loading = false;
        }
    }

    // Load remembered email on mount
    import { onMount } from 'svelte';
    onMount(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            email = rememberedEmail;
            rememberMe = true;
        }
    });
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
                        <Alert variant="destructive" transition:fade>
                            <AlertCircle class="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    {/if}

                    {#if success}
                        <Alert variant="success" transition:fade>
                            <CheckCircle2 class="h-4 w-4" />
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    {/if}

                    <div class="grid gap-6">
                        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                            <div class="grid gap-2">
                                <Label for="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    bind:value={email}
                                    autocomplete="email"
                                    disabled={loading}
                                    class:border-destructive={emailError}
                                    aria-invalid={!!emailError}
                                    aria-describedby={emailError ? 'email-error' : undefined}
                                />
                                {#if emailError}
                                    <p id="email-error" class="text-sm text-destructive" transition:fade>
                                        {emailError}
                                    </p>
                                {/if}
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
                                    class:border-destructive={passwordError}
                                    aria-invalid={!!passwordError}
                                    aria-describedby={passwordError ? 'password-error' : undefined}
                                />
                                {#if passwordError}
                                    <p id="password-error" class="text-sm text-destructive" transition:fade>
                                        {passwordError}
                                    </p>
                                {/if}
                            </div>
                            <div class="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    bind:checked={rememberMe}
                                    disabled={loading}
                                />
                                <Label for="remember" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Remember me
                                </Label>
                            </div>
                            <Button type="submit" class="w-full" disabled={loading}>
                                {#if loading}
                                    <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                                    Signing in...
                                {:else}
                                    Sign in
                                {/if}
                            </Button>
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
                        <Button variant="outline" type="button" disabled={loading} on:click={handleGoogleLogin} class="w-full">
                            {#if loading}
                                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                            {:else}
                                <svg class="w-4 h-4 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                                Sign in with Google
                            {/if}
                        </Button>
                    </div>

                    <p class="px-8 text-center text-sm text-muted-foreground">
                        New to TimetablePro?
                        <a href="/register" class="hover:text-primary underline underline-offset-4">Create an account</a>
                    </p>
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    :global(.border-destructive) {
        border-color: hsl(var(--destructive));
    }
    
    :global(.text-destructive) {
        color: hsl(var(--destructive));
    }
</style>

<footer class="absolute bottom-0 w-full py-6 text-sm text-center text-gray-500">
    © {new Date().getFullYear()} TimetablePro. All rights reserved.
</footer> 