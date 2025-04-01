<!-- src/routes/(app)/admin/availability/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authService } from '$lib/services/auth';
  import { getUsers } from '$lib/services/database';
  import { toastStore } from '$lib/stores/toastStore';
  import type { User, TeacherAvailability } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Calendar, Clock, Save, Plus, X } from 'lucide-svelte';
  import { USER_ROLES } from '$lib/config';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';

  let loading = true;
  let error: string | null = null;
  let teachers: User[] = [];
  let selectedTeacher: User | null = null;
  let availabilityData: TeacherAvailability[] = [];
  let showEditDialog = false;
  let editingSlot: TeacherAvailability | null = null;

  // Define types for DayOfWeek and TimeSlot to match expected types
  type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  type TimeSlot = string; // HH:MM format
  
  // Create a type for new availability slots with minimal required properties
  type NewAvailabilitySlot = Pick<TeacherAvailability, '$id' | 'teacherId' | 'dayOfWeek' | 'startTime' | 'endTime' | 'isAvailable' | 'note'>;
  
  // Demo teacher data
  const demoTeachers: Partial<User>[] = [
    {
      $id: 'demo-teacher-1',
      userId: 'demo-teacher-1',
      name: 'Dr. Robert Smith',
      email: 'robert.smith@example.com',
      role: 'TEACHER' as keyof typeof USER_ROLES,
      isActive: true
    },
    {
      $id: 'demo-teacher-2',
      userId: 'demo-teacher-2',
      name: 'Prof. Jane Johnson',
      email: 'jane.johnson@example.com',
      role: 'TEACHER' as keyof typeof USER_ROLES,
      isActive: true
    },
    {
      $id: 'demo-teacher-3',
      userId: 'demo-teacher-3',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@example.com',
      role: 'TEACHER' as keyof typeof USER_ROLES,
      isActive: true
    },
    {
      $id: 'demo-teacher-4',
      userId: 'demo-teacher-4',
      name: 'Dr. Sarah Williams',
      email: 'sarah.williams@example.com',
      role: 'TEACHER' as keyof typeof USER_ROLES,
      isActive: false
    },
    {
      $id: 'demo-teacher-5',
      userId: 'demo-teacher-5',
      name: 'Prof. David Miller',
      email: 'david.miller@example.com',
      role: 'TEACHER' as keyof typeof USER_ROLES,
      isActive: true
    }
  ];

  // Days of the week for availability display
  const DAYS_OF_WEEK = [
    { value: 'monday' as DayOfWeek, label: 'Monday' },
    { value: 'tuesday' as DayOfWeek, label: 'Tuesday' },
    { value: 'wednesday' as DayOfWeek, label: 'Wednesday' },
    { value: 'thursday' as DayOfWeek, label: 'Thursday' },
    { value: 'friday' as DayOfWeek, label: 'Friday' },
    { value: 'saturday' as DayOfWeek, label: 'Saturday' },
    { value: 'sunday' as DayOfWeek, label: 'Sunday' }
  ];

  // Time slots for availability
  const TIME_SLOTS = [
    { value: '08:00' as TimeSlot, label: '8:00 AM' },
    { value: '09:00' as TimeSlot, label: '9:00 AM' },
    { value: '10:00' as TimeSlot, label: '10:00 AM' },
    { value: '11:00' as TimeSlot, label: '11:00 AM' },
    { value: '12:00' as TimeSlot, label: '12:00 PM' },
    { value: '13:00' as TimeSlot, label: '1:00 PM' },
    { value: '14:00' as TimeSlot, label: '2:00 PM' },
    { value: '15:00' as TimeSlot, label: '3:00 PM' },
    { value: '16:00' as TimeSlot, label: '4:00 PM' },
    { value: '17:00' as TimeSlot, label: '5:00 PM' }
  ];

  // Generate demo availability data for a teacher
  function generateDemoAvailability(teacherId: string): TeacherAvailability[] {
    const availability: any[] = [];
    
    // Generate different availability patterns for each day
    DAYS_OF_WEEK.forEach((day, index) => {
      // Make some teachers unavailable on weekends
      if ((day.value === 'saturday' || day.value === 'sunday') && Math.random() > 0.3) {
        availability.push({
          $id: `avail-${teacherId}-${day.value}`,
          teacherId,
          dayOfWeek: day.value,
          startTime: '08:00',
          endTime: '17:00',
          isAvailable: false,
          note: 'Unavailable on weekends'
        });
        return;
      }
      
      // Morning availability (most teachers available)
      availability.push({
        $id: `avail-${teacherId}-${day.value}-morning`,
        teacherId,
        dayOfWeek: day.value,
        startTime: '08:00',
        endTime: '12:00',
        isAvailable: Math.random() > 0.2, // 80% chance of being available
        note: 'Morning hours'
      });
      
      // Lunch break (most teachers unavailable)
      availability.push({
        $id: `avail-${teacherId}-${day.value}-lunch`,
        teacherId,
        dayOfWeek: day.value,
        startTime: '12:00',
        endTime: '13:00',
        isAvailable: Math.random() > 0.8, // 20% chance of being available
        note: 'Lunch break'
      });
      
      // Afternoon availability (variable)
      availability.push({
        $id: `avail-${teacherId}-${day.value}-afternoon`,
        teacherId,
        dayOfWeek: day.value,
        startTime: '13:00',
        endTime: '17:00',
        isAvailable: Math.random() > 0.4, // 60% chance of being available
        note: 'Afternoon hours'
      });
    });
    
    return availability;
  }

  onMount(async () => {
    await loadTeachers();
  });

  async function loadTeachers() {
    try {
      loading = true;
      error = null;
      const allUsers = await getUsers();
      
      // Filter real users with TEACHER role
      const realTeachers = allUsers.filter(user => user.role === USER_ROLES.TEACHER) as User[];
      
      // Use real teachers if available, otherwise use demo data
      if (realTeachers.length > 0) {
        teachers = realTeachers;
      } else {
        console.log("No real teachers found, using demo data");
        teachers = demoTeachers as User[];
      }
    } catch (err) {
      console.error("Error loading teachers:", err);
      error = err instanceof Error ? err.message : 'Failed to load teachers';
      
      // Fall back to demo data on error
      console.log("Falling back to demo data");
      teachers = demoTeachers as User[];
      
      // Show toast notification but don't break the page
      toastStore.error("Couldn't connect to database. Showing demo data instead.");
    } finally {
      loading = false;
    }
  }

  function handleTeacherSelect(teacher: User) {
    selectedTeacher = teacher;
    // Generate demo availability data for the selected teacher
    availabilityData = generateDemoAvailability(teacher.$id);
  }

  // Helper to find availability for a specific time slot
  function getAvailabilityStatus(day: string, timeSlot: string): boolean {
    if (!availabilityData.length) return false;
    
    const slot = availabilityData.find(a => 
      a.dayOfWeek === day && 
      a.startTime <= timeSlot && 
      a.endTime > timeSlot
    );
    
    return slot ? slot.isAvailable : false;
  }
  
  // Get note for a specific time slot
  function getAvailabilityNote(day: string, timeSlot: string): string {
    if (!availabilityData.length) return '';
    
    const slot = availabilityData.find(a => 
      a.dayOfWeek === day && 
      a.startTime <= timeSlot && 
      a.endTime > timeSlot
    );
    
    return slot?.note || '';
  }

  function openEditDialog(dayOfWeek: string, timeSlot: string) {
    const slot = availabilityData.find(a => 
      a.dayOfWeek === dayOfWeek && 
      a.startTime <= timeSlot && 
      a.endTime > timeSlot
    );
    
    if (slot) {
      editingSlot = { ...slot };
    } else if (selectedTeacher) {
      // Create a new slot if none exists
      // Cast dayOfWeek to DayOfWeek type to satisfy TypeScript
      const dayAsType = dayOfWeek as DayOfWeek;
      const nextTimeSlot = timeSlot === '17:00' 
        ? '18:00' 
        : TIME_SLOTS[TIME_SLOTS.findIndex(t => t.value === timeSlot) + 1]?.value || '18:00';
        
      // Create a new availability slot with the minimal required properties
      const newSlot: NewAvailabilitySlot = {
        $id: `new-${Date.now()}`,
        teacherId: selectedTeacher.$id,
        dayOfWeek: dayAsType,
        startTime: timeSlot,
        endTime: nextTimeSlot,
        isAvailable: true,
        note: ''
      };
      
      // Cast the new slot to TeacherAvailability
      editingSlot = newSlot as TeacherAvailability;
    }
    
    showEditDialog = true;
  }
  
  function handleEditAvailability() {
    if (!selectedTeacher) {
      toastStore.error("Please select a teacher first");
      return;
    }
    
    // Open dialog for batch editing
    editingSlot = null;
    showEditDialog = true;
  }
  
  function saveAvailability() {
    if (editingSlot) {
      // Find and update the existing slot, or add a new one
      const index = availabilityData.findIndex(a => a.$id === editingSlot!.$id);
      
      if (index >= 0) {
        availabilityData[index] = editingSlot;
      } else {
        availabilityData = [...availabilityData, editingSlot];
      }
      
      toastStore.success("Availability updated successfully");
    } else {
      toastStore.success("Availability settings saved");
    }
    
    showEditDialog = false;
    editingSlot = null;
  }
</script>

<div class="container p-6 mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Teacher Availability Management</h1>
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
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="p-4 rounded-lg shadow bg-card">
        <h2 class="mb-4 text-lg font-semibold">Teachers</h2>
        <div class="space-y-2">
          {#each teachers as teacher}
            <button
              class="w-full text-left p-2 rounded hover:bg-muted/50 {selectedTeacher?.$id === teacher.$id ? 'bg-primary/10' : ''}"
              on:click={() => handleTeacherSelect(teacher)}
            >
              <div class="flex items-center">
                <span class="flex-1">{teacher.name}</span>
                <span class="px-2 py-1 text-xs rounded-full {teacher.isActive ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}">
                  {teacher.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </button>
          {:else}
            <div class="p-4 text-center text-muted-foreground">
              No teachers found.
            </div>
          {/each}
        </div>
      </div>

      <div class="p-4 rounded-lg shadow md:col-span-2 bg-card">
        {#if selectedTeacher}
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">{selectedTeacher.name}'s Availability</h2>
            <Button on:click={handleEditAvailability}>
              <Calendar class="w-4 h-4 mr-2" />
              Edit Availability
            </Button>
          </div>
          
          <!-- Availability Table -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th class="p-2 border"></th>
                  {#each DAYS_OF_WEEK as day}
                    <th class="p-2 font-medium text-center border">{day.label}</th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each TIME_SLOTS as timeSlot}
                  <tr>
                    <td class="p-2 font-medium border">{timeSlot.label}</td>
                    {#each DAYS_OF_WEEK as day}
                      {@const isAvailable = getAvailabilityStatus(day.value, timeSlot.value)}
                      {@const note = getAvailabilityNote(day.value, timeSlot.value)}
                      <td 
                        class="p-2 border text-center {isAvailable ? 'bg-success/15' : 'bg-destructive/15'} cursor-pointer hover:opacity-80"
                        title={note}
                        on:click={() => openEditDialog(day.value, timeSlot.value)}
                      >
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          
          <div class="flex items-center gap-4 mt-4 text-sm">
            <div class="flex items-center">
              <div class="w-4 h-4 mr-2 bg-success/15"></div>
              <span>Available</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 mr-2 bg-destructive/15"></div>
              <span>Unavailable</span>
            </div>
            <div class="flex-1 text-xs italic text-right text-muted-foreground">
              Hover over cells to see notes
            </div>
          </div>
          
        {:else}
          <div class="p-10 text-center text-muted-foreground">
            Select a teacher to view and manage their availability.
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Add Availability Editing Dialog -->
<Dialog bind:open={showEditDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        {editingSlot ? `Edit ${DAYS_OF_WEEK.find(d => d.value === editingSlot?.dayOfWeek)?.label || ''} Availability` : "Edit Availability Schedule"}
      </DialogTitle>
      <DialogDescription>
        {editingSlot 
          ? `Update availability for ${TIME_SLOTS.find(t => t.value === editingSlot?.startTime)?.label || ''} - ${TIME_SLOTS.find(t => t.value === editingSlot?.endTime)?.label || ''}` 
          : "Manage teacher's availability across the week"
        }
      </DialogDescription>
    </DialogHeader>
    
    {#if editingSlot}
      <div class="space-y-4">
        <div class="flex items-center gap-4">
          <span class="w-24">Status:</span>
          <label class="flex items-center gap-2">
            <input type="radio" bind:group={editingSlot.isAvailable} value={true} />
            <span class="text-success">Available</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" bind:group={editingSlot.isAvailable} value={false} />
            <span class="text-destructive">Unavailable</span>
          </label>
        </div>
        
        <div class="flex items-center gap-4">
          <span class="w-24">Note:</span>
          <input 
            type="text" 
            class="flex-1 p-2 border rounded" 
            bind:value={editingSlot.note} 
            placeholder="Add a note (optional)"
          />
        </div>
      </div>
    {:else}
      <div class="py-6 text-center text-muted-foreground">
        <p>Click on any time slot in the table to edit specific availability.</p>
        <p class="mt-2">Or use the buttons below to set availability for the entire schedule.</p>
        
        <div class="flex justify-center gap-4 mt-4">
          <Button variant="outline" on:click={() => {
            // Make all slots available
            availabilityData = availabilityData.map(slot => ({
              ...slot,
              isAvailable: true
            }));
            toastStore.success("All slots set to available");
          }}>
            Set All Available
          </Button>
          
          <Button variant="outline" on:click={() => {
            // Make all slots unavailable
            availabilityData = availabilityData.map(slot => ({
              ...slot,
              isAvailable: false
            }));
            toastStore.success("All slots set to unavailable");
          }}>
            Set All Unavailable
          </Button>
        </div>
      </div>
    {/if}
    
    <DialogFooter>
      <Button variant="outline" on:click={() => {
        showEditDialog = false;
        editingSlot = null;
      }}>
        Cancel
      </Button>
      <Button on:click={saveAvailability}>
        <Save class="w-4 h-4 mr-2" />
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog> 