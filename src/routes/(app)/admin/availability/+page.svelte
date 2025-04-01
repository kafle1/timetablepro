<!-- src/routes/(app)/admin/availability/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { getUsers } from '$lib/services/database';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Calendar } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config/constants';

  let loading = true;
  let error: string | null = null;
  let teachers: User[] = [];
  let selectedTeacher: User | null = null;

  onMount(async () => {
    await loadTeachers();
  });

  async function loadTeachers() {
    try {
      loading = true;
      error = null;
      const allUsers = await getUsers();
      teachers = allUsers.filter(user => user.role === USER_ROLES.TEACHER) as User[];
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load teachers';
      toastStore.success(error);
    } finally {
      loading = false;
    }
  }

  function handleTeacherSelect(teacher: User) {
    selectedTeacher = teacher;
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Teacher Availability Management</h1>
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
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-card rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-4">Teachers</h2>
        <div class="space-y-2">
          {#each teachers as teacher}
            <button
              class="w-full text-left p-2 rounded hover:bg-muted/50 {selectedTeacher?.$id === teacher.$id ? 'bg-primary/10' : ''}"
              on:click={() => handleTeacherSelect(teacher)}
            >
              {teacher.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="md:col-span-2 bg-card rounded-lg shadow p-4">
        {#if selectedTeacher}
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">{selectedTeacher.name}'s Availability</h2>
            <Button>
              <Calendar class="w-4 h-4 mr-2" />
              Edit Availability
            </Button>
          </div>
          <div class="text-muted-foreground">
            Select a teacher to view and manage their availability.
          </div>
        {:else}
          <div class="text-center text-muted-foreground">
            Select a teacher to view and manage their availability.
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div> 