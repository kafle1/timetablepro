<!-- src/routes/(app)/teacher/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { authService } from '$lib/services/auth';
  import { getUsers, getSchedules } from '$lib/services/database';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User, Schedule } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Calendar, Clock, Users, BookOpen } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config/constants';

  let loading = true;
  let error: string | null = null;
  let currentTeacher: User | null = null;
  let schedules: Schedule[] = [];
  let students: User[] = [];

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      loading = true;
      error = null;
      const [allUsers, allSchedules] = await Promise.all([
        getUsers(),
        getSchedules()
      ]);
      
      // Get current teacher
      const currentUser = await authService.getCurrentUser();
      currentTeacher = allUsers.find(user => user.$id === currentUser.$id) as User;
      
      // Get teacher's schedules
      schedules = allSchedules.filter(schedule => schedule.teacherId === currentTeacher?.$id);
      
      // Get students (for now, just get all students)
      students = allUsers.filter(user => user.role === USER_ROLES.STUDENT) as User[];
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load data';
      toastStore.error(error);
    } finally {
      loading = false;
    }
  }

  function getTodaySchedules() {
    const today = new Date().getDay();
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return schedules.filter(schedule => schedule.dayOfWeek === dayMap[today]);
  }

  function getUpcomingSchedules() {
    const today = new Date();
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return scheduleDate > today;
    }).slice(0, 5);
  }
</script>

<div class="container p-6 mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Welcome, {currentTeacher?.name || 'Teacher'}</h1>
  </div>

  {#if error}
    <div class="p-4 mb-6 rounded-md bg-destructive/15 text-destructive">
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center h-64">
      <div class="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
      <div class="p-6 rounded-lg shadow bg-card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-primary/10">
            <Calendar class="w-6 h-6 text-primary" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-muted-foreground">Today's Classes</h3>
            <p class="text-2xl font-bold">{getTodaySchedules().length}</p>
          </div>
        </div>
      </div>

      <div class="p-6 rounded-lg shadow bg-card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-primary/10">
            <Clock class="w-6 h-6 text-primary" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-muted-foreground">Upcoming Classes</h3>
            <p class="text-2xl font-bold">{getUpcomingSchedules().length}</p>
          </div>
        </div>
      </div>

      <div class="p-6 rounded-lg shadow bg-card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-primary/10">
            <Users class="w-6 h-6 text-primary" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-muted-foreground">Total Students</h3>
            <p class="text-2xl font-bold">{students.length}</p>
          </div>
        </div>
      </div>

      <div class="p-6 rounded-lg shadow bg-card">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-primary/10">
            <BookOpen class="w-6 h-6 text-primary" />
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-muted-foreground">Total Classes</h3>
            <p class="text-2xl font-bold">{schedules.length}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="p-6 rounded-lg shadow bg-card">
        <h2 class="mb-4 text-lg font-semibold">Today's Schedule</h2>
        <div class="space-y-4">
          {#each getTodaySchedules() as schedule}
            <div class="flex items-center justify-between p-4 border rounded">
              <div>
                <h3 class="font-medium">{schedule.className}</h3>
                <p class="text-sm text-muted-foreground">{schedule.subject}</p>
                <p class="text-sm text-muted-foreground">{schedule.startTime} - {schedule.endTime}</p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          {:else}
            <p class="text-muted-foreground">No classes scheduled for today.</p>
          {/each}
        </div>
      </div>

      <div class="p-6 rounded-lg shadow bg-card">
        <h2 class="mb-4 text-lg font-semibold">Upcoming Classes</h2>
        <div class="space-y-4">
          {#each getUpcomingSchedules() as schedule}
            <div class="flex items-center justify-between p-4 border rounded">
              <div>
                <h3 class="font-medium">{schedule.className}</h3>
                <p class="text-sm text-muted-foreground">{schedule.subject}</p>
                <p class="text-sm text-muted-foreground">{schedule.startTime} - {schedule.endTime}</p>
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          {:else}
            <p class="text-muted-foreground">No upcoming classes.</p>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div> 