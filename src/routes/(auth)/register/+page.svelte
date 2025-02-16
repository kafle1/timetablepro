<!-- src/routes/(auth)/register/+page.svelte -->
<script lang="ts">
    import { authService } from '$lib/services/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card } from '$lib/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
    import { USER_ROLES } from '$lib/config';
    import { Loader2 } from 'lucide-svelte';
    import AuthIllustration from '$lib/components/illustrations/AuthIllustration.svelte';

    let name = '';
    let email = '';
    let password = '';
    let role = '';
    let loading = false;
    let error: string | null = null;

    // Basic email validation
    function isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
    function isValidPassword(password: string): boolean {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    }

    async function handleSubmit() {
        try {
            error = null;
            
            // Validate inputs
            if (!name || !email || !password || !role) {
                error = 'All fields are required';
                return;
            }

            if (!isValidEmail(email)) {
                error = 'Please enter a valid email address';
                return;
            }

            if (!isValidPassword(password)) {
                error = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
                return;
            }

            loading = true;
            await authService.register(email, password, name, role as keyof typeof USER_ROLES);
        } catch (err: any) {
            console.error('Registration error:', err);
            if (err.code === 409) {
                error = 'An account with this email already exists';
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

<div class="min-h-screen bg-background flex flex-col">
    <main class="flex-1">
        <div class="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div class="absolute inset-0">
                    <AuthIllustration type="register" className="h-full w-full object-cover opacity-80" />
                </div>
            </div>
            <div class="p-8">
                <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div class="flex flex-col space-y-2 text-center">
                        <h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
                        <p class="text-sm text-muted-foreground">
                            Please fill in your details below
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
                                    <Label for="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        type="text"
                                        bind:value={name}
                                        autocomplete="name"
                                        disabled={loading}
                                    />
                                </div>
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
                                    <Label for="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        bind:value={password}
                                        autocomplete="new-password"
                                        disabled={loading}
                                    />
                                    <p class="text-xs text-muted-foreground">
                                        Password must be at least 8 characters with uppercase, lowercase, and numbers
                                    </p>
                                </div>
                                <div class="grid gap-2">
                                    <Label for="role">Role</Label>
                                    <Select bind:value={role} required>
                                        <SelectTrigger id="role" disabled={loading}>
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={USER_ROLES.TEACHER}>Teacher</SelectItem>
                                            <SelectItem value={USER_ROLES.STUDENT}>Student</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {#if loading}
                                        <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    {:else}
                                        Create account
                                    {/if}
                                </Button>
                            </div>
                        </form>
                        <div class="relative">
                            <div class="absolute inset-0 flex items-center">
                                <span class="w-full border-t" />
                            </div>
                            <div class="relative flex justify-center text-xs uppercase">
                                <span class="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" type="button" disabled={loading} on:click={handleGoogleSignup}>
                            {#if loading}
                                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                            {:else}
                                <svg class="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                            {/if}
                            Google
                        </Button>
                    </div>

                    <p class="px-8 text-center text-sm text-muted-foreground">
                        Already have an account?
                        <a href="/login" class="hover:text-primary underline underline-offset-4">Sign in</a>
                    </p>
                </div>
            </div>
        </div>
    </main>
</div> 