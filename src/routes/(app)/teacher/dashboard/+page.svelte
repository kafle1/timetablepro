<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { scheduleService } from '$lib/services/schedule';
  import { teacherAvailabilityService } from '$lib/services/teacher-availability';
  import { notificationService } from '$lib/services/notification';
  import { userStore } from '$lib/stores/userStore';
  import TeacherAvailabilityForm from '$lib/components/TeacherAvailabilityForm.svelte';
  import type { Schedule, TeacherAvailability } from '$lib/types';
  import { DAYS_OF_WEEK } from '$lib/config/constants';
  
  let loading = true;
  let error = '';
  let activeTab = 'schedule';
  
  // Teacher data
  let teacherId = '';
  let teacherSchedules: Schedule[] = [];
  let teacherAvailability: TeacherAvailability[] = [];
  let unreadNotifications = 0;
  let upcomingSchedules: Schedule[] = [];
  
  onMount(async () => {
    try {
      // Check if user is teacher
      if (!$userStore.user || $userStore.user.role !== 'TEACHER') {
        goto('/dashboard');
        return;
      }
      
      teacherId = $userStore.user.$id;
      
      // Load teacher data
      await Promise.all([
        loadTeacherSchedules(),
        loadTeacherAvailability(),
        loadNotificationCount(),
        loadUpcomingSchedules()
      ]);
    } catch (err: any) {
      error = err.message || 'Failed to load dashboard data';
      console.error('Error loading dashboard data:', err);
    } finally {
      loading = false;
    }
  });
  
  async function loadTeacherSchedules() {
    try {
      const response = await scheduleService.listSchedules({ teacherId });
      teacherSchedules = response.documents as Schedule[];
    } catch (err: any) {
      console.error('Error loading teacher schedules:', err);
    }
  }
  
  async function loadTeacherAvailability() {
    try {
      const response = await teacherAvailabilityService.getTeacherAvailability(teacherId);
      teacherAvailability = response.documents as TeacherAvailability[];
    } catch (err: any) {
      console.error('Error loading teacher availability:', err);
    }
  }
  
  async function loadNotificationCount() {
    try {
      if ($userStore.user) {
        unreadNotifications = await notificationService.getUnreadCount($userStore.user.$id);
      }
    } catch (err: any) {
      console.error('Error loading notification count:', err);
    }
  }
  
  async function loadUpcomingSchedules() {
    try {
      // Get current day of week
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[new Date().getDay()];
      
      // Get schedules for today and upcoming days
      const response = await scheduleService.listSchedules({ teacherId, dayOfWeek: today });
      upcomingSchedules = response.documents as Schedule[];
      
      // Sort by start time
      upcomingSchedules.sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    } catch (err: any) {
      console.error('Error loading upcoming schedules:', err);
    }
  }
  
  function setActiveTab(tab: string) {
    activeTab = tab;
  }
  
  function getDayLabel(dayValue: string): string {
    const day = DAYS_OF_WEEK.find(d => d.value === dayValue);
    return day ? day.label : dayValue;
  }
  
  function handleAvailabilitySaved() {
    loadTeacherAvailability();
  }
</script>

<div class="container px-4 py-8 mx-auto">
  <h1 class="mb-6 text-3xl font-bold">Teacher Dashboard</h1>
  
  {#if error}
    <div class="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-md">
      {error}
    </div>
  {/if}
  
  {#if loading}
    <div class="flex items-center justify-center p-8">
      <svg class="w-8 h-8 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  {:else}
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
      <div class="p-6 bg-white rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 mr-4 text-white bg-indigo-500 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="mb-2 text-sm font-medium text-gray-600">Total Classes</p>
            <p class="text-lg font-semibold text-gray-700">{teacherSchedules.length}</p>
          </div>
        </div>
      </div>
      
      <div class="p-6 bg-white rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 mr-4 text-white bg-green-500 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="mb-2 text-sm font-medium text-gray-600">Today's Classes</p>
            <p class="text-lg font-semibold text-gray-700">{upcomingSchedules.length}</p>
          </div>
        </div>
      </div>
      
      <div class="p-6 bg-white rounded-lg shadow">
        <div class="flex items-center">
          <div class="p-3 mr-4 text-white bg-yellow-500 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p class="mb-2 text-sm font-medium text-gray-600">Notifications</p>
            <p class="text-lg font-semibold text-gray-700">{unreadNotifications}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="flex -mb-px space-x-8">
        <button
          class={activeTab === 'schedule' ? 'py-4 px-1 border-b-2 border-indigo-500 text-indigo-600 font-medium text-sm' : 'py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm'}
          on:click={() => setActiveTab('schedule')}
        >
          My Schedule
        </button>
        <button
          class={activeTab === 'availability' ? 'py-4 px-1 border-b-2 border-indigo-500 text-indigo-600 font-medium text-sm' : 'py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm'}
          on:click={() => setActiveTab('availability')}
        >
          Manage Availability
        </button>
        <button
          class={activeTab === 'upcoming' ? 'py-4 px-1 border-b-2 border-indigo-500 text-indigo-600 font-medium text-sm' : 'py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm'}
          on:click={() => setActiveTab('upcoming')}
        >
          Today's Classes
        </button>
      </nav>
    </div>
    
    <!-- Tab Content -->
    {#if activeTab === 'schedule'}
      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <h2 class="mb-4 text-xl font-semibold">My Teaching Schedule</h2>
          {#if teacherSchedules.length === 0}
            <p class="text-gray-500">No scheduled classes found.</p>
          {:else}
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Class
                    </th>
                    <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Day
                    </th>
                    <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Time
                    </th>
                    <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Room
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {#each teacherSchedules as schedule}
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">{schedule.className}</div>
                        <div class="text-sm text-gray-500">{schedule.subject}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{getDayLabel(schedule.dayOfWeek)}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{schedule.startTime} - {schedule.endTime}</div>
                        <div class="text-sm text-gray-500">{schedule.duration} min</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{schedule.roomId}</div>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      </div>
    {:else if activeTab === 'availability'}
      <TeacherAvailabilityForm {teacherId} existingAvailability={teacherAvailability} on:saved={handleAvailabilitySaved} />
    {:else if activeTab === 'upcoming'}
      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <h2 class="mb-4 text-xl font-semibold">Today's Classes</h2>
          {#if upcomingSchedules.length === 0}
            <p class="text-gray-500">No classes scheduled for today.</p>
          {:else}
            <div class="space-y-4">
              {#each upcomingSchedules as schedule}
                <div class="p-4 border border-gray-200 rounded-md">
                  <div class="flex justify-between">
                    <div>
                      <h3 class="text-lg font-medium text-gray-900">{schedule.className}</h3>
                      <p class="text-sm text-gray-500">{schedule.subject}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-gray-900">{schedule.startTime} - {schedule.endTime}</p>
                      <p class="text-sm text-gray-500">Room: {schedule.roomId}</p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div> 