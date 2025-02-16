<!-- src/routes/(app)/teachers/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { teacherStore, type Teacher } from '$lib/stores/teacher';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card } from '$lib/components/ui/card';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
    import { AlertCircle, Pencil, Clock } from 'lucide-svelte';
    import { hasPermission, PERMISSIONS } from '$lib/utils/roles';
    import { authStore } from '$lib/stores/auth';
    import { getTimeSlots } from '$lib/utils/date';

    let loading = false;
    let showEditDialog = false;
    let showAvailabilityDialog = false;
    let selectedTeacher: Teacher | null = null;
    let formData = {
        name: '',
        subjects: [] as string[]
    };

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
    ];

    const timeSlots = getTimeSlots('08:00', '18:00', 60);

    let availabilityData: {
        dayOfWeek: string;
        timeSlots: string[];
    }[] = [];

    $: userRole = $authStore.user?.prefs?.userRole || 'student';
    $: canManageTeachers = hasPermission(userRole, PERMISSIONS.MANAGE_TEACHERS);

    onMount(() => {
        teacherStore.fetchTeachers();
    });

    function handleEdit(teacher: Teacher) {
        selectedTeacher = teacher;
        formData = {
            name: teacher.name,
            subjects: teacher.subjects || []
        };
        showEditDialog = true;
    }

    async function handleEditSubmit() {
        if (!selectedTeacher) return;

        loading = true;
        try {
            await teacherStore.updateTeacher(selectedTeacher.$id, formData);
            showEditDialog = false;
        } catch (error) {
            console.error('Update teacher failed:', error);
        } finally {
            loading = false;
        }
    }

    async function handleAvailability(teacher: Teacher) {
        selectedTeacher = teacher;
        loading = true;
        try {
            const availability = await teacherStore.getTeacherAvailability(teacher.$id);
            availabilityData = availability.length ? availability : daysOfWeek.map(day => ({
                dayOfWeek: day,
                timeSlots: []
            }));
            showAvailabilityDialog = true;
        } catch (error) {
            console.error('Fetch availability failed:', error);
        } finally {
            loading = false;
        }
    }

    async function handleAvailabilitySubmit() {
        if (!selectedTeacher) return;

        loading = true;
        try {
            await teacherStore.updateTeacherAvailability(selectedTeacher.$id, availabilityData);
            showAvailabilityDialog = false;
        } catch (error) {
            console.error('Update availability failed:', error);
        } finally {
            loading = false;
        }
    }

    function toggleTimeSlot(day: string, timeSlot: string) {
        const dayData = availabilityData.find(d => d.dayOfWeek === day);
        if (!dayData) return;

        const index = dayData.timeSlots.indexOf(timeSlot);
        if (index === -1) {
            dayData.timeSlots.push(timeSlot);
        } else {
            dayData.timeSlots.splice(index, 1);
        }
        availabilityData = [...availabilityData];
    }

    function handleSubjectsInput(event: Event) {
        const input = event.target as HTMLInputElement;
        formData.subjects = input.value.split(',').map(s => s.trim()).filter(Boolean);
    }
</script>

<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Teachers</h1>
            <p class="text-muted-foreground mt-2">Manage teacher information and availability</p>
        </div>
    </div>

    {#if $teacherStore.error}
        <Alert variant="destructive" class="mb-8">
            <AlertCircle class="w-4 h-4" />
            <AlertDescription>{$teacherStore.error}</AlertDescription>
        </Alert>
    {/if}

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each $teacherStore.teachers as teacher}
            <Card class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">{teacher.name}</h3>
                        <p class="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                    {#if canManageTeachers}
                        <div class="flex gap-2">
                            <Button variant="ghost" size="icon" on:click={() => handleEdit(teacher)}>
                                <Pencil class="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" on:click={() => handleAvailability(teacher)}>
                                <Clock class="w-4 h-4" />
                            </Button>
                        </div>
                    {/if}
                </div>
                {#if teacher.subjects?.length}
                    <div class="flex flex-wrap gap-2">
                        {#each teacher.subjects as subject}
                            <span class="px-2 py-1 bg-muted rounded-md text-sm">
                                {subject}
                            </span>
                        {/each}
                    </div>
                {/if}
            </Card>
        {/each}
    </div>
</div>

<!-- Edit Teacher Dialog -->
<Dialog bind:open={showEditDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
                Update teacher information below.
            </DialogDescription>
        </DialogHeader>
        <form on:submit|preventDefault={handleEditSubmit} class="space-y-4">
            <div class="grid gap-4">
                <div class="grid gap-2">
                    <Label for="name">Full Name</Label>
                    <Input
                        id="name"
                        bind:value={formData.name}
                        required
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="subjects">Subjects (comma-separated)</Label>
                    <Input
                        id="subjects"
                        value={formData.subjects.join(', ')}
                        on:input={handleSubjectsInput}
                        placeholder="Math, Science, History"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" on:click={() => showEditDialog = false}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </DialogFooter>
        </form>
    </DialogContent>
</Dialog>

<!-- Availability Dialog -->
<Dialog bind:open={showAvailabilityDialog}>
    <DialogContent class="max-w-3xl">
        <DialogHeader>
            <DialogTitle>Teacher Availability</DialogTitle>
            <DialogDescription>
                Set {selectedTeacher?.name}'s available time slots for each day.
            </DialogDescription>
        </DialogHeader>
        <div class="grid gap-6">
            {#each availabilityData as day}
                <div>
                    <h4 class="font-medium mb-2">{day.dayOfWeek}</h4>
                    <div class="flex flex-wrap gap-2">
                        {#each timeSlots as timeSlot}
                            <button
                                type="button"
                                class="px-3 py-1 text-sm rounded-md transition-colors {day.timeSlots.includes(timeSlot) ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}"
                                on:click={() => toggleTimeSlot(day.dayOfWeek, timeSlot)}
                            >
                                {timeSlot}
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
        <DialogFooter>
            <Button type="button" variant="outline" on:click={() => showAvailabilityDialog = false}>
                Cancel
            </Button>
            <Button on:click={handleAvailabilitySubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog> 