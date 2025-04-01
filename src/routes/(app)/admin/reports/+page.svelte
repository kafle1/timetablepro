<!-- src/routes/(app)/admin/reports/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { getUsers } from '$lib/services/database';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { FileText, Download } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config/constants';

  let loading = true;
  let error: string | null = null;
  let teachers: User[] = [];
  let students: User[] = [];

  onMount(async () => {
    await loadUsers();
  });

  async function loadUsers() {
    try {
      loading = true;
      error = null;
      const allUsers = await getUsers();
      teachers = allUsers.filter(user => user.role === USER_ROLES.TEACHER) as User[];
      students = allUsers.filter(user => user.role === USER_ROLES.STUDENT) as User[];
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load users';
      toastStore.success(error);
    } finally {
      loading = false;
    }
  }

  function handleGenerateReport(type: string) {
    // TODO: Implement report generation
    toastStore.success('Report generation started');
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Reports</h1>
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-card rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Teacher Reports</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 class="font-medium">Teacher Schedule Report</h3>
              <p class="text-sm text-muted-foreground">View and export teacher schedules</p>
            </div>
            <Button on:click={() => handleGenerateReport('teacher-schedule')}>
              <Download class="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
          <div class="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 class="font-medium">Teacher Availability Report</h3>
              <p class="text-sm text-muted-foreground">View and export teacher availability</p>
            </div>
            <Button on:click={() => handleGenerateReport('teacher-availability')}>
              <Download class="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div class="bg-card rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Student Reports</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 class="font-medium">Student Schedule Report</h3>
              <p class="text-sm text-muted-foreground">View and export student schedules</p>
            </div>
            <Button on:click={() => handleGenerateReport('student-schedule')}>
              <Download class="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
          <div class="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 class="font-medium">Student Attendance Report</h3>
              <p class="text-sm text-muted-foreground">View and export student attendance</p>
            </div>
            <Button on:click={() => handleGenerateReport('student-attendance')}>
              <Download class="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div class="bg-card rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Room Reports</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 class="font-medium">Room Utilization Report</h3>
              <p class="text-sm text-muted-foreground">View and export room utilization data</p>
            </div>
            <Button on:click={() => handleGenerateReport('room-utilization')}>
              <Download class="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
          <div class="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 class="font-medium">Room Schedule Report</h3>
              <p class="text-sm text-muted-foreground">View and export room schedules</p>
            </div>
            <Button on:click={() => handleGenerateReport('room-schedule')}>
              <Download class="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div class="bg-card rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">System Reports</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 class="font-medium">System Usage Report</h3>
              <p class="text-sm text-muted-foreground">View and export system usage statistics</p>
            </div>
            <Button on:click={() => handleGenerateReport('system-usage')}>
              <Download class="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
          <div class="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 class="font-medium">Audit Log Report</h3>
              <p class="text-sm text-muted-foreground">View and export system audit logs</p>
            </div>
            <Button on:click={() => handleGenerateReport('audit-log')}>
              <Download class="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div> 