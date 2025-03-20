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
    import { onMount, onDestroy } from 'svelte';
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
    let loginTimeout: number | null = null;
    let debugInfo: string = '';

    // Debug logger
    function logDebug(message: string, ...data: any[]) {
        const logMessage = `[Login] ${message}`;
        console.log(logMessage, ...data);
        debugInfo += `${logMessage} ${data.length ? JSON.stringify(data) : ''}\n`;
    }

    // Test credentials
    const testCredentials = {
        admin: { email: 'admin@timetablepro.com', password: 'Admin@123' },
        teacher: { email: 'teacher@timetablepro.com', password: 'Teacher@123' },
        student: { email: 'student@timetablepro.com', password: 'Student@123' }
    };

    // Check for existing auth state on mount
    onMount(async () => {
        logDebug('Component mounted');
        
        // Check localStorage for auth data
        const hasMockToken = localStorage.getItem('mockSessionToken') !== null;
        const hasStoredUser = localStorage.getItem('currentUser') !== null;
        const hasCookieFallback = localStorage.getItem('cookieFallback') !== null;
        
        logDebug('Initial localStorage state:', { hasMockToken, hasStoredUser, hasCookieFallback });
        
        // Check if there is an active user session
        try {
            logDebug('Checking for existing session');
            const user = await authStore.checkSession();
            logDebug('Session check result:', { hasUser: !!user });
            
            if (user) {
                logDebug('User already authenticated, redirecting to dashboard');
                const dashboardRoute = authStore.getDashboardRoute(user.role);
                logDebug(`Redirecting to ${dashboardRoute}`);
                window.location.href = dashboardRoute;
            }
        } catch (err) {
            logDebug('Error checking session:', err);
        }
        
        // Load remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            email = rememberedEmail;
            rememberMe = true;
            logDebug('Loaded remembered email:', email);
        }
        
        // Clear any existing auth error state on mount
        if ($authStore.error) {
            logDebug('Clearing existing auth store error:', $authStore.error);
            authStore.update(state => ({ ...state, error: null }));
        }
        
        return () => {
            // Clean up timeout on component destruction
            if (loginTimeout) {
                logDebug('Clearing login timeout on unmount');
                clearTimeout(loginTimeout);
            }
        };
    });

    function fillTestCredentials(role: 'admin' | 'teacher' | 'student') {
        email = testCredentials[role].email;
        password = testCredentials[role].password;
        emailError = null;
        passwordError = null;
        logDebug(`Test credentials filled for ${role}`);
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
            logDebug('Login form submitted');
            
            if (!validateForm()) {
                logDebug('Form validation failed');
                return;
            }

            error = null;
            success = null;
            loading = true;
            logDebug('Starting login process', { email, redirectTo });

            // Set a timeout to handle cases where login gets stuck
            if (loginTimeout) {
                clearTimeout(loginTimeout);
                logDebug('Cleared existing login timeout');
            }
            
            loginTimeout = setTimeout(() => {
                if (loading) {
                    logDebug('Login timeout reached - process taking too long');
                    loading = false;
                    error = "Login is taking longer than expected. Please try again.";
                    
                    // If using test credentials, try direct navigation
                    const isTestAccount = email in testCredentials && 
                          password === testCredentials[email === 'admin@timetablepro.com' ? 'admin' : 
                                          email === 'teacher@timetablepro.com' ? 'teacher' : 'student'].password;
                    
                    logDebug('Checking if test account:', { isTestAccount });
                    
                    if (isTestAccount) {
                        const role = email === 'admin@timetablepro.com' ? 'ADMIN' : 
                                     email === 'teacher@timetablepro.com' ? 'TEACHER' : 'STUDENT';
                        
                        logDebug('Test account detected, attempting direct navigation for role:', role);
                        
                        // Clear any existing localStorage data to avoid conflicts
                        localStorage.removeItem('cookieFallback');
                        localStorage.removeItem('currentUser');
                        localStorage.removeItem('mockSessionToken');
                        
                        // Set up fresh mock session manually
                        const mockUser = {
                            $id: `test-${role.toLowerCase()}`,
                            userId: `test-${role.toLowerCase()}`,
                            email: email,
                            name: role === 'ADMIN' ? 'Admin User' : role === 'TEACHER' ? 'Teacher User' : 'Student User',
                            role: role,
                            isActive: true,
                            emailVerified: true,
                            // Other required fields
                        };
                        
                        // Create a session token
                        const mockSessionToken = btoa(JSON.stringify({
                            userId: mockUser.$id,
                            email: mockUser.email,
                            exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days expiry
                        }));
                        
                        // Store in localStorage
                        localStorage.setItem('currentUser', JSON.stringify(mockUser));
                        localStorage.setItem('mockSessionToken', mockSessionToken);
                        
                        // Add pseudo cookieFallback for hooks.server.ts
                        const sessionKey = 'a_session_' + mockUser.$id;
                        const sessionObj: Record<string, string> = {};
                        sessionObj[sessionKey] = mockSessionToken;
                        localStorage.setItem('cookieFallback', JSON.stringify(sessionObj));
                        
                        logDebug('Set up emergency mock session data');
                        
                        const dashboardRoute = redirectTo || getDashboardRoute(role);
                        logDebug(`Navigating to: ${dashboardRoute}`);
                        window.location.href = dashboardRoute;
                    }
                }
            }, 5000) as unknown as number;
            
            logDebug('Set login timeout (5s)');

            // Attempt to login with authStore
            logDebug('Calling authStore.login');
            const user = await authStore.login(email, password, redirectTo);
            logDebug('Login successful', { userId: user?.userId, role: user?.role });
            
            if (rememberMe && email) {
                localStorage.setItem('rememberedEmail', email);
                logDebug('Saved email to localStorage');
            } else {
                localStorage.removeItem('rememberedEmail');
                logDebug('Removed remembered email from localStorage');
            }
            
            // Clear timeout as login succeeded
            if (loginTimeout) {
                clearTimeout(loginTimeout);
                loginTimeout = null;
                logDebug('Cleared login timeout after successful login');
            }
            
            // The redirect is now handled in the authStore.login method
            logDebug('Login completed, redirect handled by authStore');
            
            // If we're on the root login page with no specific redirect, add parameter for dashboard redirect
            if (!redirectTo) {
                logDebug('No specific redirect target, redirecting to homepage with dashboard flag');
                // Redirect to homepage with parameter to instruct immediate dashboard redirect
                window.location.href = '/?redirect_to_dashboard=true';
            }
        } catch (err: any) {
            console.error('Login error:', err);
            logDebug('Login failed with error:', err);
            error = err.message || 'Login failed. Please try again.';
            loading = false;
            
            // Clear timeout as login failed
            if (loginTimeout) {
                clearTimeout(loginTimeout);
                loginTimeout = null;
                logDebug('Cleared login timeout after failed login');
            }
        }
    }

    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }
    
    function getDashboardRoute(role: string): string {
        switch (role) {
            case 'ADMIN':
                return ROUTES.ADMIN_DASHBOARD;
            case 'TEACHER':
                return ROUTES.TEACHER_DASHBOARD;
            default:
                return ROUTES.STUDENT_DASHBOARD;
        }
    }
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

            <!-- Demo Account Options -->
            <div class="p-4 mb-6 border rounded-lg border-primary/20 bg-primary/5">
                <h3 class="mb-2 text-sm font-medium text-primary">Demo Accounts</h3>
                <div class="grid grid-cols-3 gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        class="border-primary/30 hover:bg-primary/10"
                        on:click={() => fillTestCredentials('admin')}
                        disabled={loading}
                    >
                        Admin
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        class="border-primary/30 hover:bg-primary/10"
                        on:click={() => fillTestCredentials('teacher')}
                        disabled={loading}
                    >
                        Teacher
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        class="border-primary/30 hover:bg-primary/10"
                        on:click={() => fillTestCredentials('student')}
                        disabled={loading}
                    >
                        Student
                    </Button>
                </div>
                <p class="mt-2 text-xs text-muted-foreground">Click any role to auto-fill credentials</p>
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
            </form>

            <p class="mt-6 text-sm text-center text-muted-foreground">
                New to TimetablePro?
                <a href="/register" class="font-medium text-primary hover:underline focus:outline-none focus:underline">Create an account</a>
            </p>
            
            {#if import.meta.env.DEV}
            <details class="mt-8 text-xs">
                <summary class="cursor-pointer text-muted-foreground">Debug Info</summary>
                <pre class="mt-2 p-2 bg-muted/30 rounded text-[10px] overflow-auto max-h-[200px]">{debugInfo}</pre>
            </details>
            {/if}
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