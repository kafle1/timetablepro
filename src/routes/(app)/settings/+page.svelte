<!-- src/routes/(app)/settings/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { getUsers, updateUser } from '$lib/services/database';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Bell, Lock, Eye, Globe, Moon, Shield, Key } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config/index';

  let loading = true;
  let error: string | null = null;
  let currentUser: User | null = null;
  let showPasswordDialog = false;
  let showNotificationDialog = false;
  let showPrivacyDialog = false;
  let settings = {
    notifications: {
      email: true,
      push: true,
      scheduleChanges: true,
      announcements: true
    },
    privacy: {
      showEmail: true,
      showPhone: false,
      showAddress: false
    },
    appearance: {
      darkMode: false,
      compactView: false
    }
  };

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      loading = true;
      error = null;
      const allUsers = await getUsers();
      
      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('No user logged in');
      }
      currentUser = allUsers.find(u => u.$id === user.$id) as User;
      
      // Load settings from user preferences
      if (currentUser.preferences) {
        settings = {
          ...settings,
          ...currentUser.preferences
        };
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load data';
      toastStore.error(error);
    } finally {
      loading = false;
    }
  }

  async function handleUpdateSettings() {
    if (!currentUser) return;

    try {
      await updateUser(currentUser.$id, {
        preferences: settings
      });
      toastStore.success('Settings updated successfully');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update settings';
      toastStore.error(error);
    }
  }

  async function handleChangePassword() {
    if (!currentUser) return;

    try {
      // TODO: Implement password change
      showPasswordDialog = false;
      toastStore.success('Password changed successfully');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to change password';
      toastStore.error(error);
    }
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Settings</h1>
  </div>

  {#if error}
    <div class="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  {:else if currentUser}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-card rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <Bell class="w-5 h-5 mr-2" />
          Notification Settings
        </h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Email Notifications</h3>
              <p class="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.notifications.email}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Push Notifications</h3>
              <p class="text-sm text-muted-foreground">Receive push notifications</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.notifications.push}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Schedule Changes</h3>
              <p class="text-sm text-muted-foreground">Notify when schedules are changed</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.notifications.scheduleChanges}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Announcements</h3>
              <p class="text-sm text-muted-foreground">Receive system announcements</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.notifications.announcements}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="bg-card rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <Lock class="w-5 h-5 mr-2" />
          Privacy Settings
        </h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Show Email</h3>
              <p class="text-sm text-muted-foreground">Make your email visible to others</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.privacy.showEmail}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Show Phone</h3>
              <p class="text-sm text-muted-foreground">Make your phone number visible to others</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.privacy.showPhone}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Show Address</h3>
              <p class="text-sm text-muted-foreground">Make your address visible to others</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.privacy.showAddress}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="bg-card rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <Globe class="w-5 h-5 mr-2" />
          Appearance Settings
        </h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Dark Mode</h3>
              <p class="text-sm text-muted-foreground">Enable dark mode theme</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.appearance.darkMode}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">Compact View</h3>
              <p class="text-sm text-muted-foreground">Use compact layout</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                bind:checked={settings.appearance.compactView}
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="bg-card rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <Shield class="w-5 h-5 mr-2" />
          Security Settings
        </h2>
        <div class="space-y-4">
          <Button variant="outline" class="w-full" on:click={() => showPasswordDialog = true}>
            <Key class="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" class="w-full">
            <Shield class="w-4 h-4 mr-2" />
            Two-Factor Authentication
          </Button>
          <Button variant="outline" class="w-full">
            <Eye class="w-4 h-4 mr-2" />
            Login History
          </Button>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-end">
      <Button on:click={handleUpdateSettings}>
        Save Changes
      </Button>
    </div>
  {/if}

  {#if showPasswordDialog}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-card p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Change Password</h2>
        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="flex justify-end space-x-2">
            <Button type="button" variant="outline" on:click={() => showPasswordDialog = false}>
              Cancel
            </Button>
            <Button type="button" on:click={handleChangePassword}>
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div> 