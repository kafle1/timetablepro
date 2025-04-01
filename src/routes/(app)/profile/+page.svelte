<!-- src/routes/(app)/profile/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { getUsers, updateUser } from '$lib/services/database';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { User as UserIcon, Mail, Phone, MapPin, Calendar, School, Building, Award } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config/index';
  import { ROUTES } from '$lib/config';

  let loading = true;
  let error: string | null = null;
  let currentUser: User | null = null;
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
      
      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('No user logged in');
      }
      currentUser = allUsers.find(u => u.$id === user.$id) as User;
      
      // Initialize editing profile
      editingProfile = {
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        bio: currentUser.bio || ''
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
    if (!currentUser) return;

    try {
      await updateUser(currentUser.$id, editingProfile);
      await loadData();
      showEditDialog = false;
      toastStore.success('Profile updated successfully');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update profile';
      toastStore.error(error);
    }
  }

  function getRoleIcon(role: string) {
    switch(role) {
      case USER_ROLES.ADMIN:
        return Building;
      case USER_ROLES.TEACHER:
        return Award;
      case USER_ROLES.STUDENT:
        return School;
      default:
        return UserIcon;
    }
  }

  function getRoleLabel(role: string) {
    switch(role) {
      case USER_ROLES.ADMIN:
        return 'Administrator';
      case USER_ROLES.TEACHER:
        return 'Teacher';
      case USER_ROLES.STUDENT:
        return 'Student';
      default:
        return 'User';
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
  {:else if currentUser}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-card rounded-lg shadow p-6">
        <div class="flex items-center space-x-4 mb-6">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <svelte:component this={getRoleIcon(currentUser.role)} class="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 class="text-xl font-semibold">{currentUser.name}</h2>
            <p class="text-muted-foreground">{getRoleLabel(currentUser.role)}</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Mail class="w-5 h-5 text-muted-foreground" />
            <span>{currentUser.email}</span>
          </div>
          {#if currentUser.phone}
            <div class="flex items-center space-x-2">
              <Phone class="w-5 h-5 text-muted-foreground" />
              <span>{currentUser.phone}</span>
            </div>
          {/if}
          {#if currentUser.address}
            <div class="flex items-center space-x-2">
              <MapPin class="w-5 h-5 text-muted-foreground" />
              <span>{currentUser.address}</span>
            </div>
          {/if}
          <div class="flex items-center space-x-2">
            <Calendar class="w-5 h-5 text-muted-foreground" />
            <span>Member since {new Date(currentUser.$createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {#if currentUser.bio}
          <div class="mt-6">
            <h3 class="text-lg font-semibold mb-2">About Me</h3>
            <p class="text-muted-foreground">{currentUser.bio}</p>
          </div>
        {/if}
      </div>

      <div class="bg-card rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Account Settings</h3>
        <div class="space-y-4">
          <a href={ROUTES.SETTINGS} class="block w-full">
            <Button variant="outline" class="w-full">
              Go to Settings
            </Button>
          </a>
          
          <!-- Role-specific links -->
          {#if currentUser.role === USER_ROLES.ADMIN}
            <a href={ROUTES.ADMIN_DASHBOARD} class="block w-full">
              <Button variant="outline" class="w-full">
                Admin Dashboard
              </Button>
            </a>
          {:else if currentUser.role === USER_ROLES.TEACHER}
            <a href={ROUTES.TEACHER.AVAILABILITY} class="block w-full">
              <Button variant="outline" class="w-full">
                My Availability
              </Button>
            </a>
          {:else if currentUser.role === USER_ROLES.STUDENT}
            <a href={ROUTES.STUDENT.SCHEDULES} class="block w-full">
              <Button variant="outline" class="w-full">
                My Schedule
              </Button>
            </a>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if showEditDialog}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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