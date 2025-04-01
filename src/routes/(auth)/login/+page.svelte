<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
    import { userStore } from '$lib/stores/user';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, School, User, UserCog } from 'lucide-svelte';
    import { page } from '$app/stores';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import { goto } from '$app/navigation';
    import { ROUTES } from '$lib/config';
    import { onMount } from 'svelte';
    import { authService } from '$lib/services/auth';
    import { browser } from '$app/environment';

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
    let demoLoading = false;
    let isNavigating = false; // Guard flag

    // Basic email validation
    function isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Validate the form
    function validateForm(): boolean {
        let isValid = true;
        
        // Reset errors
        emailError = null;
        passwordError = null;

        // Validate email
        if (!email) {
            emailError = 'Email is required';
            isValid = false;
        } else if (!isValidEmail(email)) {
            emailError = 'Please enter a valid email address';
            isValid = false;
        }

        // Validate password
        if (!password) {
            passwordError = 'Password is required';
            isValid = false;
        }

        return isValid;
    }

    // Handle login form submission
    async function handleLogin() {
        // Clear any existing errors
        error = null;
        emailError = null;
        passwordError = null;
        
        // Validate the form
        if (!validateForm() || isNavigating) {
            return;
        }

        loading = true;
        isNavigating = true; // Set guard flag
        
        try {
            // Authenticate user with email and password
            const user = await authService.login(email, password);
            
            // Update user store
            userStore.set(user);
            
            // Use a simple approach to navigate to prevent redirect loops
            const targetRoute = redirectTo || getDashboardRoute(user.role);
            
            console.log(`Login successful, navigating to: ${targetRoute}`);
            
            // Save the authentication state to session storage for persistence across tabs
            sessionStorage.setItem('ui_testing_auth_token', 'authenticated');
            sessionStorage.setItem('ui_testing_user_type', user.role.toLowerCase());
            
            // Set a cookie for server-side detection
            document.cookie = `ui_testing_auth=1; path=/; max-age=3600`;
            document.cookie = `auth_state=authenticated; path=/; max-age=3600`;
            
            // Use SvelteKit's goto for navigation
            await goto(targetRoute, { replaceState: true });
        } catch (err: any) {
            console.error('Login error:', err);
            error = err.message || 'Failed to login. Please try again.';
            loading = false;
            isNavigating = false; // Reset guard flag on error
        }
    }
    
    // Get the dashboard route based on user role
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
    
    // Handle demo account login
    async function loginWithDemo(type: 'admin' | 'teacher' | 'student') {
        error = null;
        if (isNavigating) return; // Check guard flag

        demoLoading = true;
        isNavigating = true; // Set guard flag
        
        try {
            // Login with demo account type
            const user = await authService.loginWithDemo(type);
            
            // Update user store
            userStore.set(user);
            
            // Get the target route
            const targetRoute = redirectTo || getDashboardRoute(user.role);
            
            console.log(`Demo login successful, navigating to: ${targetRoute}`);
            
            // Use SvelteKit's goto for navigation with replaceState
            await goto(targetRoute, { replaceState: true });
        } catch (err: any) {
            console.error('Demo login error:', err);
            error = err.message || 'Failed to login with demo account';
            demoLoading = false;
            isNavigating = false; // Reset guard flag on error
        }
    }

    // Handle success messages when users are redirected after account actions
    onMount(() => {
        // Check for successful logout message
        if ($page.url.searchParams.get('success') === 'logout') {
            success = 'You have been successfully logged out.';
        }
        
        // Check for auth errors
        if ($page.url.searchParams.get('error') === 'unauthorized') {
            error = 'Please log in to access this resource.';
        } else if ($page.url.searchParams.get('error') === 'auth_error') {
            error = 'Authentication error. Please log in again.';
        } else if ($page.url.searchParams.get('error') === 'session_expired') {
            error = 'Your session has expired. Please log in again.';
        }
        
        // Check if redirected from registration
        if ($page.url.searchParams.get('from') === 'register') {
            success = 'Registration successful! Please log in with your credentials.';
        }
    });

    // Toggle password visibility
    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }
    
    // Navigate to registration page
    function goToRegister() {
        const url = new URL(ROUTES.REGISTER, window.location.origin);
        
        // Carry forward the redirect parameter if it exists
        if (redirectTo) {
            url.searchParams.set('redirect', redirectTo);
        }
        
        goto(url.toString());
    }
</script>

<div class="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm space-y-6 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div class="text-center">
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Welcome back</h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Please sign in to your account
            </p>
            </div>

            {#if error}
            <Alert variant="destructive" class="mb-4">
                <AlertCircle class="h-4 w-4" />
                <AlertDescription>
                    {error}
                </AlertDescription>
                    </Alert>
            {/if}

            {#if success}
            <Alert class="mb-4 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100">
                <CheckCircle2 class="h-4 w-4" />
                <AlertDescription>
                    {success}
                </AlertDescription>
                    </Alert>
            {/if}

        <form on:submit|preventDefault={handleLogin} class="mt-6 space-y-4">
            <div class="space-y-3">
                <div>
                    <Label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            bind:value={email}
                        placeholder="name@example.com" 
                        required
                        autofocus
                        class={emailError ? "border-red-500" : ""}
                    />
                    {#if emailError}
                        <p class="mt-1 text-xs text-red-500">{emailError}</p>
                    {/if}
                </div>

                <div>
                    <div class="flex items-center justify-between">
                        <Label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </Label>
                        <a href="/reset-password" class="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                            Forgot password?
                        </a>
                    </div>
                    <div class="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            bind:value={password}
                            placeholder="Enter your password" 
                            required
                            class={passwordError ? "border-red-500" : ""}
                        />
                        <button 
                            type="button" 
                            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            on:click={togglePasswordVisibility}
                        >
                            {#if showPassword}
                                <EyeOff class="h-5 w-5" />
                            {:else}
                                <Eye class="h-5 w-5" />
                            {/if}
                        </button>
                    </div>
                    {#if passwordError}
                        <p class="mt-1 text-xs text-red-500">{passwordError}</p>
                    {/if}
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <Checkbox id="remember-me" bind:checked={rememberMe} />
                        <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Remember me
                        </label>
                    </div>
                </div>
            </div>
            
            <Button 
                type="submit" 
                class="w-full" 
                disabled={loading || demoLoading}
            >
                        {#if loading}
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                        {:else}
                            Sign in
                        {/if}
                    </Button>
            
            <div class="mt-4 text-center text-sm">
                <span class="text-gray-600 dark:text-gray-400">
                    Don't have an account?
                </span>
                <button 
                    type="button" 
                    class="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300" 
                    on:click={goToRegister}
                >
                    Sign up
                </button>
                </div>
            </form>

        <!-- Demo Account Options -->
        <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Or try a demo account
            </h3>
            
            <div class="grid grid-cols-3 gap-2">
                <Button 
                    variant="outline" 
                    class="flex flex-col items-center justify-center h-auto py-2 px-1 text-xs" 
                    disabled={loading || demoLoading}
                    on:click={() => loginWithDemo('admin')}
                >
                    <UserCog class="h-4 w-4 mb-1" />
                    <span>Admin</span>
                </Button>
                
                <Button 
                    variant="outline" 
                    class="flex flex-col items-center justify-center h-auto py-2 px-1 text-xs" 
                    disabled={loading || demoLoading}
                    on:click={() => loginWithDemo('teacher')}
                >
                    <School class="h-4 w-4 mb-1" />
                    <span>Teacher</span>
                </Button>
                
                <Button 
                    variant="outline" 
                    class="flex flex-col items-center justify-center h-auto py-2 px-1 text-xs" 
                    disabled={loading || demoLoading}
                    on:click={() => loginWithDemo('student')}
                >
                    <User class="h-4 w-4 mb-1" />
                    <span>Student</span>
                </Button>
            </div>
            
            {#if demoLoading}
                <div class="flex justify-center items-center mt-3">
                    <Loader2 class="h-4 w-4 animate-spin mr-2" />
                    <span class="text-xs text-gray-500 dark:text-gray-400">Loading demo account...</span>
                </div>
            {/if}
            
            <!-- Demo Account Info -->
            <div class="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded-md">
                <p class="mb-1.5"><strong>Demo Account Features:</strong></p>
                <ul class="list-disc pl-4 space-y-0.5">
                    <li><strong>Admin:</strong> Full access to all features.</li>
                    <li><strong>Teacher:</strong> Schedule & student management.</li>
                    <li><strong>Student:</strong> View personal schedule.</li>
                </ul>
                <p class="mt-1.5 text-[10px] italic">Note: Demo accounts are reset periodically.</p>
            </div>
        </div>
    </div>
</div>