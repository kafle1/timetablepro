<!-- src/routes/register/+page.svelte -->
<script lang="ts">
    import { register } from '$lib/services/auth';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';

    let name = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let loading = false;
    let error: string | null = null;

    async function handleSubmit() {
        if (!name || !email || !password || !confirmPassword) {
            error = 'Please fill in all fields';
            return;
        }

        if (password !== confirmPassword) {
            error = 'Passwords do not match';
            return;
        }

        if (password.length < 8) {
            error = 'Password must be at least 8 characters long';
            return;
        }

        loading = true;
        error = null;

        try {
            await register(email, password, name);
            goto('/schedule');
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            } else {
                error = 'An error occurred during registration';
            }
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex min-h-[calc(100vh-14rem)] items-center justify-center">
    <Card class="w-full max-w-md">
        <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Sign up to get started with TimetablePro</CardDescription>
        </CardHeader>
        <CardContent>
            <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                <div class="space-y-2">
                    <Label for="name">Full Name</Label>
                    <Input
                        id="name"
                        type="text"
                        bind:value={name}
                        placeholder="Enter your full name"
                        required
                    />
                </div>
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
                        placeholder="Create a password"
                        required
                    />
                </div>
                <div class="space-y-2">
                    <Label for="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        bind:value={confirmPassword}
                        placeholder="Confirm your password"
                        required
                    />
                </div>

                {#if error}
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                {/if}

                <Button type="submit" class="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create account'}
                </Button>
            </form>
        </CardContent>
        <CardFooter class="flex justify-center">
            <p class="text-sm text-muted-foreground">
                Already have an account?
                <a href="/login" class="text-primary hover:underline">Sign in</a>
            </p>
        </CardFooter>
    </Card>
</div> 