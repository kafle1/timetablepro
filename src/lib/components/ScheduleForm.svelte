<!-- src/lib/components/ScheduleForm.svelte -->
<script lang="ts">
    import { scheduleService } from '$lib/services/schedule';
    import { roomService } from '$lib/services/room';
    import { authService } from '$lib/services/auth';
    import type { Room, Schedule, User } from '$lib/types';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Loader2 } from 'lucide-svelte';
    import { TIME_CONFIG } from '$lib/config/constants';

    // Props
    export let schedule: Schedule | null = null;
    export let onSubmit: (schedule: Schedule) => void;
    export let onCancel: () => void;

    // Form state
    let className = schedule?.className || '';
    let subject = schedule?.subject || '';
    let roomId = schedule?.roomId || '';
    let teacherId = schedule?.teacherId || '';
    let startTime = schedule?.startTime || '';
    let duration = schedule?.duration?.toString() || '60';
    let dayOfWeek = schedule?.dayOfWeek || 'monday';
    let recurrence = schedule?.recurrence || 'once';
    
    let loading = false;
    let error: string | null = null;
    let rooms: Room[] = [];
    let teachers: User[] = [];

    onMount(async () => {
        try {
            loading = true;
            const [roomsData, teachersData] = await Promise.all([
                roomService.list(),
                authService.getTeachers()
            ]);
            
            rooms = roomsData.documents as unknown as Room[];
            teachers = teachersData as User[];
        } catch (err) {
            console.error('Error loading form data:', err);
            error = 'Failed to load rooms and teachers';
        } finally {
            loading = false;
        }
    });

    function calculateEndTime(start: string, durationMinutes: number): string {
        if (!start) return '';
        
        const startDate = new Date(start);
        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
        
        return endDate.toISOString();
    }

    async function handleSubmit() {
        try {
            error = null;
            
            // Validate inputs
            if (!className || !subject || !roomId || !teacherId || !startTime || !duration || !dayOfWeek || !recurrence) {
                error = 'All fields are required';
                return;
            }
            
            loading = true;
            
            // Calculate end time
            const endTime = calculateEndTime(startTime, parseInt(duration));
            
            const scheduleData = {
                className,
                subject,
                roomId,
                teacherId,
                startTime,
                endTime,
                duration: parseInt(duration),
                dayOfWeek,
                recurrence
            };
            
            let result: Schedule;
            
            if (schedule) {
                // Update existing schedule
                result = await scheduleService.updateSchedule(schedule.$id, scheduleData);
            } else {
                // Create new schedule
                result = await scheduleService.createSchedule(scheduleData);
            }
            
            onSubmit(result);
        } catch (err: any) {
            console.error('Schedule form error:', err);
            error = err.message || 'Failed to save schedule';
        } finally {
            loading = false;
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
    {#if error}
        <div class="p-3 text-sm text-red-600 rounded-md bg-red-50 dark:bg-red-900/50 dark:text-red-100">
            {error}
        </div>
    {/if}
    
    <div class="grid gap-2">
        <Label for="className">Class Name</Label>
        <Input 
            id="className" 
            bind:value={className} 
            placeholder="e.g. Mathematics 101" 
            disabled={loading}
        />
    </div>
    
    <div class="grid gap-2">
        <Label for="subject">Subject</Label>
        <Input 
            id="subject" 
            bind:value={subject} 
            placeholder="e.g. Mathematics" 
            disabled={loading}
        />
    </div>
    
    <div class="grid gap-2">
        <Label for="room">Room</Label>
        <Select bind:value={roomId} disabled={loading}>
            <SelectTrigger id="room">
                <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
                {#each rooms as room}
                    <SelectItem value={room.$id}>{room.roomName} (Capacity: {room.capacity})</SelectItem>
                {/each}
            </SelectContent>
        </Select>
    </div>
    
    <div class="grid gap-2">
        <Label for="teacher">Teacher</Label>
        <Select bind:value={teacherId} disabled={loading}>
            <SelectTrigger id="teacher">
                <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
                {#each teachers as teacher}
                    <SelectItem value={teacher.userId}>{teacher.name}</SelectItem>
                {/each}
            </SelectContent>
        </Select>
    </div>
    
    <div class="grid gap-2">
        <Label for="startTime">Start Time</Label>
        <Input 
            id="startTime" 
            type="datetime-local" 
            bind:value={startTime} 
            disabled={loading}
        />
    </div>
    
    <div class="grid gap-2">
        <Label for="duration">Duration (minutes)</Label>
        <Input 
            id="duration" 
            type="number" 
            bind:value={duration} 
            min="15" 
            max="240" 
            step="15" 
            disabled={loading}
        />
    </div>
    
    <div class="grid gap-2">
        <Label for="dayOfWeek">Day of Week</Label>
        <Select bind:value={dayOfWeek} disabled={loading}>
            <SelectTrigger id="dayOfWeek">
                <SelectValue placeholder="Select day of week" />
            </SelectTrigger>
            <SelectContent>
                {#each TIME_CONFIG.WORKING_DAYS as day}
                    <SelectItem value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</SelectItem>
                {/each}
            </SelectContent>
        </Select>
    </div>
    
    <div class="grid gap-2">
        <Label for="recurrence">Recurrence</Label>
        <Select bind:value={recurrence} disabled={loading}>
            <SelectTrigger id="recurrence">
                <SelectValue placeholder="Select recurrence pattern" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="once">Once</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
        </Select>
    </div>
    
    <div class="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" on:click={onCancel} disabled={loading}>
            Cancel
        </Button>
        <Button type="submit" disabled={loading}>
            {#if loading}
                <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                {schedule ? 'Updating...' : 'Creating...'}
            {:else}
                {schedule ? 'Update Schedule' : 'Create Schedule'}
            {/if}
        </Button>
    </div>
</form> 