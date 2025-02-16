<!-- src/lib/components/ScheduleCalendar.svelte -->
<script lang="ts">
    import type { Schedule, Room } from '$lib/types';
    import { Calendar } from '@fullcalendar/core';
    import type { EventClickArg } from '@fullcalendar/core';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import interactionPlugin from '@fullcalendar/interaction';
    import { onMount, onDestroy } from 'svelte';
    import { TIME_SLOTS } from '$lib/config';

    export let schedules: Schedule[] = [];
    export let rooms: Room[] = [];
    export let onScheduleClick: (schedule: Schedule) => void;
    export let readOnly = false;

    let calendarEl: HTMLElement;
    let calendar: Calendar;

    $: if (calendar && schedules) {
        updateEvents();
    }

    onMount(() => {
        calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            initialView: 'timeGridWeek',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            editable: !readOnly,
            selectable: !readOnly,
            selectMirror: true,
            dayMaxEvents: true,
            weekends: false,
            slotMinTime: `${TIME_SLOTS.START_HOUR}:00:00`,
            slotMaxTime: `${TIME_SLOTS.END_HOUR}:00:00`,
            slotDuration: `00:${TIME_SLOTS.SLOT_DURATION}:00`,
            eventClick: (info: EventClickArg) => {
                const schedule = schedules.find(s => s.$id === info.event.id);
                if (schedule) {
                    onScheduleClick(schedule);
                }
            },
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
            },
            nowIndicator: true,
            scrollTime: `${TIME_SLOTS.START_HOUR}:00:00`,
            expandRows: true,
            height: 'auto',
            businessHours: {
                daysOfWeek: [1, 2, 3, 4, 5],
                startTime: `${TIME_SLOTS.START_HOUR}:00`,
                endTime: `${TIME_SLOTS.END_HOUR}:00`,
            }
        });

        calendar.render();
        updateEvents();
    });

    onDestroy(() => {
        if (calendar) {
            calendar.destroy();
        }
    });

    function updateEvents() {
        const events = schedules.map(schedule => {
            const room = rooms.find(r => r.$id === schedule.roomId);
            const startDate = new Date(schedule.startTime);
            const endDate = new Date(startDate.getTime() + schedule.duration * 60000);

            return {
                id: schedule.$id,
                title: `${schedule.title} (${room?.roomName || 'Unknown Room'})`,
                start: startDate,
                end: endDate,
                backgroundColor: getEventColor(schedule.conflictStatus),
                borderColor: getEventColor(schedule.conflictStatus),
                classNames: [
                    'cursor-pointer',
                    'hover:opacity-90',
                    'transition-opacity',
                    schedule.conflictStatus === 'conflict' ? 'border-l-4 border-l-destructive' : ''
                ]
            };
        });

        calendar.removeAllEvents();
        calendar.addEventSource(events);
    }

    function getEventColor(status?: 'none' | 'conflict' | 'warning'): string {
        switch (status) {
            case 'conflict':
                return 'var(--destructive)';
            case 'warning':
                return 'var(--warning)';
            default:
                return 'var(--primary)';
        }
    }
</script>

<div bind:this={calendarEl} class="w-full min-h-[600px] bg-background border rounded-lg shadow-sm"></div>

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