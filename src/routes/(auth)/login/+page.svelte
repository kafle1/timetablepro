<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
    import { login } from '$lib/services/auth';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';

    let email = '';
    let password = '';
    let loading = false;

    async function handleSubmit() {
        try {
            loading = true;
            await login(email, password);
            goto('/dashboard');
        } catch (error) {
            loading = false;
        }
    }
</script>

<div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold mb-8">Login</h1>

    {#if $authStore.error}
        <Alert variant="destructive" class="mb-4">
            <AlertDescription>{$authStore.error}</AlertDescription>
        </Alert>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
                type="email"
                id="email"
                bind:value={email}
                required
                disabled={loading}
            />
        </div>

        <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
                type="password"
                id="password"
                bind:value={password}
                required
                disabled={loading}
            />
        </div>

        <Button type="submit" disabled={loading} class="w-full">
            {loading ? 'Logging in...' : 'Login'}
        </Button>
    </form>

    <p class="mt-4 text-center text-sm text-muted-foreground">
        Don't have an account?
        <a href="/auth/register" class="text-primary hover:underline">Register</a>
    </p>
</div> 