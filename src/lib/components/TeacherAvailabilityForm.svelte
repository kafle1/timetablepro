<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { teacherAvailabilityService } from '$lib/services/teacher-availability';
  import type { TeacherAvailability } from '$lib/types';
  import { TIME_SLOTS, DAYS_OF_WEEK } from '$lib/config/constants';
  
  export let teacherId: string;
  export let existingAvailability: TeacherAvailability[] = [];
  
  const dispatch = createEventDispatcher();
  
  let loading = false;
  let error = '';
  let success = '';
  
  // Initialize availability grid
  let availabilityGrid: Record<string, Record<string, boolean>> = {};
  
  // Initialize notes for each day and time slot
  let notes: Record<string, Record<string, string>> = {};
  
  onMount(async () => {
    initializeGrid();
    
    if (teacherId) {
      await loadTeacherAvailability();
    }
  });
  
  // Initialize the grid with default values (all available)
  function initializeGrid() {
    DAYS_OF_WEEK.forEach((day: { value: string; label: string }) => {
      availabilityGrid[day.value] = {};
      notes[day.value] = {};
      
      TIME_SLOTS.forEach((slot: { value: string; label: string }) => {
        availabilityGrid[day.value][slot.value] = true;
        notes[day.value][slot.value] = '';
      });
    });
  }
  
  // Load teacher's availability from the database
  async function loadTeacherAvailability() {
    loading = true;
    error = '';
    
    try {
      const response = await teacherAvailabilityService.getTeacherAvailability(teacherId);
      
      if (response.documents.length > 0) {
        // Reset grid to default (all available)
        initializeGrid();
        
        // Update grid with teacher's availability
        response.documents.forEach((availability: any) => {
          const { dayOfWeek, startTime, endTime, isAvailable, note } = availability;
          
          // Find all time slots that fall within this availability record
          TIME_SLOTS.forEach((slot: { value: string; label: string }) => {
            if (slot.value >= startTime && slot.value < endTime) {
              availabilityGrid[dayOfWeek][slot.value] = isAvailable;
              notes[dayOfWeek][slot.value] = note || '';
            }
          });
        });
        
        existingAvailability = response.documents as TeacherAvailability[];
      }
    } catch (err: any) {
      error = err.message || 'Failed to load teacher availability';
      console.error('Error loading teacher availability:', err);
    } finally {
      loading = false;
    }
  }
  
  // Save teacher's availability
  async function saveAvailability() {
    loading = true;
    error = '';
    success = '';
    
    try {
      // Convert grid to availability records
      const availabilityRecords: Array<{
        teacherId: string;
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        isAvailable: boolean;
        note: string;
      }> = [];
      
      DAYS_OF_WEEK.forEach((day: { value: string; label: string }) => {
        let currentStatus = availabilityGrid[day.value][TIME_SLOTS[0].value];
        let startTime = TIME_SLOTS[0].value;
        let currentNote = notes[day.value][TIME_SLOTS[0].value];
        
        // Group consecutive slots with the same availability status
        for (let i = 1; i <= TIME_SLOTS.length; i++) {
          const isLastSlot = i === TIME_SLOTS.length;
          const currentSlot = isLastSlot ? TIME_SLOTS[TIME_SLOTS.length - 1].value : TIME_SLOTS[i].value;
          const nextStatus = isLastSlot ? !currentStatus : availabilityGrid[day.value][currentSlot];
          const nextNote = isLastSlot ? '' : notes[day.value][currentSlot];
          
          // If status changes or note changes or it's the last slot, create a record
          if (nextStatus !== currentStatus || nextNote !== currentNote || isLastSlot) {
            availabilityRecords.push({
              teacherId,
              dayOfWeek: day.value,
              startTime,
              endTime: isLastSlot ? TIME_SLOTS[TIME_SLOTS.length - 1].value + ':00' : currentSlot,
              isAvailable: currentStatus,
              note: currentNote
            });
            
            if (!isLastSlot) {
              startTime = currentSlot;
              currentStatus = nextStatus;
              currentNote = nextNote;
            }
          }
        }
      });
      
      // Save to database
      await teacherAvailabilityService.setBulkAvailability(teacherId, availabilityRecords);
      
      success = 'Availability saved successfully';
      dispatch('saved');
    } catch (err: any) {
      error = err.message || 'Failed to save teacher availability';
      console.error('Error saving teacher availability:', err);
    } finally {
      loading = false;
    }
  }
  
  // Toggle availability for a specific time slot
  function toggleAvailability(day: string, timeSlot: string) {
    availabilityGrid[day][timeSlot] = !availabilityGrid[day][timeSlot];
  }
  
  // Set all slots for a day to available or unavailable
  function setDayAvailability(day: string, isAvailable: boolean) {
    TIME_SLOTS.forEach((slot: { value: string; label: string }) => {
      availabilityGrid[day][slot.value] = isAvailable;
    });
  }
  
  // Set all slots for a time across all days to available or unavailable
  function setTimeAvailability(timeSlot: string, isAvailable: boolean) {
    DAYS_OF_WEEK.forEach((day: { value: string; label: string }) => {
      availabilityGrid[day.value][timeSlot] = isAvailable;
    });
  }
  
  // Add or update a note for a specific time slot
  function updateNote(day: string, timeSlot: string, note: string) {
    notes[day][timeSlot] = note;
  }
  
  // Handle input event for note updates
  function handleNoteInput(event: Event, day: string, timeSlot: string) {
    const target = event.target as HTMLInputElement;
    updateNote(day, timeSlot, target.value);
  }
</script>

<div class="p-4 bg-white rounded-lg shadow">
  <h2 class="mb-4 text-xl font-semibold">Teacher Availability</h2>
  
  {#if error}
    <div class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
      {error}
    </div>
  {/if}
  
  {#if success}
    <div class="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md">
      {success}
    </div>
  {/if}
  
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
            Time / Day
          </th>
          {#each DAYS_OF_WEEK as day}
            <th scope="col" class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
              {day.label}
              <div class="mt-1">
                <button 
                  type="button" 
                  class="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600"
                  on:click={() => setDayAvailability(day.value, true)}
                >
                  All Available
                </button>
                <button 
                  type="button" 
                  class="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                  on:click={() => setDayAvailability(day.value, false)}
                >
                  All Unavailable
                </button>
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each TIME_SLOTS as timeSlot}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{timeSlot.label}</div>
              <div class="mt-1">
                <button 
                  type="button" 
                  class="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600"
                  on:click={() => setTimeAvailability(timeSlot.value, true)}
                >
                  All Available
                </button>
                <button 
                  type="button" 
                  class="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                  on:click={() => setTimeAvailability(timeSlot.value, false)}
                >
                  All Unavailable
                </button>
              </div>
            </td>
            {#each DAYS_OF_WEEK as day}
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <button 
                    type="button" 
                    class={`px-4 py-2 text-sm font-medium text-white rounded-md ${availabilityGrid[day.value][timeSlot.value] ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                    on:click={() => toggleAvailability(day.value, timeSlot.value)}
                  >
                    {availabilityGrid[day.value][timeSlot.value] ? 'Available' : 'Unavailable'}
                  </button>
                </div>
                <div class="mt-2">
                  <input 
                    type="text" 
                    placeholder="Add note" 
                    class="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    value={notes[day.value][timeSlot.value]}
                    on:input={(e) => handleNoteInput(e, day.value, timeSlot.value)}
                  />
                </div>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  <div class="flex justify-end mt-4">
    <button 
      type="button" 
      class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      on:click={saveAvailability}
      disabled={loading}
    >
      {#if loading}
        <svg class="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Saving...
      {:else}
        Save Availability
      {/if}
    </button>
  </div>
</div> 