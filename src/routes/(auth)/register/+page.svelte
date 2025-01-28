<!-- src/routes/(auth)/register/+page.svelte -->
<script lang="ts">
    import { register } from '$lib/services/auth';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { authStore } from '$lib/stores/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Separator } from '$lib/components/ui/separator';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import * as Icons from 'lucide-svelte';
    import { fade } from 'svelte/transition';
    import { cn } from '$lib/utils';

    let loading = false;
    let showPassword = false;
    let acceptTerms = false;
    let formData = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: ''
    };

    let errors = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        terms: ''
    };

    const roles = [
        { value: 'student', label: 'Student' },
        { value: 'teacher', label: 'Teacher' },
        { value: 'admin', label: 'Administrator' }
    ];

    function validateForm() {
        let isValid = true;
        errors = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: '',
            terms: ''
        };

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
            isValid = false;
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
            isValid = false;
        }

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
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
            isValid = false;
        }

        if (!formData.role) {
            errors.role = 'Please select your role';
            isValid = false;
        }

        if (!acceptTerms) {
            errors.terms = 'You must accept the terms and conditions';
            isValid = false;
        }

        return isValid;
    }

    async function handleSubmit() {
        if (loading) return;
        
        if (!validateForm()) return;
        
        try {
            loading = true;
            await register(
                formData.email,
                formData.password,
                `${formData.firstName} ${formData.lastName}`
            );
            const redirectTo = $page.url.searchParams.get('redirect') || '/schedule';
            goto(redirectTo);
        } catch (error) {
            loading = false;
        }
    }

    function handleGoogleRegister() {
        // TODO: Implement Google registration
    }
</script>

<div class="grid gap-6">
    <!-- Social Sign Up -->
    <Button 
        variant="outline" 
        class="relative w-full bg-background hover:bg-accent/5" 
        on:click={handleGoogleRegister}
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

        <div class="grid gap-4 sm:grid-cols-2">
            <div class="grid gap-2">
                <Label for="firstName">First name</Label>
                <Input
                    type="text"
                    id="firstName"
                    bind:value={formData.firstName}
                    required
                    disabled={loading}
                    autocomplete="given-name"
                    class={cn(errors.firstName && "border-destructive")}
                />
                {#if errors.firstName}
                    <p class="text-xs text-destructive" transition:fade>{errors.firstName}</p>
                {/if}
            </div>
            <div class="grid gap-2">
                <Label for="lastName">Last name</Label>
                <Input
                    type="text"
                    id="lastName"
                    bind:value={formData.lastName}
                    required
                    disabled={loading}
                    autocomplete="family-name"
                    class={cn(errors.lastName && "border-destructive")}
                />
                {#if errors.lastName}
                    <p class="text-xs text-destructive" transition:fade>{errors.lastName}</p>
                {/if}
            </div>
        </div>

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
            <Label for="password">Password</Label>
            <div class="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    bind:value={formData.password}
                    required
                    disabled={loading}
                    autocomplete="new-password"
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
            {:else}
                <p class="text-xs text-muted-foreground">
                    Must be at least 8 characters long
                </p>
            {/if}
        </div>

        <div class="grid gap-2">
            <Label for="role">I am a</Label>
            <Select bind:value={formData.role} required>
                <SelectTrigger id="role" class={cn(errors.role && "border-destructive")}>
                    <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                    {#each roles as role}
                        <SelectItem value={role.value}>{role.label}</SelectItem>
                    {/each}
                </SelectContent>
            </Select>
            {#if errors.role}
                <p class="text-xs text-destructive" transition:fade>{errors.role}</p>
            {/if}
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-start space-x-2">
                <Checkbox id="terms" bind:checked={acceptTerms} />
                <div class="grid gap-1.5 leading-none">
                    <label
                        for="terms"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Accept terms and conditions
                    </label>
                    <p class="text-xs text-muted-foreground">
                        By creating an account, you agree to our{" "}
                        <a href="/terms" class="font-medium underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </a>
                        {" "}and{" "}
                        <a href="/privacy" class="font-medium underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
            {#if errors.terms}
                <p class="text-xs text-destructive" transition:fade>{errors.terms}</p>
            {/if}
        </div>

        <Button type="submit" disabled={loading} class="w-full">
            {#if loading}
                <Icons.Loader2 class="mr-2 h-4 w-4 animate-spin" />
                Creating account...
            {:else}
                Create account
            {/if}
        </Button>
    </form>

    <div class="text-center text-sm">
        <span class="text-muted-foreground">
            Already have an account?{" "}
        </span>
        <a href="/login" class="font-medium text-primary hover:underline">
            Sign in
        </a>
    </div>
</div> 