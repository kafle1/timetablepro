<!-- src/routes/(dashboard)/dashboard/availability/+page.svelte -->
<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import { Label } from '$lib/components/ui/label';
    import { Save } from 'lucide-svelte';

    type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    type TimeSlot = `${number}:00`;
    type Availability = Record<WeekDay, TimeSlot[]>;

    const weekDays: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots: TimeSlot[] = Array.from({ length: 9 }, (_, i) => `${i + 9}:00` as TimeSlot);

    // Mock data - replace with actual data from your Appwrite database
    let availability: Availability = {
        Monday: ['9:00', '10:00', '11:00'],
        Tuesday: ['9:00', '13:00', '14:00'],
        Wednesday: ['11:00', '12:00'],
        Thursday: ['9:00', '10:00', '15:00'],
        Friday: ['13:00', '14:00', '15:00']
    };

    function isAvailable(day: WeekDay, time: TimeSlot): boolean {
        return availability[day]?.includes(time) || false;
    }

    function toggleAvailability(day: WeekDay, time: TimeSlot): void {
        if (isAvailable(day, time)) {
            availability[day] = availability[day].filter((t: TimeSlot) => t !== time);
        } else {
            availability[day] = [...(availability[day] || []), time];
        }
        availability = { ...availability }; // Trigger reactivity
    }

    function handleSave(): void {
        // Implement save logic to Appwrite
        console.log('Saving availability:', availability);
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Availability</h1>
            <p class="text-muted-foreground">Set your teaching availability for the week.</p>
        </div>
        <Button on:click={handleSave}>
            <Save class="mr-2 h-4 w-4" />
            Save Changes
        </Button>
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
                            <div class="flex justify-center items-center">
                                <div class="flex items-center space-x-2">
                                    <Checkbox
                                        id="{day}-{time}"
                                        checked={isAvailable(day, time)}
                                        on:change={() => toggleAvailability(day, time)}
                                    />
                                    <Label
                                        for="{day}-{time}"
                                        class="sr-only"
                                    >
                                        Available on {day} at {time}
                                    </Label>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </Card>

    <div class="text-sm text-muted-foreground">
        <p>Check the boxes to indicate when you're available to teach.</p>
        <p>Your availability will be considered when creating the school timetable.</p>
    </div>
</div> 