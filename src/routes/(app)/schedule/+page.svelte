<script lang="ts">
  import { onMount } from 'svelte';
  import { scheduleService } from '$lib/services/schedule';
  import { roomService } from '$lib/services/room';
  import { authService } from '$lib/services/auth';
  import { toastStore } from '$lib/stores/toastStore';
  import { Button } from '$lib/components/ui/button';
  import { Dialog, DialogContent } from '$lib/components/ui/dialog';
  import { Card } from '$lib/components/ui/card';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
  import { Separator } from '$lib/components/ui/separator';
  import { Calendar, Download, Plus, RefreshCw } from 'lucide-svelte';
  import ScheduleForm from '$lib/components/ScheduleForm.svelte';
  import ScheduleCalendar from '$lib/components/ScheduleCalendar.svelte';
  import ScheduleList from '$lib/components/ScheduleList.svelte';
  import type { Schedule, User, Room } from '$lib/types';
  import { USER_ROLES } from '$lib/config/constants';
  import { userStore } from '$lib/stores/userStore';

  // State
  let view = 'calendar';
  let schedules: Schedule[] = [];
  let rooms: Room[] = [];
  let teachers: User[] = [];
  let loading = false;
  let error: string | null = null;
  let showAddDialog = false;
  let editingSchedule: Schedule | null = null;

  // User access control
  $: isAdmin = $userStore?.user?.role === USER_ROLES.ADMIN;
  $: isTeacher = $userStore?.user?.role === USER_ROLES.TEACHER;
  $: showAddButton = isAdmin || isTeacher;
  $: userId = $userStore?.user?.userId || '';

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      loading = true;
      error = null;

      // Load data based on user role
      if (isAdmin) {
        // Admins see all schedules
        const schedulesData = await scheduleService.listSchedules();
        schedules = schedulesData.documents as unknown as Schedule[];
      } else if (isTeacher) {
        // Teachers see only their schedules
        const schedulesData = await scheduleService.getSchedulesByTeacher(userId);
        schedules = schedulesData.documents as unknown as Schedule[];
      } else {
        // Students see only their class schedules (to be implemented)
        const schedulesData = await scheduleService.listSchedules();
        schedules = schedulesData.documents as unknown as Schedule[];
      }

      // Load rooms and teachers for admin form
      if (isAdmin) {
        const [roomsData, teachersData] = await Promise.all([
          roomService.list(),
          authService.getTeachers()
        ]);
        
        rooms = roomsData.documents as unknown as Room[];
        teachers = teachersData as User[];
      }
    } catch (err) {
      console.error('Error loading schedule data:', err);
      error = 'Failed to load schedule data';
    } finally {
      loading = false;
    }
  }

  function handleAddSchedule() {
    editingSchedule = null;
    showAddDialog = true;
  }

  function handleEditSchedule(schedule: Schedule) {
    editingSchedule = schedule;
    showAddDialog = true;
  }

  async function handleDeleteSchedule(scheduleId: string) {
    try {
      loading = true;
      await scheduleService.deleteSchedule(scheduleId);
      schedules = schedules.filter(s => s.$id !== scheduleId);
      toastStore.success('Schedule deleted successfully');
    } catch (err) {
      console.error('Error deleting schedule:', err);
      toastStore.error('Failed to delete schedule');
    } finally {
      loading = false;
    }
  }

  async function handleScheduleSubmit(schedule: Schedule) {
    try {
      // Add to local array
      if (editingSchedule) {
        schedules = schedules.map(s => s.$id === schedule.$id ? schedule : s);
      } else {
        schedules = [...schedules, schedule];
      }
      
      // Close dialog
      showAddDialog = false;
      editingSchedule = null;
      
      // Show success message
      toastStore.success(
        editingSchedule ? 'Schedule updated successfully' : 'Schedule created successfully'
      );
    } catch (err) {
      console.error('Error handling schedule submit:', err);
    }
  }

  function exportSchedule() {
    // To be implemented - export to PDF or Excel
    toastStore.info('Export functionality coming soon');
  }
</script>

<div class="container px-4 py-8 mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Schedule Management</h1>
      <p class="mt-1 text-muted-foreground">View and manage your timetable efficiently</p>
    </div>
    <div class="flex items-center gap-2">
      {#if showAddButton}
        <Button on:click={handleAddSchedule}>
          <Plus class="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      {/if}
      <Button variant="outline" on:click={exportSchedule}>
        <Download class="w-4 h-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" on:click={loadData}>
        <RefreshCw class="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>
  </div>

  {#if error}
    <div class="p-4 mb-6 text-red-700 border border-red-200 rounded bg-red-50">
      {error}
    </div>
  {/if}

  <Tabs bind:value={view} class="w-full">
    <TabsList class="mb-6">
      <TabsTrigger value="calendar">
        <Calendar class="w-4 h-4 mr-2" />
        Calendar View
      </TabsTrigger>
      <TabsTrigger value="list">
        <Calendar class="w-4 h-4 mr-2" />
        List View
      </TabsTrigger>
    </TabsList>

    <TabsContent value="calendar" class="mt-0">
      <Card class="p-4">
        <ScheduleCalendar 
          {schedules} 
          onEdit={isAdmin || isTeacher ? handleEditSchedule : undefined}
          onDelete={isAdmin ? handleDeleteSchedule : undefined} 
        />
      </Card>
    </TabsContent>

    <TabsContent value="list" class="mt-0">
      <Card class="p-4">
        <ScheduleList 
          {schedules} 
          {loading}
          onEdit={isAdmin || isTeacher ? handleEditSchedule : undefined} 
          onDelete={isAdmin ? handleDeleteSchedule : undefined} 
        />
      </Card>
    </TabsContent>
  </Tabs>
</div>

<!-- Schedule Dialog -->
<Dialog bind:open={showAddDialog}>
  <DialogContent class="sm:max-w-[600px]">
    <ScheduleForm 
      schedule={editingSchedule}
      onSubmit={handleScheduleSubmit}
      onCancel={() => showAddDialog = false}
    />
  </DialogContent>
</Dialog> 