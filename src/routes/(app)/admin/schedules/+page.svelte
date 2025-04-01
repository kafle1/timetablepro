<!-- src/routes/(app)/admin/schedules/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { scheduleService } from '$lib/services/schedule';
  import { roomService } from '$lib/services/room';
  import { userService } from '$lib/services/user';
  import { toastStore } from '$lib/stores/toastStore';
  import type { Schedule, Room, User } from '$lib/types';
  import { Button } from '$lib/components/ui/button';
  import { Calendar } from 'lucide-svelte';

  let loading = true;
  let error: string | null = null;
  let schedules: Schedule[] = [];
  let rooms: Room[] = [];
  let teachers: User[] = [];
  let showAddDialog = false;
  let editingSchedule: Schedule | null = null;
  let newSchedule = {
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

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      loading = true;
      error = null;
      const [schedulesData, roomsData, teachersData] = await Promise.all([
        scheduleService.listSchedules(),
        roomService.listRooms(),
        userService.listTeachers()
      ]);
      schedules = schedulesData;
      rooms = roomsData;
      teachers = teachersData;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load data';
      toastStore.add({
        type: 'error',
        message: error
      });
    } finally {
      loading = false;
    }
  }

  function handleAddSchedule() {
    editingSchedule = null;
    newSchedule = {
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
    showAddDialog = true;
  }

  function handleEditSchedule(schedule: Schedule) {
    editingSchedule = schedule;
    newSchedule = { ...schedule };
    showAddDialog = true;
  }

  async function handleDeleteSchedule(schedule: Schedule) {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await scheduleService.deleteSchedule(schedule.$id);
      schedules = schedules.filter(s => s.$id !== schedule.$id);
      toastStore.add({
        type: 'success',
        message: 'Schedule deleted successfully'
      });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to delete schedule';
      toastStore.add({
        type: 'error',
        message: error
      });
    }
  }

  async function handleSubmit() {
    try {
      if (editingSchedule) {
        await scheduleService.updateSchedule(editingSchedule.$id, newSchedule);
        schedules = schedules.map(s => 
          s.$id === editingSchedule.$id ? { ...s, ...newSchedule } : s
        );
        toastStore.add({
          type: 'success',
          message: 'Schedule updated successfully'
        });
      } else {
        const created = await scheduleService.createSchedule(newSchedule);
        schedules = [...schedules, created];
        toastStore.add({
          type: 'success',
          message: 'Schedule created successfully'
        });
      }
      showAddDialog = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to save schedule';
      toastStore.add({
        type: 'error',
        message: error
      });
    }
  }
</script>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Schedule Management</h1>
    <Button on:click={handleAddSchedule}>
      <Calendar class="w-4 h-4 mr-2" />
      Add Schedule
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
              <th class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Class</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Subject</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Teacher</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Room</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Time</th>
              <th class="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each schedules as schedule}
              <tr class="border-b hover:bg-muted/50">
                <td class="px-6 py-4">{schedule.className}</td>
                <td class="px-6 py-4">{schedule.subject}</td>
                <td class="px-6 py-4">
                  {teachers.find(t => t.$id === schedule.teacherId)?.name || 'Unknown'}
                </td>
                <td class="px-6 py-4">
                  {rooms.find(r => r.$id === schedule.roomId)?.roomName || 'Unknown'}
                </td>
                <td class="px-6 py-4">
                  {schedule.startTime} - {schedule.endTime}
                </td>
                <td class="px-6 py-4">
                  <div class="flex space-x-2">
                    <Button variant="outline" size="sm" on:click={() => handleEditSchedule(schedule)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" on:click={() => handleDeleteSchedule(schedule)}>
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
          {editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
        </h2>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Class Name</label>
            <input
              type="text"
              bind:value={newSchedule.className}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              bind:value={newSchedule.subject}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Teacher</label>
            <select
              bind:value={newSchedule.teacherId}
              class="w-full p-2 border rounded"
              required
            >
              <option value="">Select a teacher</option>
              {#each teachers as teacher}
                <option value={teacher.$id}>{teacher.name}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Room</label>
            <select
              bind:value={newSchedule.roomId}
              class="w-full p-2 border rounded"
              required
            >
              <option value="">Select a room</option>
              {#each rooms as room}
                <option value={room.$id}>{room.roomName}</option>
              {/each}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              bind:value={newSchedule.startTime}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">End Time</label>
            <input
              type="time"
              bind:value={newSchedule.endTime}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Day of Week</label>
            <select
              bind:value={newSchedule.dayOfWeek}
              class="w-full p-2 border rounded"
              required
            >
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
            <label class="block text-sm font-medium mb-1">Recurrence</label>
            <select
              bind:value={newSchedule.recurrence}
              class="w-full p-2 border rounded"
              required
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2">
            <Button type="button" variant="outline" on:click={() => showAddDialog = false}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSchedule ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div> 