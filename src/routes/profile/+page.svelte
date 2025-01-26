<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { updateProfile } from '$lib/services/auth';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';

    let loading = false;
    let error: string | null = null;
    let success = false;

    let name = $authStore.user?.name || '';
    let avatarFile: File | null = null;
    let avatarPreview: string | null = null;

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            avatarFile = input.files[0];
            avatarPreview = URL.createObjectURL(avatarFile);
        }
    }

    async function handleSubmit() {
        if (!$authStore.user) return;

        try {
            loading = true;
            error = null;
            success = false;

            await updateProfile(name, avatarFile || undefined);
            success = true;

            // Reset file input
            avatarFile = null;
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
                avatarPreview = null;
            }
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            }
        } finally {
            loading = false;
        }
    }

    function getInitials(name: string): string {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    }
</script>

<div class="max-w-2xl mx-auto space-y-6">
    <Card>
        <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
            <div class="space-y-6">
                <div class="flex items-center gap-4">
                    <Avatar class="w-20 h-20">
                        {#if avatarPreview}
                            <AvatarImage src={avatarPreview} alt={name} />
                        {:else if $authStore.user?.avatarUrl}
                            <AvatarImage src={$authStore.user.avatarUrl} alt={name} />
                        {:else}
                            <AvatarFallback>{getInitials(name)}</AvatarFallback>
                        {/if}
                    </Avatar>
                    <div>
                        <Label for="avatar" class="block mb-2">Profile Picture</Label>
                        <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            on:change={handleFileChange}
                        />
                        <p class="text-sm text-muted-foreground mt-1">
                            Recommended: Square image, at least 200x200px
                        </p>
                    </div>
                </div>

                <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                    <div class="space-y-2">
                        <Label for="name">Full Name</Label>
                        <Input
                            id="name"
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
                            value={$authStore.user?.email || ''}
                            disabled
                        />
                        <p class="text-sm text-muted-foreground">
                            Email cannot be changed
                        </p>
                    </div>

                    <div class="space-y-2">
                        <Label for="role">Role</Label>
                        <Input
                            id="role"
                            value={$authStore.user?.role || ''}
                            disabled
                        />
                        <p class="text-sm text-muted-foreground">
                            Role cannot be changed
                        </p>
                    </div>

                    {#if error}
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    {/if}

                    {#if success}
                        <Alert>
                            <AlertDescription>Profile updated successfully</AlertDescription>
                        </Alert>
                    {/if}

                    <Button type="submit" disabled={loading} class="w-full">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </div>
        </CardContent>
    </Card>
</div> 