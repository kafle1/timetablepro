<!-- src/routes/(app)/profile/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authService } from '$lib/services/auth';
    import { userStore } from '$lib/stores/userStore';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Loader2, User, Mail, Shield, Key } from 'lucide-svelte';

    let loading = false;
    let saving = false;
    let error: string | null = null;
    let success: string | null = null;

    // Form fields
    let name = '';
    let email = '';
    let currentPassword = '';
    let newPassword = '';
    let confirmPassword = '';

    onMount(() => {
        if ($userStore.user) {
            name = $userStore.user.name;
            email = $userStore.user.email;
        }
    });

    async function updateProfile() {
        try {
            saving = true;
            error = null;
            success = null;

            if (!name) {
                error = 'Name is required';
                return;
            }

            if (!$userStore.user) {
                error = 'You must be logged in to update your profile';
                return;
            }

            // Update user profile
            await authService.updateUser($userStore.user.$id, { name });
            
            // Update user store
            userStore.setUser({
                ...$userStore.user,
                name
            });

            success = 'Profile updated successfully';
        } catch (err: any) {
            console.error('Error updating profile:', err);
            error = err.message || 'Failed to update profile';
        } finally {
            saving = false;
        }
    }

    async function changePassword() {
        try {
            saving = true;
            error = null;
            success = null;

            if (!currentPassword || !newPassword || !confirmPassword) {
                error = 'All password fields are required';
                return;
            }

            if (newPassword !== confirmPassword) {
                error = 'New passwords do not match';
                return;
            }

            if (!$userStore.user) {
                error = 'You must be logged in to change your password';
                return;
            }

            // Change password
            await authService.updatePassword(currentPassword, newPassword);

            // Reset password fields
            currentPassword = '';
            newPassword = '';
            confirmPassword = '';

            success = 'Password changed successfully';
        } catch (err: any) {
            console.error('Error changing password:', err);
            error = err.message || 'Failed to change password';
        } finally {
            saving = false;
        }
    }
</script>

<div class="container py-6 space-y-6 max-w-3xl mx-auto">
    <h1 class="text-3xl font-bold tracking-tight">My Profile</h1>

    {#if error}
        <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    {/if}

    {#if success}
        <Alert variant="default" class="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30">
            <AlertDescription>{success}</AlertDescription>
        </Alert>
    {/if}

    {#if $userStore.user}
        <div class="grid gap-6">
            <!-- Profile Information -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center">
                        <User class="h-5 w-5 mr-2 text-primary" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Update your account profile information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <Label for="name">Full Name</Label>
                            <Input id="name" bind:value={name} placeholder="Your name" />
                        </div>
                        
                        <div class="space-y-2">
                            <Label for="email">Email</Label>
                            <Input id="email" type="email" value={email} disabled />
                            <p class="text-xs text-muted-foreground">
                                Email cannot be changed. Contact an administrator if you need to update your email.
                            </p>
                        </div>

                        <div class="flex items-center space-x-2 mt-2">
                            <Shield class="h-4 w-4 text-blue-500" />
                            <span class="text-sm font-medium">
                                Role: {$userStore.user.role.charAt(0).toUpperCase() + $userStore.user.role.slice(1).toLowerCase()}
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button on:click={updateProfile} disabled={saving} class="w-full sm:w-auto">
                        {#if saving}
                            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        {:else}
                            Save Changes
                        {/if}
                    </Button>
                </CardFooter>
            </Card>

            <!-- Change Password -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center">
                        <Key class="h-5 w-5 mr-2 text-primary" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your account password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <Label for="current-password">Current Password</Label>
                            <Input id="current-password" type="password" bind:value={currentPassword} placeholder="••••••••" />
                        </div>
                        
                        <div class="space-y-2">
                            <Label for="new-password">New Password</Label>
                            <Input id="new-password" type="password" bind:value={newPassword} placeholder="••••••••" />
                        </div>
                        
                        <div class="space-y-2">
                            <Label for="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" bind:value={confirmPassword} placeholder="••••••••" />
                            <p class="text-xs text-muted-foreground">
                                Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button on:click={changePassword} disabled={saving} class="w-full sm:w-auto">
                        {#if saving}
                            <Loader2 class="h-4 w-4 mr-2 animate-spin" />
                            Changing Password...
                        {:else}
                            Change Password
                        {/if}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    {:else}
        <div class="text-center py-12">
            <div class="bg-muted p-8 rounded-lg">
                <p class="text-muted-foreground mb-4">You must be logged in to view your profile.</p>
                <Button href="/login" class="mt-2">Sign In</Button>
            </div>
        </div>
    {/if}
</div> 