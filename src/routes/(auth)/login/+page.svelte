                name="password"
                type="password"
                required
<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
    import { login } from '$lib/services/auth';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { authStore } from '$lib/stores/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Separator } from '$lib/components/ui/separator';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import * as Icons from 'lucide-svelte';
    import { fade } from 'svelte/transition';
    import { cn } from '$lib/utils';

    let loading = false;
    let showPassword = false;
    let rememberMe = false;
    let formData = {
        email: '',
        password: ''
    };

    let errors = {
        email: '',
        password: ''
    };

    function validateForm() {
        let isValid = true;
        errors = {
            email: '',
            password: ''
        };

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
            isValid = false;
        }

        if (!formData.password) {
            errors.password = 'Password is required';
            isValid = false;
        }

        return isValid;
    }

    async function handleSubmit() {
        if (loading) return;
        
        if (!validateForm()) return;
        
        try {
            loading = true;
            await login(formData.email, formData.password);
            const redirectTo = $page.url.searchParams.get('redirect') || '/schedule';
            goto(redirectTo);
        } catch (error) {
            loading = false;
        }
    }

    function handleGoogleLogin() {
        // TODO: Implement Google login
    }
</script>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div class="text-center">
            <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
                Welcome back
            </h2>
            <p class="mt-2 text-sm text-gray-600">
                Sign in to your account to continue
            </p>
        </div>

        <div class="grid gap-6">
            <!-- Social Sign In -->
            <Button 
                variant="outline" 
                class="relative w-full bg-background hover:bg-accent/5" 
                on:click={handleGoogleLogin}
                disabled={loading}
            >
                <Icons.Chrome class="mr-2 h-4 w-4" />
                Continue with Google
            </Button>
            
            <div class="relative">
                <div class="absolute inset-0 flex items-center">
                    <Separator class="w-full" />
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                    <span class="bg-background px-2 text-muted-foreground">or continue with email</span>
                </div>
            </div>

            <form on:submit|preventDefault={handleSubmit} class="grid gap-4">
                {#if $authStore.error}
                    <div transition:fade>
                        <Alert variant="destructive">
                            <Icons.AlertCircle class="h-4 w-4" />
                            <AlertDescription>{$authStore.error}</AlertDescription>
                        </Alert>
                    </div>
                {/if}

                <div class="grid gap-2">
                    <Label for="email">Email</Label>
                    <Input
                        type="email"
                        id="email"
                        bind:value={formData.email}
                        required
                        disabled={loading}
                        placeholder="name@example.com"
                        autocomplete="email"
                        class={cn(errors.email && "border-destructive")}
                    />
                    {#if errors.email}
                        <p class="text-xs text-destructive" transition:fade>{errors.email}</p>
                    {/if}
                </div>

                <div class="grid gap-2">
                    <div class="flex items-center justify-between">
                        <Label for="password">Password</Label>
                        <a 
                            href="/forgot-password" 
                            class="text-sm font-medium text-primary hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>
                    <div class="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            bind:value={formData.password}
                            required
                            disabled={loading}
                            autocomplete="current-password"
                            class={cn("pr-10", errors.password && "border-destructive")}
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            on:click={() => showPassword = !showPassword}
                            tabindex="-1"
                        >
                            {#if showPassword}
                                <Icons.EyeOff class="h-4 w-4" />
                            {:else}
                                <Icons.Eye class="h-4 w-4" />
                            {/if}
                        </button>
                    </div>
                    {#if errors.password}
                        <p class="text-xs text-destructive" transition:fade>{errors.password}</p>
                    {/if}
                </div>

                <div class="flex items-center space-x-2">
                    <Checkbox id="remember" bind:checked={rememberMe} />
                    <label
                        for="remember"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Remember me
                    </label>
                </div>

                <Button type="submit" disabled={loading} class="w-full">
                    {#if loading}
                        <Icons.Loader2 class="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                    {:else}
                        Sign in
                    {/if}
                </Button>
            </form>

            <div class="text-center text-sm">
                <span class="text-muted-foreground">
                    Don't have an account?{" "}
                </span>
                <a href="/register" class="font-medium text-primary hover:underline">
                    Create an account
                </a>
            </div>
        </div>
    </div>
</div>

<footer class="absolute bottom-0 w-full py-6 text-center text-sm text-gray-500">
    © {new Date().getFullYear()} TimetablePro. All rights reserved.
</footer> 