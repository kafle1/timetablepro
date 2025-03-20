<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
  import { Badge } from '$lib/components/ui/badge';
  import { 
    Table, 
    TableBody, 
    TableCaption, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
  } from '$lib/components/ui/table';
  import { roomService } from '$lib/services/room';
  import { authService } from '$lib/services/auth';
  import { format } from 'date-fns';
  import type { Schedule, Room, User } from '$lib/types';
  import { MoreHorizontal, ArrowUpDown, X, Check, AlertCircle } from 'lucide-svelte';
  
  // Props
  export let schedules: Schedule[] = [];
  export let loading: boolean = false;
  export let onEdit: ((schedule: Schedule) => void) | undefined = undefined;
  export let onDelete: ((scheduleId: string) => void) | undefined = undefined;
  
  // State
  let filteredSchedules: Schedule[] = [];
  let rooms: Room[] = [];
  let teachers: User[] = [];
  
  // Filter state
  let filters = {
    room: '',
    teacher: '',
    subject: '',
    date: '',
    status: ''
  };
  
  type SortableField = keyof Schedule | '';
  
  // Sort state
  let sortField: SortableField = '';
  let sortDirection: 'asc' | 'desc' = 'asc';
  
  onMount(async () => {
    try {
      // Load room and teacher data for filters
      const [roomsData, teachersData] = await Promise.all([
        roomService.list(),
        authService.getTeachers()
      ]);
      
      rooms = roomsData.documents as unknown as Room[];
      teachers = teachersData as User[];
      
      // Initial filtering
      updateFilteredSchedules();
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  });
  
  $: {
    // Re-filter whenever schedules or filters change
    updateFilteredSchedules();
  }
  
  function updateFilteredSchedules() {
    let result = [...schedules];
    
    // Apply room filter
    if (filters.room) {
      result = result.filter(s => s.roomId === filters.room);
    }
    
    // Apply teacher filter
    if (filters.teacher) {
      result = result.filter(s => s.teacherId === filters.teacher);
    }
    
    // Apply subject filter
    if (filters.subject) {
      const subjectLower = filters.subject.toLowerCase();
      result = result.filter(s => 
        s.subject?.toLowerCase().includes(subjectLower) || 
        s.className?.toLowerCase().includes(subjectLower)
      );
    }
    
    // Apply date filter
    if (filters.date) {
      const filterDate = new Date(filters.date);
      result = result.filter(s => {
        const scheduleDate = new Date(s.startTime);
        return scheduleDate.toDateString() === filterDate.toDateString();
      });
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(s => s.conflictStatus === filters.status);
    }
    
    // Apply sorting if set
    if (sortField !== '') {
      result.sort((a, b) => {
        // Using bracket notation with type checking
        const field = sortField as keyof Schedule;
        const aValue = a[field];
        const bValue = b[field];
        
        if (aValue === bValue) return 0;
        
        let comparison = 0;
        if (aValue > bValue || bValue === undefined) {
          comparison = 1;
        } else if (aValue < bValue || aValue === undefined) {
          comparison = -1;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    filteredSchedules = result;
  }
  
  function resetFilters() {
    filters = {
      room: '',
      teacher: '',
      subject: '',
      date: '',
      status: ''
    };
    sortField = '';
    sortDirection = 'asc';
    updateFilteredSchedules();
  }
  
  function handleSort(field: keyof Schedule) {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort field and reset to ascending
      sortField = field;
      sortDirection = 'asc';
    }
    
    updateFilteredSchedules();
  }
  
  function getRoomName(roomId: string): string {
    const room = rooms.find(r => r.$id === roomId);
    return room ? room.name : 'Unknown Room';
  }
  
  function getTeacherName(teacherId: string): string {
    const teacher = teachers.find(t => t.$id === teacherId);
    return teacher ? teacher.name : 'Unknown Teacher';
  }
  
  function formatDateTime(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid Date';
    }
  }
</script>

<div class="space-y-4">
  <!-- Filters -->
  <div class="p-4 space-y-4 border rounded-md">
    <h3 class="text-lg font-medium">Filters</h3>
    
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      <!-- Room Filter -->
      <div class="space-y-2">
        <Label for="room-filter">Room</Label>
        <Select bind:value={filters.room}>
          <SelectTrigger>
            <SelectValue placeholder="All Rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Rooms</SelectItem>
            {#each rooms as room}
              <SelectItem value={room.$id}>{room.name}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
      
      <!-- Teacher Filter -->
      <div class="space-y-2">
        <Label for="teacher-filter">Teacher</Label>
        <Select bind:value={filters.teacher}>
          <SelectTrigger>
            <SelectValue placeholder="All Teachers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Teachers</SelectItem>
            {#each teachers as teacher}
              <SelectItem value={teacher.$id}>{teacher.name}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
      
      <!-- Subject/Class Filter -->
      <div class="space-y-2">
        <Label for="subject-filter">Subject/Class</Label>
        <Input id="subject-filter" bind:value={filters.subject} placeholder="Search by name..." />
      </div>
      
      <!-- Date Filter -->
      <div class="space-y-2">
        <Label for="date-filter">Date</Label>
        <Input id="date-filter" type="date" bind:value={filters.date} />
      </div>
    </div>
    
    <div class="flex justify-end gap-2">
      <Button variant="outline" on:click={resetFilters}>
        <X class="w-4 h-4 mr-2" />
        Reset Filters
      </Button>
      <Button on:click={updateFilteredSchedules}>
        <Check class="w-4 h-4 mr-2" />
        Apply Filters
      </Button>
    </div>
  </div>
  
  <!-- Schedule Table -->
  <div class="border rounded-md">
    <Table>
      <TableCaption>
        {filteredSchedules.length} schedule{filteredSchedules.length === 1 ? '' : 's'} found
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead class="cursor-pointer" on:click={() => handleSort('className')}>
            Class/Subject
            <ArrowUpDown class="inline w-4 h-4 ml-1" />
          </TableHead>
          <TableHead class="cursor-pointer" on:click={() => handleSort('roomId')}>
            Room
            <ArrowUpDown class="inline w-4 h-4 ml-1" />
          </TableHead>
          <TableHead class="cursor-pointer" on:click={() => handleSort('teacherId')}>
            Teacher
            <ArrowUpDown class="inline w-4 h-4 ml-1" />
          </TableHead>
          <TableHead class="cursor-pointer" on:click={() => handleSort('startTime')}>
            Start Time
            <ArrowUpDown class="inline w-4 h-4 ml-1" />
          </TableHead>
          <TableHead class="cursor-pointer" on:click={() => handleSort('duration')}>
            Duration
            <ArrowUpDown class="inline w-4 h-4 ml-1" />
          </TableHead>
          <TableHead class="cursor-pointer" on:click={() => handleSort('dayOfWeek')}>
            Day
            <ArrowUpDown class="inline w-4 h-4 ml-1" />
          </TableHead>
          <TableHead class="cursor-pointer" on:click={() => handleSort('recurrence')}>
            Recurrence
            <ArrowUpDown class="inline w-4 h-4 ml-1" />
          </TableHead>
          <TableHead class="cursor-pointer" on:click={() => handleSort('conflictStatus')}>
            Status
            <ArrowUpDown class="inline w-4 h-4 ml-1" />
          </TableHead>
          {#if onEdit || onDelete}
            <TableHead class="text-right">Actions</TableHead>
          {/if}
        </TableRow>
      </TableHeader>
      <TableBody>
        {#if loading}
          <TableRow>
            <TableCell colspan={onEdit || onDelete ? 9 : 8} class="text-center py-8">
              <div class="flex justify-center">
                <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </TableCell>
          </TableRow>
        {:else if filteredSchedules.length === 0}
          <TableRow>
            <TableCell colspan={onEdit || onDelete ? 9 : 8} class="text-center py-8">
              <p class="text-muted-foreground">No schedules found</p>
            </TableCell>
          </TableRow>
        {:else}
          {#each filteredSchedules as schedule (schedule.$id)}
            <TableRow>
              <TableCell>
                {schedule.className || schedule.subject || 'Untitled'}
              </TableCell>
              <TableCell>{getRoomName(schedule.roomId)}</TableCell>
              <TableCell>{getTeacherName(schedule.teacherId)}</TableCell>
              <TableCell>{formatDateTime(schedule.startTime)}</TableCell>
              <TableCell>{schedule.duration} mins</TableCell>
              <TableCell>{schedule.dayOfWeek ? schedule.dayOfWeek.charAt(0).toUpperCase() + schedule.dayOfWeek.slice(1) : 'N/A'}</TableCell>
              <TableCell>{schedule.recurrence ? schedule.recurrence.charAt(0).toUpperCase() + schedule.recurrence.slice(1) : 'Once'}</TableCell>
              <TableCell>
                {#if schedule.conflictStatus === 'conflict'}
                  <Badge variant="destructive">Conflict</Badge>
                {:else if schedule.conflictStatus === 'warning'}
                  <Badge variant="secondary">Warning</Badge>
                {:else}
                  <Badge variant="outline">OK</Badge>
                {/if}
              </TableCell>
              {#if onEdit || onDelete}
                <TableCell class="text-right">
                  <div class="flex justify-end gap-2">
                    {#if onEdit}
                      <Button variant="ghost" size="sm" on:click={() => onEdit(schedule)}>
                        Edit
                      </Button>
                    {/if}
                    {#if onDelete}
                      <Button variant="ghost" size="sm" on:click={() => onDelete(schedule.$id)}>
                        Delete
                      </Button>
                    {/if}
                  </div>
                </TableCell>
              {/if}
            </TableRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  </div>
</div> 