<!-- src/lib/components/ScheduleCalendar.svelte -->
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { Calendar } from '@fullcalendar/core';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import interactionPlugin from '@fullcalendar/interaction';
    import type { Schedule, Room } from '$lib/types';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import { Trash2, Edit, X } from 'lucide-svelte';
    import { roomService } from '$lib/services/room';
    import { authService } from '$lib/services/auth';
    import { USER_ROLES } from '$lib/config/constants';
    import { userStore } from '$lib/stores/userStore';

    // Props
    export let schedules: Schedule[] = [];
    export let onEdit: ((schedule: Schedule) => void) | undefined = undefined;
    export let onDelete: ((scheduleId: string) => void) | undefined = undefined;

    // State
    let calendarEl: HTMLElement;
    let calendar: Calendar;
    let selectedSchedule: Schedule | null = null;
    let showScheduleDetails = false;
    let rooms: Record<string, Room> = {};
    let teachers: Record<string, any> = {};
    
    // Check user permissions
    $: isAdmin = $userStore?.user?.role === USER_ROLES.ADMIN;
    $: isTeacher = $userStore?.user?.role === USER_ROLES.TEACHER;
    $: canEdit = Boolean(onEdit);
    $: canDelete = Boolean(onDelete);

    onMount(async () => {
        // Load rooms and teachers data
        await loadRoomsAndTeachers();
        
        // Initialize the calendar
        initializeCalendar();
        
        // Update calendar events when schedules change
        updateCalendarEvents();
    });
    
    onDestroy(() => {
        if (calendar) {
            calendar.destroy();
        }
    });
    
    async function loadRoomsAndTeachers() {
        try {
            // Fetch rooms
            const roomsResponse = await roomService.list();
            const roomsList = roomsResponse.documents as unknown as Room[];
            
            // Create a map of room IDs to room objects
            rooms = roomsList.reduce((acc, room) => {
                acc[room.$id] = room;
                return acc;
            }, {} as Record<string, Room>);
            
            // Fetch teachers
            const teachersResponse = await authService.getTeachers();
            
            // Create a map of teacher IDs to teacher objects
            teachers = teachersResponse.reduce((acc, teacher) => {
                acc[teacher.userId] = teacher;
                return acc;
            }, {} as Record<string, any>);
        } catch (error) {
            console.error('Error loading rooms and teachers:', error);
        }
    }
    
    function initializeCalendar() {
        calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            initialView: 'timeGridWeek',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            slotMinTime: '07:00:00',
            slotMaxTime: '21:00:00',
            allDaySlot: false,
            height: 'auto',
            eventClick: (info) => {
                const scheduleId = info.event.id;
                const schedule = schedules.find(s => s.$id === scheduleId);
                if (schedule) {
                    selectedSchedule = schedule;
                    showScheduleDetails = true;
                }
            },
            // Add more configuration options as needed
        });

        calendar.render();
    }
    
    function updateCalendarEvents() {
        if (!calendar) return;
        
        // Remove all events
        calendar.removeAllEvents();
        
        // Add events from schedules
        const events = schedules.map(schedule => {
            // Get room and teacher details
            const room = rooms[schedule.roomId] || { roomName: 'Unknown Room' };
            const teacher = teachers[schedule.teacherId] || { name: 'Unknown Teacher' };
            
            // Calculate start and end dates
            const start = new Date(schedule.startTime);
            const end = new Date(schedule.endTime);

            return {
                id: schedule.$id,
                title: `${schedule.className}: ${schedule.subject}`,
                start,
                end,
                extendedProps: {
                    teacherName: teacher.name,
                    roomName: room.roomName,
                    className: schedule.className,
                    subject: schedule.subject
                },
                classNames: [
                    schedule.conflictStatus === 'conflict' ? 'bg-red-100 border-red-500' :
                    schedule.conflictStatus === 'warning' ? 'bg-yellow-100 border-yellow-500' :
                    'bg-blue-100 border-blue-500'
                ]
            };
        });

        calendar.addEventSource(events);
    }

    // Update calendar when schedules change
    $: if (calendar && schedules) {
        updateCalendarEvents();
    }
    
    function handleEdit() {
        if (selectedSchedule && onEdit) {
            onEdit(selectedSchedule);
            showScheduleDetails = false;
        }
    }
    
    function handleDelete() {
        if (selectedSchedule && onDelete) {
            onDelete(selectedSchedule.$id);
            showScheduleDetails = false;
        }
    }
</script>

<div bind:this={calendarEl} class="w-full min-h-[600px]"></div>

<!-- Schedule Details Dialog -->
<Dialog bind:open={showScheduleDetails}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle class="text-xl font-semibold">
                {selectedSchedule?.subject}
            </DialogTitle>
            <button 
                class="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                on:click={() => showScheduleDetails = false}
            >
                <X class="h-4 w-4" />
                <span class="sr-only">Close</span>
            </button>
        </DialogHeader>
        
        {#if selectedSchedule}
            <div class="py-4">
                <div class="grid gap-4">
                    <div class="grid grid-cols-3 items-center gap-4">
                        <strong class="text-sm font-medium">Class:</strong>
                        <span class="col-span-2 text-sm">{selectedSchedule.className}</span>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-4">
                        <strong class="text-sm font-medium">Subject:</strong>
                        <span class="col-span-2 text-sm">{selectedSchedule.subject}</span>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-4">
                        <strong class="text-sm font-medium">Teacher:</strong>
                        <span class="col-span-2 text-sm">
                            {teachers[selectedSchedule.teacherId]?.name || 'Unknown Teacher'}
                        </span>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-4">
                        <strong class="text-sm font-medium">Room:</strong>
                        <span class="col-span-2 text-sm">
                            {rooms[selectedSchedule.roomId]?.roomName || 'Unknown Room'}
                        </span>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-4">
                        <strong class="text-sm font-medium">Date:</strong>
                        <span class="col-span-2 text-sm">
                            {new Date(selectedSchedule.startTime).toLocaleDateString()}
                        </span>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-4">
                        <strong class="text-sm font-medium">Time:</strong>
                        <span class="col-span-2 text-sm">
                            {new Date(selectedSchedule.startTime).toLocaleTimeString()} - 
                            {new Date(selectedSchedule.endTime).toLocaleTimeString()}
                        </span>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-4">
                        <strong class="text-sm font-medium">Day:</strong>
                        <span class="col-span-2 text-sm capitalize">
                            {selectedSchedule.dayOfWeek}
                        </span>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-4">
                        <strong class="text-sm font-medium">Duration:</strong>
                        <span class="col-span-2 text-sm">
                            {selectedSchedule.duration} minutes
                        </span>
                    </div>
                    <div class="grid grid-cols-3 items-center gap-4">
                        <strong class="text-sm font-medium">Recurrence:</strong>
                        <span class="col-span-2 text-sm capitalize">
                            {selectedSchedule.recurrence}
                        </span>
                    </div>
                    
                    {#if selectedSchedule.conflictStatus && selectedSchedule.conflictStatus !== 'none'}
                        <Card class={selectedSchedule.conflictStatus === 'conflict' ? 'border-red-500' : 'border-yellow-500'}>
                            <CardContent class="p-4">
                                <div class="flex items-center">
                                    <div class={selectedSchedule.conflictStatus === 'conflict' ? 'text-red-500' : 'text-yellow-500'}>
                                        <strong>
                                            {selectedSchedule.conflictStatus === 'conflict' ? 'Conflict Detected' : 'Warning'}:
                                        </strong>
                                        <p class="text-sm mt-1">
                                            {selectedSchedule.conflictStatus === 'conflict' 
                                                ? 'This schedule conflicts with another schedule.'
                                                : 'This schedule may have a potential conflict.'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    {/if}
                </div>
            </div>
            
            <DialogFooter>
                <div class="flex justify-end space-x-2">
                    <Button variant="outline" on:click={() => showScheduleDetails = false}>
                        Close
                    </Button>
                    
                    {#if canEdit}
                        <Button variant="outline" on:click={handleEdit}>
                            <Edit class="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    {/if}
                    
                    {#if canDelete}
                        <Button variant="destructive" on:click={handleDelete}>
                            <Trash2 class="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    {/if}
                </div>
            </DialogFooter>
        {/if}
    </DialogContent>
</Dialog>

<style>
    :global(.fc) {
        --fc-border-color: var(--border);
        --fc-page-bg-color: var(--background);
        --fc-neutral-bg-color: var(--muted);
        --fc-list-event-hover-bg-color: var(--muted);
        --fc-today-bg-color: var(--primary-foreground);
    }

    :global(.fc-theme-standard .fc-scrollgrid) {
        border-radius: var(--radius);
    }

    :global(.fc .fc-timegrid-slot) {
        height: 3rem;
    }

    :global(.fc .fc-timegrid-slot-label) {
        vertical-align: middle;
    }

    :global(.fc .fc-toolbar-title) {
        font-size: 1.25rem;
        font-weight: 600;
    }

    :global(.fc-direction-ltr .fc-toolbar > * > :not(:first-child)) {
        margin-left: 0.5rem;
    }
</style> 