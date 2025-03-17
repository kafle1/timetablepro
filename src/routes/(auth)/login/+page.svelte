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
    import { userStore } from '$lib/stores/userStore';
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

            // For UI testing, don't actually log in or redirect
            setTimeout(() => {
                loading = false;
                success = "UI testing mode - Login successful. Use the links below to navigate.";
            }, 1000);
        } catch (err: any) {
            console.error('Login error:', err);
            error = err.message || 'Login failed. Please try again.';
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

            <div class="p-4 mb-6 border rounded-lg shadow-sm border-border/60 bg-muted/30">
                <p class="mb-3 text-sm font-medium text-muted-foreground">Test Accounts</p>
                <div class="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" class="h-8 text-xs bg-background hover:bg-muted" on:click={() => fillTestCredentials('admin')}>
                        <UserIcon class="h-3 w-3 mr-1.5 opacity-70" /> Admin
                    </Button>
                    <Button variant="outline" size="sm" class="h-8 text-xs bg-background hover:bg-muted" on:click={() => fillTestCredentials('teacher')}>
                        <UserIcon class="h-3 w-3 mr-1.5 opacity-70" /> Teacher
                    </Button>
                    <Button variant="outline" size="sm" class="h-8 text-xs bg-background hover:bg-muted" on:click={() => fillTestCredentials('student')}>
                        <UserIcon class="h-3 w-3 mr-1.5 opacity-70" /> Student
                    </Button>
                </div>
            </div>

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
                
                <!-- UI Testing Navigation Links -->
                <div class="mt-8 p-4 border rounded-lg bg-muted/30">
                    <h3 class="text-sm font-medium mb-3">UI Testing Navigation</h3>
                    <div class="space-y-2">
                        <div>
                            <a href="/admin/dashboard" class="text-primary hover:underline text-sm">Admin Dashboard</a>
                        </div>
                        <div>
                            <a href="/teacher/dashboard" class="text-primary hover:underline text-sm">Teacher Dashboard</a>
                        </div>
                        <div>
                            <a href="/student/dashboard" class="text-primary hover:underline text-sm">Student Dashboard</a>
                        </div>
                        <div>
                            <a href="/rooms" class="text-primary hover:underline text-sm">Rooms</a>
                        </div>
                        <div>
                            <a href="/schedules" class="text-primary hover:underline text-sm">Schedules</a>
                        </div>
                        <div>
                            <a href="/profile" class="text-primary hover:underline text-sm">Profile</a>
                        </div>
                        <div>
                            <a href="/settings" class="text-primary hover:underline text-sm">Settings</a>
                        </div>
                    </div>
                </div>
            </form>

            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t border-border/60"></span>
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                    <span class="px-2 bg-background text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <Button variant="outline" type="button" disabled={loading} on:click={handleGoogleLogin} class="w-full h-11">
                {#if loading}
                    <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                {:else}
                    <svg class="w-4 h-4 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Google
                {/if}
            </Button>

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