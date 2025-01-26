<!-- src/routes/(auth)/register/+page.svelte -->
<script lang="ts">
    import { register } from '$lib/services/auth';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';

    let email = '';
    let password = '';
    let name = '';
    let loading = false;

    async function handleSubmit() {
        try {
            loading = true;
            await register(email, password, name);
            goto('/dashboard');
        } catch (error) {
            loading = false;
        }
    }
</script>

<div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold mb-8">Register</h1>

    {#if $authStore.error}
        <Alert variant="destructive" class="mb-4">
            <AlertDescription>{$authStore.error}</AlertDescription>
        </Alert>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        <div class="space-y-2">
            <Label for="name">Full Name</Label>
            <Input
                type="text"
                id="name"
                bind:value={name}
                required
                disabled={loading}
            />
        </div>

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
                minlength="8"
            />
        </div>

        <Button type="submit" disabled={loading} class="w-full">
            {loading ? 'Creating account...' : 'Register'}
        </Button>
    </form>

    <p class="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?
        <a href="/auth/login" class="text-primary hover:underline">Login</a>
    </p>
</div> 