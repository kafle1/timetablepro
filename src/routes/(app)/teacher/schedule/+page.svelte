<!-- src/routes/(app)/teacher/schedule/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { getUsers, getSchedules } from '$lib/services/database';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User, Schedule } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Calendar, Clock } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config/constants';

  let loading = true;
  let error: string | null = null;
  let currentTeacher: User | null = null;
  let schedules: Schedule[] = [];
  let selectedDay = new Date().getDay();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      currentTeacher = allUsers.find(user => user.$id === currentUser.$id) as User;
      
      // Get teacher's schedules
      schedules = allSchedules.filter(schedule => schedule.teacherId === currentTeacher?.$id);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load data';
      toastStore.error(error);
    } finally {
      loading = false;
    }
  }

  function getSchedulesForDay(dayIndex: number) {
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return schedules.filter(schedule => schedule.dayOfWeek === dayMap[dayIndex]);
  }

  function handleDaySelect(dayIndex: number) {
    selectedDay = dayIndex;
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">My Schedule</h1>
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
    <div class="bg-card rounded-lg shadow p-6">
      <div class="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {#each days as day, index}
          <button
            class="px-4 py-2 rounded-md {selectedDay === index ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
            on:click={() => handleDaySelect(index)}
          >
            {day}
          </button>
        {/each}
      </div>

      <div class="space-y-4">
        {#each getSchedulesForDay(selectedDay) as schedule}
          <div class="flex items-center justify-between p-4 border rounded">
            <div>
              <h3 class="font-medium">{schedule.className}</h3>
              <p class="text-sm text-muted-foreground">{schedule.subject}</p>
              <p class="text-sm text-muted-foreground">{schedule.startTime} - {schedule.endTime}</p>
            </div>
            <div class="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar class="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button variant="outline" size="sm">
                <Clock class="w-4 h-4 mr-2" />
                Mark Attendance
              </Button>
            </div>
          </div>
        {:else}
          <p class="text-muted-foreground text-center py-8">No classes scheduled for {days[selectedDay]}.</p>
        {/each}
      </div>
    </div>
  {/if}
</div> 