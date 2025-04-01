<!-- src/routes/(app)/teacher/profile/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { getUsers, updateUser } from '$lib/services/database';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { User as UserIcon, Mail, Phone, MapPin, Calendar } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config/constants';

  let loading = true;
  let error: string | null = null;
  let currentTeacher: User | null = null;
  let showEditDialog = false;
  let editingProfile = {
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  };

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      loading = true;
      error = null;
      const allUsers = await getUsers();
      
      // Get current teacher
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      currentTeacher = allUsers.find(user => user.$id === currentUser.$id) as User;
      
      // Initialize editing profile
      editingProfile = {
        name: currentTeacher.name,
        email: currentTeacher.email,
        phone: currentTeacher.phone || '',
        address: currentTeacher.address || '',
        bio: currentTeacher.bio || ''
      };
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load data';
      toastStore.error(error);
    } finally {
      loading = false;
    }
  }

  function handleEditProfile() {
    showEditDialog = true;
  }

  async function handleSubmit() {
    if (!currentTeacher) return;

    try {
      await updateUser(currentTeacher.$id, editingProfile);
      await loadData();
      showEditDialog = false;
      toastStore.success('Profile updated successfully');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update profile';
      toastStore.error(error);
    }
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">My Profile</h1>
    <Button on:click={handleEditProfile}>
      <UserIcon class="w-4 h-4 mr-2" />
      Edit Profile
    </Button>
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
  {:else if currentTeacher}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-card rounded-lg shadow p-6">
        <div class="flex items-center space-x-4 mb-6">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <UserIcon class="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{currentTeacher.name}</h2>
            <p class="text-muted-foreground">Teacher</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Mail class="w-5 h-5 text-muted-foreground" />
            <span>{currentTeacher.email}</span>
          </div>
          {#if currentTeacher.phone}
            <div class="flex items-center space-x-2">
              <Phone class="w-5 h-5 text-muted-foreground" />
              <span>{currentTeacher.phone}</span>
            </div>
          {/if}
          {#if currentTeacher.address}
            <div class="flex items-center space-x-2">
              <MapPin class="w-5 h-5 text-muted-foreground" />
              <span>{currentTeacher.address}</span>
            </div>
          {/if}
          <div class="flex items-center space-x-2">
            <Calendar class="w-5 h-5 text-muted-foreground" />
            <span>Member since {new Date(currentTeacher.$createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {#if currentTeacher.bio}
          <div class="mt-6">
            <h3 class="text-lg font-semibold mb-2">About Me</h3>
            <p class="text-muted-foreground">{currentTeacher.bio}</p>
          </div>
        {/if}
      </div>

      <div class="bg-card rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Account Settings</h3>
        <div class="space-y-4">
          <Button variant="outline" class="w-full">
            Change Password
          </Button>
          <Button variant="outline" class="w-full">
            Notification Settings
          </Button>
          <Button variant="outline" class="w-full">
            Privacy Settings
          </Button>
        </div>
      </div>
    </div>
  {/if}

  {#if showEditDialog}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="bg-card p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Edit Profile</h2>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              bind:value={editingProfile.name}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              bind:value={editingProfile.email}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              bind:value={editingProfile.phone}
              class="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Address</label>
            <input
              type="text"
              bind:value={editingProfile.address}
              class="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Bio</label>
            <textarea
              bind:value={editingProfile.bio}
              class="w-full p-2 border rounded"
              rows="4"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2">
            <Button type="button" variant="outline" on:click={() => showEditDialog = false}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div> 