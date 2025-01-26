<!-- src/routes/(dashboard)/dashboard/schedule/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Plus, Calendar } from 'lucide-svelte';
    import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
    } from '$lib/components/ui/dialog';
    import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
    } from '$lib/components/ui/select';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import type { Schedule, Room } from '$lib/services/database';
    import * as db from '$lib/services/database';

    let schedules: Schedule[] = [];
    let rooms: Room[] = [];
    let loading = true;
    let error: string | null = null;

    // Form data
    let subject = '';
    let selectedRoom = '';
    let selectedDay = '';
    let startTime = '';
    let endTime = '';
    let className = '';

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = Array.from({ length: 9 }, (_, i) => `${i + 9}:00`);

    onMount(async () => {
        try {
            [schedules, rooms] = await Promise.all([
                db.getSchedules(),
                db.getRooms()
            ]);
        } catch (e) {
            error = 'Failed to load schedules and rooms';
        } finally {
            loading = false;
        }
    });

    async function handleAddSchedule() {
        if (!subject || !selectedRoom || !selectedDay || !startTime || !endTime || !className) {
            error = 'Please fill in all fields';
            return;
        }

        const scheduleData = {
            subject,
            roomId: selectedRoom,
            dayOfWeek: selectedDay,
            startTime,
            endTime,
            class: className,
            teacherId: 'current-user-id' // Replace with actual user ID
        };

        try {
            const hasConflicts = await db.checkScheduleConflicts(scheduleData);
            if (hasConflicts) {
                error = 'This time slot conflicts with an existing schedule';
                return;
            }

            await db.createSchedule(scheduleData);
            schedules = await db.getSchedules();
            
            // Reset form
            subject = '';
            selectedRoom = '';
            selectedDay = '';
            startTime = '';
            endTime = '';
            className = '';
            error = null;
        } catch (e) {
            error = 'Failed to create schedule';
        }
    }

    function getSchedulesForDay(day: string) {
        return schedules.filter(schedule => schedule.dayOfWeek === day);
    }

    function getRoomName(roomId: string) {
        return rooms.find(room => room.$id === roomId)?.name || 'Unknown Room';
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Schedule</h1>
            <p class="text-muted-foreground">View and manage class schedules.</p>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus class="mr-2 h-4 w-4" />
                    Add Class
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Class</DialogTitle>
                    <DialogDescription>
                        Create a new class schedule. All fields are required.
                    </DialogDescription>
                </DialogHeader>

                {#if error}
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                {/if}

                <div class="grid gap-4 py-4">
                    <div class="space-y-2">
                        <Label for="subject">Subject</Label>
                        <Input id="subject" bind:value={subject} />
                    </div>

                    <div class="space-y-2">
                        <Label for="room">Room</Label>
                        <Select bind:value={selectedRoom}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a room" />
                            </SelectTrigger>
                            <SelectContent>
                                {#each rooms as room}
                                    <SelectItem value={room.$id}>{room.name}</SelectItem>
                                {/each}
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-2">
                        <Label for="day">Day</Label>
                        <Select bind:value={selectedDay}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a day" />
                            </SelectTrigger>
                            <SelectContent>
                                {#each weekDays as day}
                                    <SelectItem value={day}>{day}</SelectItem>
                                {/each}
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label for="startTime">Start Time</Label>
                            <Select bind:value={startTime}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Start time" />
                                </SelectTrigger>
                                <SelectContent>
                                    {#each timeSlots as time}
                                        <SelectItem value={time}>{time}</SelectItem>
                                    {/each}
                                </SelectContent>
                            </Select>
                        </div>

                        <div class="space-y-2">
                            <Label for="endTime">End Time</Label>
                            <Select bind:value={endTime}>
                                <SelectTrigger>
                                    <SelectValue placeholder="End time" />
                                </SelectTrigger>
                                <SelectContent>
                                    {#each timeSlots as time}
                                        <SelectItem value={time}>{time}</SelectItem>
                                    {/each}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label for="class">Class</Label>
                        <Input id="class" bind:value={className} />
                    </div>
                </div>

                <div class="flex justify-end">
                    <Button on:click={handleAddSchedule}>
                        Add Schedule
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>

    <Card class="p-6">
        <div class="grid grid-cols-[auto_1fr] gap-4">
            <div class="w-20" /> <!-- Empty space for time column -->
            <div class="grid grid-cols-5 gap-4">
                {#each weekDays as day}
                    <div class="text-center font-semibold">{day}</div>
                {/each}
            </div>

            {#each timeSlots as time}
                <div class="grid grid-cols-[auto_1fr] gap-4">
                    <div class="w-20 text-right text-sm text-muted-foreground">
                        {time}
                    </div>
                    <div class="grid grid-cols-5 gap-4">
                        {#each weekDays as day}
                            <div class="h-24 border rounded-lg p-2">
                                {#each getSchedulesForDay(day).filter(s => s.startTime === time) as schedule}
                                    <div class="h-full flex flex-col bg-primary/10 rounded p-1">
                                        <div class="font-semibold">{schedule.subject}</div>
                                        <div class="text-sm text-muted-foreground">
                                            {getRoomName(schedule.roomId)}
                                        </div>
                                        <div class="text-sm text-muted-foreground">
                                            Class: {schedule.class}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </Card>
</div> 