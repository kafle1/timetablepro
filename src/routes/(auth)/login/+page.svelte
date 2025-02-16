<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
    import { authService } from '$lib/services/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card } from '$lib/components/ui/card';
    import { Separator } from '$lib/components/ui/separator';

    let email = '';
    let password = '';
    let loading = false;
    let error: string | null = null;

    async function handleSubmit() {
        loading = true;
        error = null;

        try {
            await authService.login(email, password);
        } catch (err) {
            error = 'Invalid email or password';
            console.error('Login error:', err);
        } finally {
            loading = false;
        }
    }

    async function handleGoogleLogin() {
        loading = true;
        error = null;

        try {
            await authService.loginWithGoogle();
        } catch (err) {
            error = 'Google login failed. Please try again.';
            console.error('Google login error:', err);
        } finally {
            loading = false;
        }
    }
</script>

<Card class="p-6">
    <div class="space-y-2 text-center">
        <h1 class="text-2xl font-bold">Welcome Back</h1>
        <p class="text-muted-foreground">Enter your credentials to access your account</p>
    </div>

    {#if error}
        <div class="mt-4 p-4 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/50 dark:text-red-100">
            {error}
        </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-4 mt-4">
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
                placeholder="Enter your password"
                bind:value={password}
                required
            />
        </div>

        <Button type="submit" class="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
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
            on:click={handleGoogleLogin}
            disabled={loading}
        >
            <svg class="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            Sign in with Google
        </Button>
    </form>

    <div class="mt-4 text-center text-sm">
        <span class="text-muted-foreground">Don't have an account?</span>
        <a href="/register" class="text-primary hover:underline">Register</a>
    </div>
</Card>

<footer class="absolute bottom-0 w-full py-6 text-center text-sm text-gray-500">
    © {new Date().getFullYear()} TimetablePro. All rights reserved.
</footer> 