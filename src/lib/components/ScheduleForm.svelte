<!-- src/lib/components/ScheduleForm.svelte -->
<script lang="ts">
    import { scheduleService } from '$lib/services/schedule';
    import { roomService } from '$lib/services/room';
    import { notificationService } from '$lib/services/notification';
    import { userStore } from '$lib/stores/userStore';
    import type { Schedule, Room } from '$lib/types';
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';

    export let schedule: Partial<Schedule> | null = null;
    export let onSubmit: (schedule: Schedule) => void;
    export let onCancel: () => void;

    let loading = false;
    let error: string | null = null;
    let rooms: Room[] = [];
    let selectedRoom: string = schedule?.roomId || '';
    let className: string = schedule?.className || '';
    let startTime: string = schedule?.startTime ? new Date(schedule.startTime).toISOString().slice(0, 16) : '';
    let duration: number = schedule?.duration || 60;

    onMount(async () => {
        try {
            rooms = await roomService.listRooms();
        } catch (err) {
            error = 'Failed to load rooms';
            console.error('Error loading rooms:', err);
        }
    });

    async function handleSubmit() {
        if (!className || !selectedRoom || !startTime || !duration) {
            error = 'Please fill in all required fields';
            return;
        }

        loading = true;
        error = null;

        try {
            const user = $userStore;
            if (!user) throw new Error('User not authenticated');

            let result: Schedule;
            
            if (schedule?.$id) {
                // Update existing schedule
                result = await scheduleService.updateSchedule(schedule.$id, {
                    className,
                    roomId: selectedRoom,
                    startTime,
                    duration
                });

                await notificationService.createScheduleChangeNotification(
                    user.userId,
                    className,
                    'updated'
                );
            } else {
                // Create new schedule
                result = await scheduleService.createSchedule(
                    className,
                    user.userId,
                    selectedRoom,
                    startTime,
                    duration
                );

                await notificationService.createScheduleChangeNotification(
                    user.userId,
                    className,
                    'created'
                );
            }

            if (result.conflictStatus === 'conflict') {
                await notificationService.createConflictNotification(
                    user.userId,
                    className,
                    'Time slot conflict detected'
                );
            }

            onSubmit(result);
        } catch (err) {
            error = 'Failed to save schedule';
            console.error('Error saving schedule:', err);
        } finally {
            loading = false;
        }
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
    {#if error}
        <div class="p-4 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/50 dark:text-red-100">
            {error}
        </div>
    {/if}

    <div class="space-y-2">
        <Label for="className">Class Name</Label>
        <Input
            type="text"
            id="className"
            bind:value={className}
            placeholder="Enter class name"
            required
        />
    </div>

    <div class="space-y-2">
        <Label for="room">Room</Label>
        <Select bind:value={selectedRoom}>
            <SelectTrigger>
                <SelectValue placeholder="Select a room" />
            </SelectTrigger>
            <SelectContent>
                {#each rooms as room}
                    <SelectItem value={room.$id}>
                        {room.roomName} (Capacity: {room.capacity})
                    </SelectItem>
                {/each}
            </SelectContent>
        </Select>
    </div>

    <div class="space-y-2">
        <Label for="startTime">Start Time</Label>
        <Input
            type="datetime-local"
            id="startTime"
            bind:value={startTime}
            required
        />
    </div>

    <div class="space-y-2">
        <Label for="duration">Duration (minutes)</Label>
        <Input
            type="number"
            id="duration"
            bind:value={duration}
            min="15"
            max="480"
            step="15"
            required
        />
    </div>

    <div class="flex justify-end space-x-4">
        <Button
            type="button"
            variant="outline"
            on:click={onCancel}
            disabled={loading}
        >
            Cancel
        </Button>
        <Button
            type="submit"
            disabled={loading}
        >
            {loading ? 'Saving...' : schedule?.$id ? 'Update Schedule' : 'Create Schedule'}
        </Button>
    </div>
</form> 