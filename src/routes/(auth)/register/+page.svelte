<!-- src/routes/(auth)/register/+page.svelte -->
<script lang="ts">
    import { authService } from '$lib/services/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
    import { USER_ROLES } from '$lib/config';
    import { Loader2, AlertCircle, Eye, EyeOff, User } from 'lucide-svelte';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    let name = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let role = '';
    let loading = false;
    let error: string | null = $page.url.searchParams.get('error') || null;
    let showPassword = false;
    let showConfirmPassword = false;
    
    // Form validation errors
    let nameError: string | null = null;
    let emailError: string | null = null;
    let passwordError: string | null = null;
    let confirmPasswordError: string | null = null;
    let roleError: string | null = null;

    // Test credentials
    const testCredentials = {
        teacher: { 
            name: 'Test Teacher',
            email: 'teacher@timetablepro.com', 
            password: 'Teacher@123',
            role: USER_ROLES.TEACHER
        },
        student: { 
            name: 'Test Student',
            email: 'student@timetablepro.com', 
            password: 'Student@123',
            role: USER_ROLES.STUDENT
        }
    };

    function fillTestCredentials(userType: 'teacher' | 'student') {
        const credentials = testCredentials[userType];
        name = credentials.name;
        email = credentials.email;
        password = credentials.password;
        confirmPassword = credentials.password;
        role = credentials.role;
        
        // Clear errors
        nameError = null;
        emailError = null;
        passwordError = null;
        confirmPasswordError = null;
        roleError = null;
        
        // Update password strength
        handlePasswordChange();
    }

    // Password strength indicators
    let passwordStrength = 0;
    let passwordFeedback = '';

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
        const passwordValidation = validatePassword(password);
        if (!password) {
            passwordError = 'Password is required';
            isValid = false;
        } else if (!passwordValidation.valid) {
            passwordError = passwordValidation.feedback;
            isValid = false;
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

    function handlePasswordChange() {
        const { valid, feedback, strength } = validatePassword(password);
        passwordStrength = strength;
        passwordFeedback = feedback;
        
        // Also check confirm password match if it's already entered
        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordError = 'Passwords do not match';
        } else {
            confirmPasswordError = null;
        }
    }

    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }

    function toggleConfirmPasswordVisibility() {
        showConfirmPassword = !showConfirmPassword;
    }

    async function handleSubmit() {
        try {
            error = null;
            
            // Validate inputs
            if (!validateForm()) {
                return;
            }

            loading = true;
            await authService.register(email, password, name, role as keyof typeof USER_ROLES);
            
            // Redirect to login page with success message
            goto('/login?success=registration_success');
        } catch (err: any) {
            console.error('Registration error:', err);
            if (err.code === 409) {
                error = 'An account with this email already exists';
                emailError = 'This email is already registered';
            } else if (err.message) {
                error = err.message;
            } else {
                error = 'Registration failed. Please try again.';
            }
        } finally {
            loading = false;
        }
    }

    async function handleGoogleSignup() {
        try {
            loading = true;
            error = null;
            await authService.loginWithGoogle();
        } catch (err) {
            console.error('Google sign-up error:', err);
            error = 'Google sign-up failed. Please try again.';
            loading = false;
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
                <p class="mt-2 text-sm text-muted-foreground">Create your account</p>
            </div>

            {#if error}
                <div class="mb-6 duration-300 animate-in fade-in">
                    <Alert variant="destructive" class="border-destructive/30 text-destructive">
                        <AlertCircle class="w-4 h-4 mr-2" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            {/if}

            <div class="p-4 mb-6 border rounded-lg shadow-sm border-border/60 bg-muted/30">
                <p class="mb-3 text-sm font-medium text-muted-foreground">Test Accounts</p>
                <div class="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" class="h-8 text-xs bg-background hover:bg-muted" on:click={() => fillTestCredentials('teacher')}>
                        <User class="h-3 w-3 mr-1.5 opacity-70" /> Teacher
                    </Button>
                    <Button variant="outline" size="sm" class="h-8 text-xs bg-background hover:bg-muted" on:click={() => fillTestCredentials('student')}>
                        <User class="h-3 w-3 mr-1.5 opacity-70" /> Student
                    </Button>
                </div>
            </div>

            <form on:submit|preventDefault={handleSubmit} class="space-y-5">
                <div class="space-y-2">
                    <Label for="name" class="text-sm font-medium">Full Name</Label>
                    <div class="relative">
                        <Input
                            id="name"
                            placeholder="John Doe"
                            type="text"
                            bind:value={name}
                            autocomplete="name"
                            disabled={loading}
                            class={nameError ? "border-destructive focus-visible:ring-destructive/30" : ""}
                            aria-invalid={!!nameError}
                        />
                    </div>
                    {#if nameError}
                        <div class="duration-300 animate-in fade-in">
                            <p class="mt-1 text-xs text-destructive">{nameError}</p>
                        </div>
                    {/if}
                </div>

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
                    <Label for="password" class="text-sm font-medium">Password</Label>
                    <div class="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            bind:value={password}
                            on:input={handlePasswordChange}
                            autocomplete="new-password"
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
                    {#if password}
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                            <div class="h-1.5 rounded-full transition-all {passwordStrength <= 2 ? 'bg-red-500' : passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'}" style="width: {passwordStrength * 20}%"></div>
                        </div>
                        <p class="text-xs mt-1 {passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'}">{passwordFeedback}</p>
                    {/if}
                    {#if passwordError}
                        <div class="duration-300 animate-in fade-in">
                            <p class="mt-1 text-xs text-destructive">{passwordError}</p>
                        </div>
                    {/if}
                </div>

                <div class="space-y-2">
                    <Label for="confirmPassword" class="text-sm font-medium">Confirm Password</Label>
                    <div class="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            bind:value={confirmPassword}
                            autocomplete="new-password"
                            disabled={loading}
                            class={confirmPasswordError ? "border-destructive focus-visible:ring-destructive/30" : ""}
                            aria-invalid={!!confirmPasswordError}
                        />
                        <button 
                            type="button" 
                            class="absolute transition-colors transform -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground"
                            on:click={toggleConfirmPasswordVisibility}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            tabindex="-1"
                        >
                            {#if showConfirmPassword}
                                <EyeOff class="w-4 h-4" />
                            {:else}
                                <Eye class="w-4 h-4" />
                            {/if}
                        </button>
                    </div>
                    {#if confirmPasswordError}
                        <div class="duration-300 animate-in fade-in">
                            <p class="mt-1 text-xs text-destructive">{confirmPasswordError}</p>
                        </div>
                    {/if}
                </div>

                <div class="space-y-2">
                    <Label for="role" class="text-sm font-medium">Role</Label>
                    <Select bind:value={role} disabled={loading}>
                        <SelectTrigger id="role" class={roleError ? "border-destructive focus-visible:ring-destructive/30" : ""}>
                            <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={USER_ROLES.TEACHER}>Teacher</SelectItem>
                            <SelectItem value={USER_ROLES.STUDENT}>Student</SelectItem>
                        </SelectContent>
                    </Select>
                    {#if roleError}
                        <div class="duration-300 animate-in fade-in">
                            <p class="mt-1 text-xs text-destructive">{roleError}</p>
                        </div>
                    {/if}
                </div>

                <Button type="submit" class="w-full mt-2 h-11" disabled={loading}>
                    {#if loading}
                        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                    {:else}
                        Create account
                    {/if}
                </Button>
            </form>

            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <span class="w-full border-t border-border/60" />
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                    <span class="px-2 bg-background text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <Button variant="outline" type="button" disabled={loading} on:click={handleGoogleSignup} class="w-full h-11">
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
                Already have an account?
                <a href="/login" class="font-medium text-primary hover:underline focus:outline-none focus:underline">Sign in</a>
            </p>
        </div>
    </div>
    
    <!-- Right side - Illustration (hidden on small screens) -->
    <div class="hidden lg:block lg:w-1/2 bg-muted/30">
        <div class="flex items-center justify-center h-full p-8">
            <img 
                src="/auth-illustration-register.svg" 
                alt="Register illustration" 
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