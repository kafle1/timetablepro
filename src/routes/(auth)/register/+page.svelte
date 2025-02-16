<!-- src/routes/(auth)/register/+page.svelte -->
<script lang="ts">
    import { authService } from '$lib/services/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card } from '$lib/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
    import { USER_ROLES } from '$lib/config';

    let name = '';
    let email = '';
    let password = '';
    let role = '';
    let loading = false;
    let error: string | null = null;

    async function handleSubmit() {
        loading = true;
        error = null;

        try {
            await authService.register(email, password, name, role as keyof typeof USER_ROLES);
        } catch (err) {
            error = 'Registration failed. Please try again.';
            console.error('Registration error:', err);
        } finally {
            loading = false;
        }
    }

    async function handleGoogleSignup() {
        loading = true;
        error = null;

        try {
            await authService.loginWithGoogle();
        } catch (err) {
            error = 'Google sign-up failed. Please try again.';
            console.error('Google sign-up error:', err);
        } finally {
            loading = false;
        }
    }
</script>

<Card class="p-6">
    <div class="space-y-2 text-center">
        <h1 class="text-2xl font-bold">Create an Account</h1>
        <p class="text-muted-foreground">Enter your details to create your account</p>
    </div>

    {#if error}
        <div class="mt-4 p-4 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/50 dark:text-red-100">
            {error}
        </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-4 mt-4">
        <div class="space-y-2">
            <Label for="name">Full Name</Label>
            <Input
                type="text"
                id="name"
                placeholder="Enter your full name"
                bind:value={name}
                required
            />
        </div>

        <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
                type="email"
                id="email"
                placeholder="Enter your email"
                bind:value={email}
                required
            />
        </div>
        
        <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
                type="password"
                id="password"
                placeholder="Create a password"
                bind:value={password}
                required
                minlength="8"
            />
        </div>

        <div class="space-y-2">
            <Label for="role">Role</Label>
            <Select bind:value={role} required>
                <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={USER_ROLES.TEACHER}>Teacher</SelectItem>
                    <SelectItem value={USER_ROLES.STUDENT}>Student</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <Button type="submit" class="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div class="relative">
            <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
        </div>

        <Button
            type="button"
            variant="outline"
            class="w-full"
            on:click={handleGoogleSignup}
            disabled={loading}
        >
            <svg class="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Sign up with Google
        </Button>
    </form>

    <div class="mt-4 text-center text-sm">
        <span class="text-muted-foreground">Already have an account?</span>
        <a href="/login" class="text-primary hover:underline">Sign In</a>
    </div>
</Card> 