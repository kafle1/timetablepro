<!-- src/routes/(app)/settings/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { userStore } from '$lib/stores/userStore';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '$lib/components/ui/card';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Label } from '$lib/components/ui/label';
    import { Switch } from '$lib/components/ui/switch';
    import { Loader2, Moon, Sun, Bell, Monitor, Palette } from 'lucide-svelte';

    let loading = false;
    let saving = false;
    let error: string | null = null;
    let success: string | null = null;

    // Settings
    let theme: 'light' | 'dark' | 'system' = 'system';
    let enableNotifications = true;
    let enableAnimations = true;
    let colorScheme = 'default';

    onMount(() => {
        loadSettings();
    });

    function loadSettings() {
        try {
            loading = true;
            
            // Load theme from localStorage
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
                theme = savedTheme as 'light' | 'dark' | 'system';
            }
            
            // Load other settings from localStorage
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                try {
                    const settings = JSON.parse(savedSettings);
                    enableNotifications = settings.enableNotifications ?? true;
                    enableAnimations = settings.enableAnimations ?? true;
                    colorScheme = settings.colorScheme ?? 'default';
                } catch (e) {
                    console.error('Error parsing settings:', e);
                }
            }
            
            // Apply current theme
            applyTheme(theme);
        } catch (err: any) {
            console.error('Error loading settings:', err);
            error = 'Failed to load settings';
        } finally {
            loading = false;
        }
    }

    function saveSettings() {
        try {
            saving = true;
            error = null;
            success = null;
            
            // Save theme to localStorage
            localStorage.setItem('theme', theme);
            
            // Apply theme
            applyTheme(theme);
            
            // Save other settings to localStorage
            const settings = {
                enableNotifications,
                enableAnimations,
                colorScheme
            };
            localStorage.setItem('appSettings', JSON.stringify(settings));
            
            success = 'Settings saved successfully';
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                if (success) {
                    success = null;
                }
            }, 3000);
        } catch (err: any) {
            console.error('Error saving settings:', err);
            error = 'Failed to save settings';
        } finally {
            saving = false;
        }
    }

    function applyTheme(selectedTheme: 'light' | 'dark' | 'system') {
        const root = document.documentElement;
        
        if (selectedTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
        } else {
            root.classList.remove('light', 'dark');
            root.classList.add(selectedTheme);
        }
    }

    function setTheme(selectedTheme: 'light' | 'dark' | 'system') {
        theme = selectedTheme;
    }
</script>

<div class="container py-6 space-y-6 max-w-3xl mx-auto">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
        <Button on:click={saveSettings} disabled={saving} class="w-full sm:w-auto">
            {#if saving}
                <Loader2 class="h-4 w-4 mr-2 animate-spin" />
                Saving...
            {:else}
                Save Settings
            {/if}
        </Button>
    </div>

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

    <div class="grid gap-6">
        <!-- Appearance -->
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center">
                    <Palette class="h-5 w-5 mr-2 text-primary" />
                    Appearance
                </CardTitle>
                <CardDescription>
                    Customize how the application looks
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="space-y-6">
                    <div>
                        <h3 class="text-lg font-medium mb-3">Theme</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Button 
                                variant={theme === 'light' ? 'default' : 'outline'} 
                                class="flex flex-col items-center justify-center h-24 gap-2"
                                on:click={() => setTheme('light')}
                            >
                                <Sun class="h-6 w-6" />
                                <span>Light</span>
                            </Button>
                            <Button 
                                variant={theme === 'dark' ? 'default' : 'outline'} 
                                class="flex flex-col items-center justify-center h-24 gap-2"
                                on:click={() => setTheme('dark')}
                            >
                                <Moon class="h-6 w-6" />
                                <span>Dark</span>
                            </Button>
                            <Button 
                                variant={theme === 'system' ? 'default' : 'outline'} 
                                class="flex flex-col items-center justify-center h-24 gap-2"
                                on:click={() => setTheme('system')}
                            >
                                <Monitor class="h-6 w-6" />
                                <span>System</span>
                            </Button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="space-y-0.5">
                            <Label for="animations" class="text-base">Animations</Label>
                            <p class="text-sm text-muted-foreground">
                                Enable animations throughout the application
                            </p>
                        </div>
                        <Switch id="animations" bind:checked={enableAnimations} />
                    </div>
                </div>
            </CardContent>
        </Card>

        <!-- Notifications -->
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center">
                    <Bell class="h-5 w-5 mr-2 text-primary" />
                    Notifications
                </CardTitle>
                <CardDescription>
                    Configure notification preferences
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="flex items-center justify-between">
                    <div class="space-y-0.5">
                        <Label for="notifications" class="text-base">Enable Notifications</Label>
                        <p class="text-sm text-muted-foreground">
                            Receive notifications about schedule changes and updates
                        </p>
                    </div>
                    <Switch id="notifications" bind:checked={enableNotifications} />
                </div>
            </CardContent>
        </Card>

        <div class="flex justify-end">
            <Button on:click={saveSettings} disabled={saving}>
                {#if saving}
                    <Loader2 class="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                {:else}
                    Save Settings
                {/if}
            </Button>
        </div>
    </div>
</div> 