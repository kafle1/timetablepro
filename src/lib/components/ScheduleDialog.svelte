<script lang="ts">
    import type { Schedule, Room } from '$lib/types';
    import { scheduleService } from '$lib/services/schedule';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '$lib/components/ui/select';
    import { TIME_SLOTS } from '$lib/config';
    import { userStore } from '$lib/stores/user';

    export let open = false;
    export let schedule: Schedule | null = null;
    export let rooms: Room[] = [];
    export let onClose: () => void;
    export let onChange: () => void;

    let loading = false;
    let error: string | null = null;

    let title = '';
    let description = '';
    let roomId = '';
    let startTime = '';
    let duration = 30;
    let teacherId = '';

    $: if ($userStore) {
        teacherId = $userStore.$id;
    }

    $: if (schedule) {
        title = schedule.title;
        description = schedule.description || '';
        roomId = schedule.roomId;
        startTime = new Date(schedule.startTime).toISOString().slice(0, 16);
        duration = schedule.duration;
        teacherId = schedule.teacherId;
    }

    async function handleSubmit() {
        if (!$userStore) {
            error = 'User not authenticated';
            return;
        }

        loading = true;
        error = null;

        try {
            if (schedule) {
                await scheduleService.updateSchedule(schedule.$id, {
                    title,
                    description,
                    roomId,
                    startTime: new Date(startTime).toISOString(),
                    duration,
                    teacherId
                });
            } else {
                await scheduleService.createSchedule({
                    title,
                    description,
                    roomId,
                    startTime: new Date(startTime).toISOString(),
                    duration,
                    teacherId
                });
            }

            onChange();
        } catch (err) {
            error = 'Failed to save schedule';
            console.error('Error saving schedule:', err);
        } finally {
            loading = false;
        }
    }

    async function handleDelete() {
        if (!schedule) return;

        loading = true;
        error = null;

        try {
            await scheduleService.deleteSchedule(schedule.$id);
            onChange();
        } catch (err) {
            error = 'Failed to delete schedule';
            console.error('Error deleting schedule:', err);
        } finally {
            loading = false;
        }
    }
</script>

<Dialog {open} on:close={onClose}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>{schedule ? 'Edit Schedule' : 'New Schedule'}</DialogTitle>
            <DialogDescription>
                {schedule ? 'Update the schedule details below.' : 'Fill in the schedule details below.'}
            </DialogDescription>
        </DialogHeader>

        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            {#if error}
                <div class="p-4 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/50 dark:text-red-100">
                    {error}
                </div>
            {/if}

            <div class="space-y-2">
                <Label for="title">Title</Label>
                <Input
                    id="title"
                    bind:value={title}
                    required
                    placeholder="Enter schedule title"
                    disabled={loading}
                />
            </div>

            <div class="space-y-2">
                <Label for="description">Description</Label>
                <Input
                    id="description"
                    bind:value={description}
                    placeholder="Enter schedule description"
                    disabled={loading}
                />
            </div>

            <div class="space-y-2">
                <Label for="room">Room</Label>
                <Select bind:value={roomId} required disabled={loading}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a room" />
                    </SelectTrigger>
                    <SelectContent>
                        {#each rooms as room}
                            <SelectItem value={room.$id}>{room.roomName}</SelectItem>
                        {/each}
                    </SelectContent>
                </Select>
            </div>

            <div class="space-y-2">
                <Label for="startTime">Start Time</Label>
                <Input
                    id="startTime"
                    type="datetime-local"
                    bind:value={startTime}
                    required
                    disabled={loading}
                />
            </div>

            <div class="space-y-2">
                <Label for="duration">Duration (minutes)</Label>
                <Select bind:value={duration} required disabled={loading}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        {#each TIME_SLOTS.OPTIONS as slot}
                            <SelectItem value={slot.duration}>{slot.label}</SelectItem>
                        {/each}
                    </SelectContent>
                </Select>
            </div>

            <DialogFooter class="gap-2">
                {#if schedule}
                    <Button
                        type="button"
                        variant="destructive"
                        on:click={handleDelete}
                        disabled={loading}
                    >
                        Delete
                    </Button>
                {/if}
                <Button type="button" variant="outline" on:click={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {schedule ? 'Update' : 'Create'}
                </Button>
            </DialogFooter>
        </form>
    </DialogContent>
</Dialog> 