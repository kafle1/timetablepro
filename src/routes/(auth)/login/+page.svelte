<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
    import { authService } from '$lib/services/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, UserIcon } from 'lucide-svelte';
    import { page } from '$app/stores';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import { goto } from '$app/navigation';
    import { ROUTES } from '$lib/config';
    import { onMount } from 'svelte';
    import { userStore } from '$lib/stores/user';
    import { authStore } from '$lib/stores/auth';
    import type { User } from '$lib/types';

    let email = '';
    let password = '';
    let loading = false;
    let rememberMe = false;
    let showPassword = false;
    let error: string | null = $page.url.searchParams.get('error') || null;
    let success: string | null = $page.url.searchParams.get('success') || null;
    let emailError: string | null = null;
    let passwordError: string | null = null;
    let redirectTo = $page.url.searchParams.get('redirect') || '';

    // Test credentials
    const testCredentials = {
        admin: { email: 'admin@timetablepro.com', password: 'Admin@123' },
        teacher: { email: 'teacher@timetablepro.com', password: 'Teacher@123' },
        student: { email: 'student@timetablepro.com', password: 'Student@123' }
    };

    function fillTestCredentials(role: 'admin' | 'teacher' | 'student') {
        email = testCredentials[role].email;
        password = testCredentials[role].password;
        emailError = null;
        passwordError = null;
    }

    if (error === 'google_auth_failed') {
        error = 'Google authentication failed. Please try again.';
    } else if (error === 'verification_required') {
        error = 'Please verify your email address before logging in.';
    } else if (error === 'session_expired') {
        error = 'Your session has expired. Please log in again.';
    }

    if (success === 'verification_success') {
        success = 'Email verified successfully. You can now log in.';
    } else if (success === 'password_reset') {
        success = 'Password reset successfully. You can now log in with your new password.';
    } else if (success === 'logout') {
        success = 'You have been logged out successfully.';
    } else if (success === 'registration_success') {
        success = 'Registration successful! You can now log in with your credentials.';
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

            // Attempt to login with authStore
            const user = await authStore.login(email, password, redirectTo);
            
            if (rememberMe && email) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Redirect based on user role
            if (user) {
                const dashboardRoute = authStore.getDashboardRoute(user.role);
                goto(dashboardRoute);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            error = err.message || 'Login failed. Please try again.';
            loading = false;
        }
    }

    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }

    // Load remembered email on mount
    onMount(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            email = rememberedEmail;
            rememberMe = true;
        }
    });
</script>

<div class="flex min-h-screen bg-background">
    <!-- Left side - Form -->
    <div class="flex flex-col justify-center flex-1 max-w-md px-4 py-12 mx-auto sm:px-6 lg:flex-none lg:px-12 xl:px-16">
        <div class="w-full">
            <div class="mb-8 text-center">
                <h1 class="text-3xl font-bold tracking-tight">
                    <a href="/" class="flex items-center justify-center">
                        <span class="font-bold text-primary">Timetable</span><span class="font-bold">Pro</span>
                    </a>
                </h1>
                <p class="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
            </div>

            {#if error}
                <div class="mb-6 duration-300 animate-in fade-in">
                    <Alert variant="destructive" class="border-destructive/30 text-destructive">
                        <AlertCircle class="w-4 h-4 mr-2" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            {/if}

            {#if success}
                <div class="mb-6 duration-300 animate-in fade-in">
                    <Alert class="text-green-600 border-green-500/30 bg-green-500/10 dark:text-green-400">
                        <CheckCircle2 class="w-4 h-4 mr-2" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                </div>
            {/if}

            <form on:submit|preventDefault={handleSubmit} class="space-y-5">
                <div class="space-y-2">
                    <Label for="email" class="text-sm font-medium">Email</Label>
                    <div class="relative">
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            bind:value={email}
                            autocomplete="email"
                            disabled={loading}
                            class={emailError ? "border-destructive focus-visible:ring-destructive/30" : ""}
                            aria-invalid={!!emailError}
                        />
                    </div>
                    {#if emailError}
                        <div class="duration-300 animate-in fade-in">
                            <p class="mt-1 text-xs text-destructive">{emailError}</p>
                        </div>
                    {/if}
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <Label for="password" class="text-sm font-medium">Password</Label>
                        <a href="/forgot-password" class="text-xs text-primary hover:underline focus:outline-none focus:underline">Forgot password?</a>
                    </div>
                    <div class="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            bind:value={password}
                            autocomplete="current-password"
                            disabled={loading}
                            class={passwordError ? "border-destructive focus-visible:ring-destructive/30" : ""}
                            aria-invalid={!!passwordError}
                        />
                        <button 
                            type="button" 
                            class="absolute transition-colors transform -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
                            on:click={togglePasswordVisibility}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            tabindex="-1"
                        >
                            {#if showPassword}
                                <EyeOff class="w-4 h-4" />
                            {:else}
                                <Eye class="w-4 h-4" />
                            {/if}
                        </button>
                    </div>
                    {#if passwordError}
                        <div class="duration-300 animate-in fade-in">
                            <p class="mt-1 text-xs text-destructive">{passwordError}</p>
                        </div>
                    {/if}
                </div>

                <div class="flex items-center justify-between mt-6">
                    <div class="flex items-center">
                        <Checkbox id="remember-me" bind:checked={rememberMe} />
                        <Label for="remember-me" class="ml-2 text-sm">Remember me</Label>
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

            <p class="mt-6 text-sm text-center text-muted-foreground">
                New to TimetablePro?
                <a href="/register" class="font-medium text-primary hover:underline focus:outline-none focus:underline">Create an account</a>
            </p>
        </div>
    </div>
    
    <!-- Right side - Illustration (hidden on small screens) -->
    <div class="hidden lg:block lg:w-1/2 bg-muted/30">
        <div class="flex items-center justify-center h-full p-8">
            <img 
                src="/auth-illustration-login.svg" 
                alt="Login illustration" 
                class="object-contain max-w-full max-h-full"
                width="500"
                height="500"
            />
        </div>
    </div>
</div>

<style>
    :global(.border-destructive) {
        border-color: hsl(var(--destructive));
    }
    
    :global(.text-destructive) {
        color: hsl(var(--destructive));
    }

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
    
    /* Fix for input fields */
    :global(input) {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
    }
    
    :global(.h-10) {
        height: 2.5rem;
    }
    
    :global(.h-11) {
        height: 2.75rem;
    }
</style> 