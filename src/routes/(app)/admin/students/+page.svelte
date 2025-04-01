<!-- src/routes/(app)/admin/students/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { createUser, updateUser, deleteUser, getUsers } from '$lib/services/database';
  import type { CreateUserParams, UpdateUserParams } from '$lib/services/auth';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Users } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config/constants';

  let loading = true;
  let error: string | null = null;
  let students: User[] = [];
  let showAddDialog = false;
  let editingStudent: User | null = null;
  let newStudent: CreateUserParams = {
    name: '',
    email: '',
    role: 'student' as keyof typeof USER_ROLES,
    password: ''
  };

  onMount(async () => {
    await loadStudents();
  });

  async function loadStudents() {
    try {
      loading = true;
      error = null;
      const allUsers = await getUsers();
      students = allUsers.filter(user => user.role === USER_ROLES.STUDENT) as User[];
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load students';
      toastStore.success(error);
    } finally {
      loading = false;
    }
  }

  function handleAddStudent() {
    editingStudent = null;
    newStudent = {
      name: '',
      email: '',
      role: 'student' as keyof typeof USER_ROLES,
      password: ''
    };
    showAddDialog = true;
  }

  function handleEditStudent(student: User) {
    editingStudent = student;
    newStudent = {
      name: student.name,
      email: student.email,
      role: student.role as keyof typeof USER_ROLES,
      password: ''
    };
    showAddDialog = true;
  }

  async function handleDeleteStudent(student: User) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await deleteUser(student.$id);
      students = students.filter(s => s.$id !== student.$id);
      toastStore.success('Student deleted successfully');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete student';
      toastStore.error(error);
    }
  }

  async function handleSubmit() {
    try {
      if (editingStudent) {
        const updateData: UpdateUserParams = {
          name: newStudent.name,
          email: newStudent.email,
          role: newStudent.role
        };
        await updateUser(editingStudent.$id, updateData);
        students = students.map(s => 
          s.$id === editingStudent?.$id ? { ...s, ...updateData } : s
        );
        toastStore.success('Student updated successfully');
      } else {
        const created = await authService.register(
          newStudent.email,
          newStudent.password,
          newStudent.name,
          newStudent.role
        );
        students = [...students, created];
        toastStore.success('Student created successfully');
      }
      showAddDialog = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save student';
      toastStore.error(error);
    }
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Student Management</h1>
    <Button on:click={handleAddStudent}>
      <Users class="w-4 h-4 mr-2" />
      Add Student
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
            {#each students as student}
              <tr class="border-b hover:bg-muted/50">
                <td class="px-6 py-4">{student.name}</td>
                <td class="px-6 py-4">{student.email}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs rounded-full {student.isActive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}">
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex space-x-2">
                    <Button variant="outline" size="sm" on:click={() => handleEditStudent(student)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" on:click={() => handleDeleteStudent(student)}>
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
          {editingStudent ? 'Edit Student' : 'Add Student'}
        </h2>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              bind:value={newStudent.name}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              bind:value={newStudent.email}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          {#if !editingStudent}
            <div>
              <label class="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                bind:value={newStudent.password}
                class="w-full p-2 border rounded"
                required
              />
            </div>
          {/if}
          <div class="flex justify-end space-x-2">
            <Button type="button" variant="outline" on:click={() => showAddDialog = false}>
              Cancel
            </Button>
            <Button type="submit">
              {editingStudent ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div> 