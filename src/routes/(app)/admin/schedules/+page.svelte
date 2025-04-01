<!-- src/routes/(app)/admin/schedules/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { scheduleService } from '$lib/services/schedule';
  import { roomService } from '$lib/services/room';
  import { authService } from '$lib/services/auth';
  import { USER_ROLES } from '$lib/config';
  import type { Schedule, Room, User } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Calendar, Edit, Trash2, Search, X } from 'lucide-svelte';
  import { toastStore } from '$lib/stores/toastStore';

  let loading = true;
  let error: string | null = null;
  let schedules: Schedule[] = [];
  let filteredSchedules: Schedule[] = [];
  let rooms: Room[] = [];
  let teachers: User[] = [];
  let showAddDialog = false;
  let editingSchedule: Schedule | null = null;
  
  // Filter state
  let subjectFilter = '';
  let classNameFilter = '';
  let teacherFilter = '';
  
  let formData = {
    className: '',
    subject: '',
    teacherId: '',
    roomId: '',
    startTime: '',
    endTime: '',
    duration: 60,
    dayOfWeek: 'monday',
    recurrence: 'once'
  };

  // Demo data objects with partial types that include required fields
  type DemoSchedule = Pick<Schedule, '$id' | 'className' | 'subject' | 'teacherId' | 'roomId' | 'startTime' | 'endTime' | 'duration' | 'dayOfWeek' | 'recurrence'> & {
    teacherName: string;
    roomName: string;
  };

  type DemoRoom = Pick<Room, '$id' | 'name'> & {
    capacity: number;
    building: string;
  };

  type DemoTeacher = Pick<User, '$id' | 'name' | 'email' | 'role'>;

  // Demo data that will be shown automatically
  const demoSchedules: DemoSchedule[] = [
    {
      $id: 'demo-1',
      className: 'Mathematics 101',
      subject: 'Algebra',
      teacherId: 'teacher-1',
      roomId: 'room-1',
      startTime: '2023-09-04T09:00:00.000Z',
      endTime: '2023-09-04T10:30:00.000Z',
      duration: 90,
      dayOfWeek: 'monday',
      recurrence: 'weekly',
      teacherName: 'Dr. Smith',
      roomName: 'Room 101'
    },
    {
      $id: 'demo-2',
      className: 'Physics 201',
      subject: 'Mechanics',
      teacherId: 'teacher-2',
      roomId: 'room-2',
      startTime: '2023-09-05T11:00:00.000Z',
      endTime: '2023-09-05T12:30:00.000Z',
      duration: 90,
      dayOfWeek: 'tuesday',
      recurrence: 'weekly',
      teacherName: 'Prof. Johnson',
      roomName: 'Lab 202'
    },
    {
      $id: 'demo-3',
      className: 'Computer Science 303',
      subject: 'Data Structures',
      teacherId: 'teacher-3',
      roomId: 'room-3',
      startTime: '2023-09-06T14:00:00.000Z',
      endTime: '2023-09-06T15:30:00.000Z',
      duration: 90,
      dayOfWeek: 'wednesday',
      recurrence: 'weekly',
      teacherName: 'Dr. Chen',
      roomName: 'Computer Lab 305'
    },
    {
      $id: 'demo-4',
      className: 'Chemistry 101',
      subject: 'Organic Chemistry',
      teacherId: 'teacher-2',
      roomId: 'room-4',
      startTime: '2023-09-07T09:30:00.000Z',
      endTime: '2023-09-07T11:00:00.000Z',
      duration: 90,
      dayOfWeek: 'thursday',
      recurrence: 'weekly',
      teacherName: 'Prof. Johnson',
      roomName: 'Chemistry Lab'
    },
    {
      $id: 'demo-5',
      className: 'Biology 202',
      subject: 'Genetics',
      teacherId: 'teacher-1',
      roomId: 'room-5',
      startTime: '2023-09-08T13:00:00.000Z',
      endTime: '2023-09-08T14:30:00.000Z',
      duration: 90,
      dayOfWeek: 'friday',
      recurrence: 'weekly',
      teacherName: 'Dr. Smith',
      roomName: 'Biology Lab'
    }
  ];

  // Demo room and teacher data
  const demoRooms: DemoRoom[] = [
    { $id: 'room-1', name: 'Room 101', capacity: 30, building: 'Science Building' },
    { $id: 'room-2', name: 'Lab 202', capacity: 25, building: 'Science Building' },
    { $id: 'room-3', name: 'Computer Lab 305', capacity: 40, building: 'Technology Building' },
    { $id: 'room-4', name: 'Chemistry Lab', capacity: 20, building: 'Science Building' },
    { $id: 'room-5', name: 'Biology Lab', capacity: 24, building: 'Science Building' }
  ];

  const demoTeachers: DemoTeacher[] = [
    { $id: 'teacher-1', name: 'Dr. Smith', email: 'smith@example.com', role: USER_ROLES.TEACHER },
    { $id: 'teacher-2', name: 'Prof. Johnson', email: 'johnson@example.com', role: USER_ROLES.TEACHER },
    { $id: 'teacher-3', name: 'Dr. Chen', email: 'chen@example.com', role: USER_ROLES.TEACHER }
  ];

  // Apply filters to schedules whenever schedules or filter values change
  $: filteredSchedules = filterSchedules(schedules, {
    subject: subjectFilter,
    className: classNameFilter,
    teacher: teacherFilter
  });

  function filterSchedules(schedules: Schedule[], filters: { subject: string, className: string, teacher: string }) {
    return schedules.filter(schedule => {
      // Get teacher name either from schedule.teacherName or by finding in teachers array
      const teacherName = (schedule as any).teacherName || 
                          teachers.find(t => t.$id === schedule.teacherId)?.name || '';
      
      return (
        // Check if subject matches filter (case insensitive)
        (!filters.subject || schedule.subject.toLowerCase().includes(filters.subject.toLowerCase())) &&
        // Check if class name matches filter (case insensitive)
        (!filters.className || schedule.className.toLowerCase().includes(filters.className.toLowerCase())) &&
        // Check if teacher name matches filter (case insensitive)
        (!filters.teacher || teacherName.toLowerCase().includes(filters.teacher.toLowerCase()))
      );
    });
  }

  function clearFilters() {
    subjectFilter = '';
    classNameFilter = '';
    teacherFilter = '';
  }

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    loading = true;
    error = null;
    try {
      const [schedulesData, roomsData, usersData] = await Promise.all([
        scheduleService.listSchedules(),
        roomService.list(),
        authService.getUsers()
      ]);
      
      // Try to get real data from services
      let realSchedules = (schedulesData?.documents || []) as Schedule[];
      rooms = (roomsData?.documents || []) as Room[];
      const allUsers = (usersData || []) as User[];
      teachers = allUsers.filter(user => user.role === USER_ROLES.TEACHER);

      // If we got real data, use it
      if (realSchedules.length > 0) {
        schedules = realSchedules;
      } else {
        // Otherwise use demo data
        console.log("No schedules found, using demo data instead");
        schedules = demoSchedules as unknown as Schedule[];
        
        // If we don't have real rooms/teachers, use demo data for those too
        if (rooms.length === 0) {
          rooms = demoRooms as unknown as Room[];
        }
        if (teachers.length === 0) {
          teachers = demoTeachers as unknown as User[];
        }
      }
    } catch (err: any) {
      // If we get an error (like auth error), fall back to demo data
      console.error("Load Data Error:", err);
      error = "Failed to load real data. Showing demo data instead.";
      schedules = demoSchedules as unknown as Schedule[];
      rooms = demoRooms as unknown as Room[];
      teachers = demoTeachers as unknown as User[];
    } finally {
      loading = false;
    }
  }

  function resetFormData() {
    formData = {
      className: '',
      subject: '',
      teacherId: '',
      roomId: '',
      startTime: '',
      endTime: '',
      duration: 60,
      dayOfWeek: 'monday',
      recurrence: 'once'
    };
  }

  function handleAddSchedule() {
    editingSchedule = null;
    resetFormData();
    showAddDialog = true;
  }

  function handleEditSchedule(schedule: Schedule) {
    editingSchedule = schedule;
    formData = {
      className: schedule.className || '',
      subject: schedule.subject || '',
      teacherId: schedule.teacherId || '',
      roomId: schedule.roomId || '',
      startTime: schedule.startTime ? formatTimeForInput(schedule.startTime) : '',
      endTime: schedule.endTime ? formatTimeForInput(schedule.endTime) : '',
      duration: schedule.duration || 60,
      dayOfWeek: schedule.dayOfWeek?.toLowerCase() || 'monday',
      recurrence: schedule.recurrence?.toLowerCase() || 'once'
    };
    showAddDialog = true;
  }

  // Helper to format ISO string to HH:MM for input
  function formatTimeForInput(isoTime: string): string {
    try {
      const date = new Date(isoTime);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  }

  // Helper to format HH:MM to ISO string
  function formatTimeFromInput(timeString: string): string {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  }

  async function handleDeleteSchedule(scheduleId: string) {
    if (!scheduleId) return;
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await scheduleService.deleteSchedule(scheduleId);
      await loadData();
      toastStore.success('Schedule deleted successfully');
    } catch (err: any) {
      error = err instanceof Error ? err.message : 'Failed to delete schedule';
      toastStore.error(error);
      console.error("Delete Error:", error);
    }
  }

  async function handleSubmit() {
    if (!formData.className || !formData.subject || !formData.teacherId || !formData.roomId || !formData.startTime || !formData.endTime) {
      toastStore.error('Please fill all required fields.');
      return;
    }

    try {
      // Convert time strings to ISO format
      const payload = {
        ...formData,
        startTime: formatTimeFromInput(formData.startTime),
        endTime: formatTimeFromInput(formData.endTime),
        duration: Number(formData.duration) || 60
      };

      if (editingSchedule && editingSchedule.$id) {
        await scheduleService.updateSchedule(editingSchedule.$id, payload as any);
        toastStore.success('Schedule updated successfully');
      } else {
        await scheduleService.createSchedule(payload as any);
        toastStore.success('Schedule created successfully');
      }
      showAddDialog = false;
      await loadData();
    } catch (err: any) {
      error = err instanceof Error ? err.message : 'Failed to save schedule';
      toastStore.error(error);
      console.error("Submit Error:", err);
    }
  }
</script>

<div id="schedule-container" class="container p-6 mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Schedule Management</h1>
    <div class="flex gap-2">
      <Button on:click={handleAddSchedule}>
        <Calendar class="w-4 h-4 mr-2" />
        Add Schedule
      </Button>
    </div>
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
    <!-- Filter Section -->
    <div class="p-4 mb-4 rounded-lg shadow bg-card">
      <div class="flex items-center mb-2">
        <Search class="w-4 h-4 mr-2 text-muted-foreground" />
        <span class="font-medium">Filter Schedules</span>
        {#if subjectFilter || classNameFilter || teacherFilter}
          <button 
            class="flex items-center ml-auto text-sm text-muted-foreground hover:text-foreground"
            on:click={clearFilters}
          >
            <X class="w-3 h-3 mr-1" />
            Clear
          </button>
        {/if}
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <div>
          <label for="classNameFilter" class="block mb-1 text-xs font-medium text-muted-foreground">Class Name</label>
          <input 
            id="classNameFilter" 
            type="text" 
            bind:value={classNameFilter}
            placeholder="Filter by class name..." 
            class="w-full p-2 text-sm border rounded bg-input text-foreground" 
          />
        </div>
        <div>
          <label for="subjectFilter" class="block mb-1 text-xs font-medium text-muted-foreground">Subject</label>
          <input 
            id="subjectFilter" 
            type="text" 
            bind:value={subjectFilter}
            placeholder="Filter by subject..." 
            class="w-full p-2 text-sm border rounded bg-input text-foreground" 
          />
        </div>
        <div>
          <label for="teacherFilter" class="block mb-1 text-xs font-medium text-muted-foreground">Teacher</label>
          <input 
            id="teacherFilter" 
            type="text" 
            bind:value={teacherFilter}
            placeholder="Filter by teacher..." 
            class="w-full p-2 text-sm border rounded bg-input text-foreground" 
          />
        </div>
      </div>
    </div>

    <div class="rounded-lg shadow bg-card">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="px-6 py-3 text-sm font-medium text-left text-muted-foreground">Class</th>
              <th class="px-6 py-3 text-sm font-medium text-left text-muted-foreground">Subject</th>
              <th class="px-6 py-3 text-sm font-medium text-left text-muted-foreground">Teacher</th>
              <th class="px-6 py-3 text-sm font-medium text-left text-muted-foreground">Room</th>
              <th class="px-6 py-3 text-sm font-medium text-left text-muted-foreground">Time</th>
              <th class="px-6 py-3 text-sm font-medium text-left text-muted-foreground">Day</th>
              <th class="px-6 py-3 text-sm font-medium text-left text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredSchedules as schedule (schedule.$id)}
              <tr class="border-b hover:bg-muted/50">
                <td class="px-6 py-4">{schedule.className}</td>
                <td class="px-6 py-4">{schedule.subject}</td>
                <td class="px-6 py-4">
                  {(schedule as any).teacherName || teachers.find(t => t.$id === schedule.teacherId)?.name || 'N/A'}
                </td>
                <td class="px-6 py-4">
                  {(schedule as any).roomName || rooms.find(r => r.$id === schedule.roomId)?.name || 'N/A'}
                </td>
                <td class="px-6 py-4">
                  {formatTimeForInput(schedule.startTime)} - {formatTimeForInput(schedule.endTime)}
                </td>
                <td class="px-6 py-4">{schedule.dayOfWeek}</td>
                <td class="px-6 py-4">
                  <div class="flex space-x-2">
                    <Button variant="outline" size="sm" on:click={() => handleEditSchedule(schedule)} title="Edit">
                      <Edit class="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" on:click={() => handleDeleteSchedule(schedule.$id)} title="Delete">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="7" class="py-10 text-center text-muted-foreground">
                  {#if subjectFilter || classNameFilter || teacherFilter}
                    No schedules match the current filters.
                  {:else}
                    No schedules found.
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  {#if showAddDialog}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-card p-6 rounded-lg w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 class="mb-4 text-xl font-bold">
          {editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}
        </h2>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div>
            <label for="className" class="block mb-1 text-sm font-medium">Class Name</label>
            <input id="className" type="text" bind:value={formData.className} class="w-full p-2 border rounded bg-input text-foreground" required />
          </div>
          <div>
            <label for="subject" class="block mb-1 text-sm font-medium">Subject</label>
            <input id="subject" type="text" bind:value={formData.subject} class="w-full p-2 border rounded bg-input text-foreground" required />
          </div>
          <div>
            <label for="teacher" class="block mb-1 text-sm font-medium">Teacher</label>
            <select id="teacher" bind:value={formData.teacherId} class="w-full p-2 border rounded bg-input text-foreground" required>
              <option value="">Select a teacher</option>
              {#each teachers as teacher (teacher.$id)}
                <option value={teacher.$id}>{teacher.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label for="room" class="block mb-1 text-sm font-medium">Room</label>
            <select id="room" bind:value={formData.roomId} class="w-full p-2 border rounded bg-input text-foreground" required>
              <option value="">Select a room</option>
              {#each rooms as room (room.$id)}
                <option value={room.$id}>{room.name}</option>
              {/each}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="startTime" class="block mb-1 text-sm font-medium">Start Time</label>
              <input id="startTime" type="time" bind:value={formData.startTime} class="w-full p-2 border rounded bg-input text-foreground" required />
            </div>
            <div>
              <label for="endTime" class="block mb-1 text-sm font-medium">End Time</label>
              <input id="endTime" type="time" bind:value={formData.endTime} class="w-full p-2 border rounded bg-input text-foreground" required />
            </div>
          </div>
          <div>
            <label for="duration" class="block mb-1 text-sm font-medium">Duration (minutes)</label>
            <input id="duration" type="number" bind:value={formData.duration} class="w-full p-2 border rounded bg-input text-foreground" min="1" />
          </div>
          <div>
            <label for="dayOfWeek" class="block mb-1 text-sm font-medium">Day of Week</label>
            <select id="dayOfWeek" bind:value={formData.dayOfWeek} class="w-full p-2 border rounded bg-input text-foreground" required>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
          <div>
            <label for="recurrence" class="block mb-1 text-sm font-medium">Recurrence</label>
            <select id="recurrence" bind:value={formData.recurrence} class="w-full p-2 border rounded bg-input text-foreground" required>
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div class="flex justify-end pt-4 space-x-2">
            <Button type="button" variant="outline" on:click={() => { showAddDialog = false; editingSchedule = null; }}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div> 