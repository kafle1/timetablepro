<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { scheduleService } from '$lib/services/schedule';
  import { roomService } from '$lib/services/room';
  import { authService } from '$lib/services/auth';
  import type { Schedule, Room, User } from '$lib/types';
  import { DAYS_OF_WEEK, CONFLICT_STATUS, USER_ROLES } from '$lib/config/constants';
  
  export let teacherId: string = '';
  export let roomId: string = '';
  export let dayOfWeek: string = '';
  export let showFilters: boolean = true;
  
  const dispatch = createEventDispatcher();
  
  let schedules: Schedule[] = [];
  let rooms: Room[] = [];
  let teachers: User[] = [];
  let loading = true;
  let error = '';
  
  // Filter states
  let selectedTeacherId = teacherId;
  let selectedRoomId = roomId;
  let selectedDayOfWeek = dayOfWeek;
  
  onMount(async () => {
    try {
      // Load rooms and teachers for filters
      const [roomsResponse, teachersResponse] = await Promise.all([
        roomService.list(),
        authService.getUsers()
      ]);
      
      rooms = roomsResponse.documents as Room[];
      teachers = teachersResponse.filter(user => user.role === USER_ROLES.TEACHER) as User[];
      
      // Load schedules with initial filters
      await loadSchedules();
    } catch (err: any) {
      error = err.message || 'Failed to load data';
      console.error('Error loading data:', err);
    } finally {
      loading = false;
    }
  });
  
  async function loadSchedules() {
    loading = true;
    error = '';
    
    try {
      const filters: Record<string, string> = {};
      
      if (selectedTeacherId) {
        filters.teacherId = selectedTeacherId;
      }
      
      if (selectedRoomId) {
        filters.roomId = selectedRoomId;
      }
      
      if (selectedDayOfWeek) {
        filters.dayOfWeek = selectedDayOfWeek;
      }
      
      const response = await scheduleService.listSchedules(filters);
      schedules = response.documents as Schedule[];
    } catch (err: any) {
      error = err.message || 'Failed to load schedules';
      console.error('Error loading schedules:', err);
    } finally {
      loading = false;
    }
  }
  
  function handleEdit(schedule: Schedule) {
    dispatch('edit', schedule);
  }
  
  async function handleDelete(schedule: Schedule) {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      await scheduleService.deleteSchedule(schedule.$id);
      schedules = schedules.filter(s => s.$id !== schedule.$id);
    } catch (err: any) {
      error = err.message || 'Failed to delete schedule';
      console.error('Error deleting schedule:', err);
    } finally {
      loading = false;
    }
  }
  
  function getTeacherName(teacherId: string): string {
    const teacher = teachers.find(t => t.$id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  }
  
  function getRoomName(roomId: string): string {
    const room = rooms.find(r => r.$id === roomId);
    return room ? room.roomName : 'Unknown Room';
  }
  
  function getDayLabel(dayValue: string): string {
    const day = DAYS_OF_WEEK.find(d => d.value === dayValue);
    return day ? day.label : dayValue;
  }
  
  function getConflictStatusClass(status: string): string {
    switch (status) {
      case CONFLICT_STATUS.CONFLICT:
        return 'bg-red-100 text-red-800';
      case CONFLICT_STATUS.WARNING:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  }
  
  function resetFilters() {
    selectedTeacherId = '';
    selectedRoomId = '';
    selectedDayOfWeek = '';
    loadSchedules();
  }
</script>

<div class="bg-white rounded-lg shadow">
  {#if showFilters}
    <div class="p-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">Filters</h3>
      <div class="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-3">
        <div>
          <label for="teacher" class="block text-sm font-medium text-gray-700">Teacher</label>
          <select
            id="teacher"
            bind:value={selectedTeacherId}
            on:change={loadSchedules}
            class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Teachers</option>
            {#each teachers as teacher}
              <option value={teacher.$id}>{teacher.name}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <label for="room" class="block text-sm font-medium text-gray-700">Room</label>
          <select
            id="room"
            bind:value={selectedRoomId}
            on:change={loadSchedules}
            class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Rooms</option>
            {#each rooms as room}
              <option value={room.$id}>{room.roomName}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <label for="day" class="block text-sm font-medium text-gray-700">Day</label>
          <select
            id="day"
            bind:value={selectedDayOfWeek}
            on:change={loadSchedules}
            class="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">All Days</option>
            {#each DAYS_OF_WEEK as day}
              <option value={day.value}>{day.label}</option>
            {/each}
          </select>
        </div>
      </div>
      
      <div class="flex justify-end mt-4">
        <button
          type="button"
          on:click={resetFilters}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset Filters
        </button>
      </div>
    </div>
  {/if}
  
  {#if error}
    <div class="p-4 text-sm text-red-700 bg-red-100 rounded-md">
      {error}
    </div>
  {/if}
  
  <div class="overflow-x-auto">
    {#if loading}
      <div class="flex items-center justify-center p-8">
        <svg class="w-8 h-8 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    {:else if schedules.length === 0}
      <div class="p-8 text-center text-gray-500">
        No schedules found. Try adjusting your filters or create a new schedule.
      </div>
    {:else}
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Class
            </th>
            <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Teacher
            </th>
            <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Room
            </th>
            <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Day
            </th>
            <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Time
            </th>
            <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each schedules as schedule}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{schedule.className}</div>
                <div class="text-sm text-gray-500">{schedule.subject}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{getTeacherName(schedule.teacherId)}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{getRoomName(schedule.roomId)}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{getDayLabel(schedule.dayOfWeek)}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{schedule.startTime} - {schedule.endTime}</div>
                <div class="text-sm text-gray-500">{schedule.duration} min</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getConflictStatusClass(schedule.conflictStatus || CONFLICT_STATUS.NONE)}`}>
                  {schedule.conflictStatus || CONFLICT_STATUS.NONE}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                <button
                  type="button"
                  on:click={() => handleEdit(schedule)}
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button
                  type="button"
                  on:click={() => handleDelete(schedule)}
                  class="ml-4 text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div> 