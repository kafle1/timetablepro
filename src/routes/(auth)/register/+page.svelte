<!-- src/routes/(auth)/register/+page.svelte -->
<script lang="ts">
    import { authStore } from '$lib/stores/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
    import { USER_ROLES } from '$lib/config';
    import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-svelte';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { ROUTES } from '$lib/config';

    let name = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let role = '';
    let loading = false;
    let error: string | null = $page.url.searchParams.get('error') || null;
    let success: string | null = null;
    let showPassword = false;
    let showConfirmPassword = false;
    
    // Form validation errors
    let nameError: string | null = null;
    let emailError: string | null = null;
    let passwordError: string | null = null;
    let confirmPasswordError: string | null = null;
    let roleError: string | null = null;

    // Password strength indicators
    let passwordStrength = 0;
    let passwordFeedback = '';

    // Get redirect URL if passed
    let redirectTo = $page.url.searchParams.get('redirect') || '';

    // Basic email validation
    function isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)
    function validatePassword(password: string): { valid: boolean, feedback: string, strength: number } {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);
        
        let strength = 0;
        let feedback = '';
        
        if (password.length >= minLength) strength += 1;
        if (hasUpperCase) strength += 1;
        if (hasLowerCase) strength += 1;
        if (hasNumbers) strength += 1;
        if (hasSpecialChar) strength += 1;
        
        const valid = password.length >= minLength && 
                     hasUpperCase && 
                     hasLowerCase && 
                     hasNumbers && 
                     hasSpecialChar;
        
        if (!valid) {
            feedback = 'Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters (!@#$%^&*).';
        } else {
            if (strength <= 3) {
                feedback = 'Weak password';
            } else if (strength === 4) {
                feedback = 'Good password';
            } else {
                feedback = 'Strong password';
            }
        }
        
        return { valid, feedback, strength };
    }

    function validateForm(): boolean {
        let isValid = true;
        
        // Reset errors
        nameError = null;
        emailError = null;
        passwordError = null;
        confirmPasswordError = null;
        roleError = null;
        
        // Validate name
        if (!name.trim()) {
            nameError = 'Name is required';
            isValid = false;
        } else if (name.trim().length < 2) {
            nameError = 'Name must be at least 2 characters';
            isValid = false;
        }
        
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
        } else {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                passwordError = passwordValidation.feedback;
                isValid = false;
            }
        }
        
        // Validate confirm password
        if (!confirmPassword) {
            confirmPasswordError = 'Please confirm your password';
            isValid = false;
        } else if (password !== confirmPassword) {
            confirmPasswordError = 'Passwords do not match';
            isValid = false;
        }
        
        // Validate role
        if (!role) {
            roleError = 'Please select a role';
            isValid = false;
        }
        
        return isValid;
    }

    // Register the user
    async function handleRegister() {
        // Clear any existing errors
        error = null;
        
        // Validate the form
        if (!validateForm()) {
            return;
        }
        
        loading = true;
        
        try {
            await authStore.register(email, password, name, role as keyof typeof USER_ROLES);
            
            // Registration successful, redirect to login
            const loginUrl = new URL(ROUTES.LOGIN, window.location.origin);
            loginUrl.searchParams.set('from', 'register');
            
            // Carry forward the redirect parameter if it exists
            if (redirectTo) {
                loginUrl.searchParams.set('redirect', redirectTo);
            }
            
            goto(loginUrl.toString());
        } catch (err: any) {
            error = err.message || 'Registration failed. Please try again.';
            loading = false;
        }
    }

    // Toggle password visibility
    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }

    // Toggle confirm password visibility
    function toggleConfirmPasswordVisibility() {
        showConfirmPassword = !showConfirmPassword;
    }

    // Update password strength when password changes
    $: {
        if (password) {
            const validation = validatePassword(password);
            passwordStrength = validation.strength;
            passwordFeedback = validation.feedback;
        } else {
            passwordStrength = 0;
            passwordFeedback = '';
        }
    }

    // Navigate to login page
    function goToLogin() {
        const url = new URL(ROUTES.LOGIN, window.location.origin);
        
        // Carry forward the redirect parameter if it exists
        if (redirectTo) {
            url.searchParams.set('redirect', redirectTo);
        }
        
        goto(url.toString());
    }
</script>

<div class="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <div class="text-center">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Create an account</h1>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Sign up to get started with TimetablePro
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
        
        <form on:submit|preventDefault={handleRegister} class="mt-8 space-y-6">
            <div class="space-y-4">
                <div>
                    <Label for="name" class="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input 
                        id="name" 
                        type="text" 
                        bind:value={name}
                        placeholder="John Doe" 
                        required
                        class={nameError ? "border-red-500" : ""}
                    />
                    {#if nameError}
                        <p class="mt-1 text-xs text-red-500">{nameError}</p>
                    {/if}
                </div>
                
                <div>
                    <Label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        bind:value={email}
                        placeholder="name@example.com" 
                        required
                        class={emailError ? "border-red-500" : ""}
                    />
                    {#if emailError}
                        <p class="mt-1 text-xs text-red-500">{emailError}</p>
                    {/if}
                </div>
                
                <div>
                    <Label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                    <div class="relative">
                        <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            bind:value={password}
                            placeholder="Create a password" 
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
                    
                    {#if password && !passwordError}
                        <div class="mt-2">
                            <div class="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                <div class="h-1 rounded-full transition-all duration-300 ease-in-out" 
                                    class:bg-red-500={passwordStrength <= 2}
                                    class:bg-yellow-500={passwordStrength === 3}
                                    class:bg-green-500={passwordStrength >= 4}
                                    style="width: {passwordStrength * 20}%"></div>
                            </div>
                            <p class="mt-1 text-xs" 
                               class:text-red-500={passwordStrength <= 2}
                               class:text-yellow-500={passwordStrength === 3}
                               class:text-green-500={passwordStrength >= 4}>
                                {passwordFeedback}
                            </p>
                        </div>
                    {/if}
                    
                    {#if passwordError}
                        <p class="mt-1 text-xs text-red-500">{passwordError}</p>
                    {/if}
                </div>
                
                <div>
                    <Label for="confirmPassword" class="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</Label>
                    <div class="relative">
                        <Input 
                            id="confirmPassword" 
                            type={showConfirmPassword ? "text" : "password"} 
                            bind:value={confirmPassword}
                            placeholder="Confirm your password" 
                            required
                            class={confirmPasswordError ? "border-red-500" : ""}
                        />
                        <button 
                            type="button" 
                            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            on:click={toggleConfirmPasswordVisibility}
                        >
                            {#if showConfirmPassword}
                                <EyeOff class="h-5 w-5" />
                            {:else}
                                <Eye class="h-5 w-5" />
                            {/if}
                        </button>
                    </div>
                    {#if confirmPasswordError}
                        <p class="mt-1 text-xs text-red-500">{confirmPasswordError}</p>
                    {/if}
                </div>
                
                <div>
                    <Label for="role" class="text-sm font-medium text-gray-700 dark:text-gray-300">Role</Label>
                    <Select bind:value={role}>
                        <SelectTrigger id="role" class={roleError ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STUDENT">Student</SelectItem>
                            <SelectItem value="TEACHER">Teacher</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    {#if roleError}
                        <p class="mt-1 text-xs text-red-500">{roleError}</p>
                    {/if}
                </div>
            </div>
            
            <Button 
                type="submit" 
                class="w-full" 
                disabled={loading}
            >
                {#if loading}
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                {:else}
                    Sign up
                {/if}
            </Button>
            
            <div class="mt-4 text-center text-sm">
                <span class="text-gray-600 dark:text-gray-400">
                    Already have an account?
                </span>
                <button 
                    type="button" 
                    class="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300" 
                    on:click={goToLogin}
                >
                    Sign in
                </button>
            </div>
        </form>
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