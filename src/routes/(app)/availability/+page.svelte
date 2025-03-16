<!-- src/routes/(app)/availability/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { teacherAvailabilityService } from '$lib/services/teacher-availability';
    import { authService } from '$lib/services/auth';
    import { userStore } from '$lib/stores/userStore';
    import type { TeacherAvailability, User } from '$lib/types';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Loader2, Clock, Calendar, Save } from 'lucide-svelte';
    import { DAYS_OF_WEEK, TIME_SLOTS } from '$lib/config/constants';
    import { goto } from '$app/navigation';

    // Define types for day and time slot
    type DayOfWeek = string;
    type TimeSlot = string;

    let loading = true;
    let saving = false;
    let error: string | null = null;
    let success: string | null = null;
    let teachers: User[] = [];
    let selectedTeacherId = '';
    let availability: TeacherAvailability[] = [];
    let availabilityMap: Record<DayOfWeek, Record<TimeSlot, boolean>> = {};

    // Initialize availability map with all time slots for all days
    function initializeAvailabilityMap() {
        const map: Record<DayOfWeek, Record<TimeSlot, boolean>> = {};
        
        DAYS_OF_WEEK.forEach(day => {
            map[day.value] = {};
            TIME_SLOTS.forEach(timeSlot => {
                map[day.value][timeSlot.value] = false;
            });
        });
        
        return map;
    }

    onMount(async () => {
        try {
            // Check if user is admin or teacher
            if (!$userStore.user) {
                goto('/login');
                return;
            }
            
            if ($userStore.user.role === 'TEACHER') {
                selectedTeacherId = $userStore.user.$id;
                await loadTeacherAvailability(selectedTeacherId);
            } else if ($userStore.user.role === 'ADMIN') {
                // Load all teachers for admin
                teachers = await authService.getTeachers();
                if (teachers.length > 0) {
                    selectedTeacherId = teachers[0].$id;
                    await loadTeacherAvailability(selectedTeacherId);
                }
            } else {
                error = 'You do not have permission to access this page';
            }
        } catch (err: any) {
            console.error('Error loading availability:', err);
            error = err.message || 'Failed to load availability';
        } finally {
            loading = false;
        }
    });

    async function loadTeacherAvailability(teacherId: string) {
        try {
            loading = true;
            error = null;
            success = null;
            
            // Initialize empty availability map
            availabilityMap = initializeAvailabilityMap();
            
            // Load teacher's availability
            const availabilityData = await teacherAvailabilityService.getTeacherAvailability(teacherId);
            availability = Array.isArray(availabilityData) ? availabilityData : [];
            
            // Populate availability map
            availability.forEach(slot => {
                if (slot.dayOfWeek && slot.timeSlot) {
                    availabilityMap[slot.dayOfWeek][slot.timeSlot] = true;
                }
            });
        } catch (err: any) {
            console.error('Error loading teacher availability:', err);
            error = err.message || 'Failed to load teacher availability';
        } finally {
            loading = false;
        }
    }

    async function handleTeacherChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        selectedTeacherId = select.value;
        await loadTeacherAvailability(selectedTeacherId);
    }

    function toggleTimeSlot(day: DayOfWeek, timeSlot: TimeSlot) {
        availabilityMap[day][timeSlot] = !availabilityMap[day][timeSlot];
    }

    async function saveAvailability() {
        try {
            saving = true;
            error = null;
            success = null;
            
            // Convert availability map to array of availability objects
            const availabilityArray: Partial<TeacherAvailability>[] = [];
            
            Object.entries(availabilityMap).forEach(([day, slots]) => {
                Object.entries(slots).forEach(([timeSlot, isAvailable]) => {
                    if (isAvailable) {
                        availabilityArray.push({
                            teacherId: selectedTeacherId,
                            dayOfWeek: day,
                            timeSlot: timeSlot
                        });
                    }
                });
            });
            
            // Save availability
            await teacherAvailabilityService.updateAvailability(selectedTeacherId, availabilityArray);
            
            success = 'Availability saved successfully';
        } catch (err: any) {
            console.error('Error saving availability:', err);
            error = err.message || 'Failed to save availability';
        } finally {
            saving = false;
        }
    }
</script>

<div class="container max-w-5xl py-6 mx-auto space-y-6">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 class="text-3xl font-bold tracking-tight">Teacher Availability</h1>
        <Button on:click={saveAvailability} disabled={saving || loading} class="w-full gap-2 sm:w-auto">
            {#if saving}
                <Loader2 class="w-4 h-4 animate-spin" />
                Saving...
            {:else}
                <Save class="w-4 h-4" />
                Save Availability
            {/if}
        </Button>
    </div>

    {#if error}
        <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    {/if}

    {#if success}
        <Alert variant="default" class="text-green-800 border-green-200 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30">
            <AlertDescription>{success}</AlertDescription>
        </Alert>
    {/if}

    {#if $userStore.user && $userStore.user.role === 'ADMIN'}
        <div class="mb-6">
            <label for="teacher-select" class="block mb-2 text-sm font-medium">Select Teacher</label>
            <select 
                id="teacher-select" 
                class="w-full px-3 py-2 text-sm border rounded-md border-input bg-background ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={selectedTeacherId}
                on:change={handleTeacherChange}
                disabled={loading}
            >
                {#each teachers as teacher}
                    <option value={teacher.$id}>{teacher.name}</option>
                {/each}
            </select>
        </div>
    {/if}

    {#if loading}
        <div class="flex items-center justify-center py-12">
            <Loader2 class="w-8 h-8 animate-spin text-primary" />
        </div>
    {:else}
        <Card class="p-4 sm:p-6">
            <h2 class="flex items-center mb-4 text-xl font-semibold">
                <Calendar class="w-5 h-5 mr-2 text-primary" />
                Weekly Availability
            </h2>
            <p class="mb-6 text-sm text-muted-foreground">
                Select the time slots when you are available to teach. Click on a cell to toggle availability.
            </p>

            <div class="-mx-4 overflow-x-auto sm:mx-0">
                <div class="min-w-[640px] px-4 sm:px-0">
                    <table class="w-full border-collapse">
                        <thead>
                            <tr>
                                <th class="p-2 font-medium text-left border bg-muted">Time</th>
                                {#each DAYS_OF_WEEK as day}
                                    <th class="p-2 font-medium text-center border bg-muted">
                                        {day.label}
                                    </th>
                                {/each}
                            </tr>
                        </thead>
                        <tbody>
                            {#each TIME_SLOTS as timeSlot}
                                <tr>
                                    <td class="p-2 text-sm font-medium border">
                                        {timeSlot.label}
                                    </td>
                                    {#each DAYS_OF_WEEK as day}
                                        <td class="p-1 text-center border">
                                            <button
                                                type="button"
                                                class="w-full h-8 rounded transition-colors {availabilityMap[day.value][timeSlot.value] ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}"
                                                on:click={() => toggleTimeSlot(day.value, timeSlot.value)}
                                                aria-label="{availabilityMap[day.value][timeSlot.value] ? 'Available' : 'Not available'} on {day.label} at {timeSlot.label}"
                                            >
                                                {#if availabilityMap[day.value][timeSlot.value]}
                                                    <Clock class="w-4 h-4 mx-auto" />
                                                {/if}
                                            </button>
                                        </td>
                                    {/each}
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-4 mt-6">
                <div class="flex items-center">
                    <div class="w-4 h-4 mr-2 rounded bg-primary"></div>
                    <span class="text-sm">Available</span>
                </div>
                <div class="flex items-center">
                    <div class="w-4 h-4 mr-2 border rounded bg-background"></div>
                    <span class="text-sm">Unavailable</span>
                </div>
            </div>
        </Card>
    {/if}
</div> 