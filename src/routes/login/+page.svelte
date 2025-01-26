<!-- src/routes/login/+page.svelte -->
<script lang="ts">
    import { login } from '$lib/services/auth';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';

    let email = '';
    let password = '';
    let loading = false;
    let error: string | null = null;

    async function handleSubmit() {
        if (!email || !password) {
            error = 'Please fill in all fields';
            return;
        }

        loading = true;
        error = null;

        try {
            await login(email, password);
            goto('/schedule');
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            } else {
                error = 'An error occurred during login';
            }
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex min-h-[calc(100vh-14rem)] items-center justify-center">
    <Card class="w-full max-w-md">
        <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
            <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                <div class="space-y-2">
                    <Label for="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        bind:value={email}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div class="space-y-2">
                    <Label for="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        bind:value={password}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                {#if error}
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                {/if}

                <Button type="submit" class="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>
        </CardContent>
        <CardFooter class="flex justify-center">
            <p class="text-sm text-muted-foreground">
                Don't have an account?
                <a href="/register" class="text-primary hover:underline">Sign up</a>
            </p>
        </CardFooter>
    </Card>
</div> 