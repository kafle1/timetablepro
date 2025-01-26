<!-- src/routes/schedule/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { getSchedules, createSchedule, updateSchedule, deleteSchedule, type Schedule, type ScheduleData } from '$lib/services/schedule';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';

    let schedules: Schedule[] = [];
    let loading = true;
    let error: string | null = null;
    let showDialog = false;

    // Form data
    let formData: Partial<ScheduleData> = {
        subject: '',
        class: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        roomId: '',
        teacherId: ''
    };

    let editingScheduleId: string | null = null;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = Array.from({ length: 12 }, (_, i) => {
        const hour = Math.floor(i / 2) + 8;
        const minute = i % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    });

    onMount(async () => {
        try {
            const filters = $authStore.user?.role === 'teacher' 
                ? { teacherId: $authStore.user.$id }
                : {};
            schedules = await getSchedules(filters);
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            }
        } finally {
            loading = false;
        }
    });

    function getSchedulesForDayAndTime(day: string, time: string): Schedule[] {
        return schedules.filter(
            schedule => 
                schedule.dayOfWeek === day && 
                schedule.startTime <= time && 
                schedule.endTime > time
        );
    }

    async function handleSubmit() {
        try {
            if (!formData.subject || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
                error = 'Please fill in all required fields';
                return;
            }

            if (editingScheduleId) {
                await updateSchedule(editingScheduleId, formData);
            } else {
                const newSchedule: ScheduleData = {
                    ...formData as ScheduleData,
                    teacherId: $authStore.user?.role === 'teacher' 
                        ? $authStore.user.$id 
                        : formData.teacherId!
                };
                await createSchedule(newSchedule);
            }

            // Refresh schedules
            schedules = await getSchedules();
            showDialog = false;
            resetForm();
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            }
        }
    }

    async function handleDelete(scheduleId: string) {
        if (confirm('Are you sure you want to delete this schedule?')) {
            try {
                await deleteSchedule(scheduleId);
                schedules = schedules.filter(s => s.$id !== scheduleId);
            } catch (e) {
                if (e instanceof Error) {
                    error = e.message;
                }
            }
        }
    }

    function editSchedule(schedule: Schedule) {
        editingScheduleId = schedule.$id;
        formData = {
            subject: schedule.subject,
            class: schedule.class,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            roomId: schedule.roomId,
            teacherId: schedule.teacherId
        };
        showDialog = true;
    }

    function resetForm() {
        formData = {
            subject: '',
            class: '',
            dayOfWeek: '',
            startTime: '',
            endTime: '',
            roomId: '',
            teacherId: ''
        };
        editingScheduleId = null;
        error = null;
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">Schedule</h1>
        {#if $authStore.user?.role !== 'student'}
            <Dialog bind:open={showDialog} on:close={resetForm}>
                <DialogTrigger asChild let:builder>
                    <Button builders={[builder]}>
                        {editingScheduleId ? 'Edit Schedule' : 'Add Schedule'}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingScheduleId ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the schedule below
                        </DialogDescription>
                    </DialogHeader>

                    <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
                        <div class="space-y-2">
                            <Label for="subject">Subject</Label>
                            <Input
                                id="subject"
                                bind:value={formData.subject}
                                placeholder="Enter subject name"
                                required
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="class">Class</Label>
                            <Input
                                id="class"
                                bind:value={formData.class}
                                placeholder="Enter class (e.g., Grade 10A)"
                                required
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="dayOfWeek">Day</Label>
                            <select
                                id="dayOfWeek"
                                class="w-full px-3 py-2 border rounded-md"
                                bind:value={formData.dayOfWeek}
                                required
                            >
                                <option value="">Select a day</option>
                                {#each days as day}
                                    <option value={day}>{day}</option>
                                {/each}
                            </select>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <Label for="startTime">Start Time</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    bind:value={formData.startTime}
                                    required
                                />
                            </div>
                            <div class="space-y-2">
                                <Label for="endTime">End Time</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    bind:value={formData.endTime}
                                    required
                                />
                            </div>
                        </div>

                        <div class="space-y-2">
                            <Label for="roomId">Room</Label>
                            <Input
                                id="roomId"
                                bind:value={formData.roomId}
                                placeholder="Enter room ID"
                                required
                            />
                        </div>

                        {#if $authStore.user?.role === 'admin'}
                            <div class="space-y-2">
                                <Label for="teacherId">Teacher</Label>
                                <Input
                                    id="teacherId"
                                    bind:value={formData.teacherId}
                                    placeholder="Enter teacher ID"
                                    required
                                />
                            </div>
                        {/if}

                        {#if error}
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        {/if}

                        <DialogFooter>
                            <Button type="submit">
                                {editingScheduleId ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        {/if}
    </div>

    {#if loading}
        <div class="text-center py-8">Loading schedules...</div>
    {:else}
        <div class="border rounded-lg overflow-hidden">
            <table class="w-full">
                <thead>
                    <tr>
                        <th class="p-3 border-b bg-muted font-medium text-left">Time</th>
                        {#each days as day}
                            <th class="p-3 border-b bg-muted font-medium text-left">{day}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each timeSlots as time}
                        <tr>
                            <td class="p-3 border-b border-r">{time}</td>
                            {#each days as day}
                                <td class="p-3 border-b border-r">
                                    {#each getSchedulesForDayAndTime(day, time) as schedule}
                                        <div class="bg-primary/10 p-2 rounded mb-1">
                                            <div class="font-medium">{schedule.subject}</div>
                                            <div class="text-sm text-muted-foreground">
                                                {schedule.class} - Room {schedule.roomId}
                                            </div>
                                            {#if $authStore.user?.role !== 'student'}
                                                <div class="flex gap-2 mt-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        on:click={() => editSchedule(schedule)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        on:click={() => handleDelete(schedule.$id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            {/if}
                                        </div>
                                    {/each}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div> 
