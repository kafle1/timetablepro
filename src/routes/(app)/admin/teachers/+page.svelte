<!-- src/routes/(app)/admin/teachers/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { createUser, updateUser, deleteUser, getUsers } from '$lib/services/database';
  import type { UserData } from '$lib/services/database';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Users } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config/constants';

  let loading = true;
  let error: string | null = null;
  let teachers: User[] = [];
  let showAddDialog = false;
  let editingTeacher: User | null = null;
  let newTeacher: UserData = {
    name: '',
    email: '',
    role: USER_ROLES.TEACHER,
    isActive: true,
    userId: '',
    preferences: {}
  };

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

  function handleAddTeacher() {
    editingTeacher = null;
    newTeacher = {
      name: '',
      email: '',
      role: USER_ROLES.TEACHER,
      isActive: true,
      userId: '',
      preferences: {}
    };
    showAddDialog = true;
  }

  function handleEditTeacher(teacher: User) {
    editingTeacher = teacher;
    newTeacher = { ...teacher };
    showAddDialog = true;
  }

  async function handleDeleteTeacher(teacher: User) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      await deleteUser(teacher.$id);
      teachers = teachers.filter(t => t.$id !== teacher.$id);
      toastStore.success('Teacher deleted successfully');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete teacher';
      toastStore.error(error);
    }
  }

  async function handleSubmit() {
    try {
      if (editingTeacher) {
        await updateUser(editingTeacher.$id, newTeacher);
        teachers = teachers.map(t => 
          t.$id === editingTeacher?.$id ? { ...t, ...newTeacher } : t
        );
        toastStore.success('Teacher updated successfully');
      } else {
        const created = await createUser(newTeacher) as User;
        teachers = [...teachers, created];
        toastStore.success('Teacher created successfully');
      }
      showAddDialog = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save teacher';
      toastStore.error(error);
    }
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Teacher Management</h1>
    <Button on:click={handleAddTeacher}>
      <Users class="w-4 h-4 mr-2" />
      Add Teacher
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
  {:else}
    <div class="bg-card rounded-lg shadow">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each teachers as teacher}
              <tr class="border-b hover:bg-muted/50">
                <td class="px-6 py-4">{teacher.name}</td>
                <td class="px-6 py-4">{teacher.email}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs rounded-full {teacher.isActive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}">
                    {teacher.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex space-x-2">
                    <Button variant="outline" size="sm" on:click={() => handleEditTeacher(teacher)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" on:click={() => handleDeleteTeacher(teacher)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  {#if showAddDialog}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div class="bg-card p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
        </h2>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              bind:value={newTeacher.name}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              bind:value={newTeacher.email}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Status</label>
            <select
              bind:value={newTeacher.isActive}
              class="w-full p-2 border rounded"
              required
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2">
            <Button type="button" variant="outline" on:click={() => showAddDialog = false}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTeacher ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div> 