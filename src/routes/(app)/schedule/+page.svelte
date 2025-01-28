<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Calendar } from '$lib/components/ui/calendar';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Icons from 'lucide-svelte';

  let date = new Date();
  let view: 'day' | 'week' | 'month' = 'week';

  function handleDateSelect(value: Date | undefined) {
    if (value) {
      date = value;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="space-y-1">
      <h2 class="text-2xl font-semibold tracking-tight">Schedule</h2>
      <p class="text-sm text-muted-foreground">
        View and manage your timetable efficiently.
      </p>
    </div>
    <div class="flex items-center space-x-2">
      <Button variant="outline" size="sm">
        <Icons.Download class="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button size="sm">
        <Icons.Plus class="mr-2 h-4 w-4" />
        Add Event
      </Button>
    </div>
  </div>

  <div class="grid gap-6 md:grid-cols-[200px_1fr]">
    <!-- Sidebar -->
    <Card class="p-4 space-y-4">
      <div class="space-y-2">
        <Label for="view">View</Label>
        <select
          id="view"
          bind:value={view}
          class="w-full flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>

      <div class="space-y-2">
        <Label>Quick Jump</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-md border"
        />
      </div>

      <div class="space-y-2">
        <Label>Filter</Label>
        <div class="space-y-2">
          <label class="flex items-center space-x-2">
            <Input type="checkbox" class="h-4 w-4" checked />
            <span class="text-sm">Classes</span>
          </label>
          <label class="flex items-center space-x-2">
            <Input type="checkbox" class="h-4 w-4" checked />
            <span class="text-sm">Meetings</span>
          </label>
          <label class="flex items-center space-x-2">
            <Input type="checkbox" class="h-4 w-4" checked />
            <span class="text-sm">Events</span>
          </label>
        </div>
      </div>
    </Card>

    <!-- Calendar -->
    <Card class="p-4">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <Icons.ChevronLeft class="h-4 w-4" />
          </Button>
          <h3 class="text-lg font-semibold">March 2024</h3>
          <Button variant="outline" size="icon">
            <Icons.ChevronRight class="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" class="ml-4">
          Today
        </Button>
      </div>

      <!-- Week View -->
      <div class="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
        {#each Array(7) as _, i}
          <div class="bg-card p-2 text-center text-sm font-medium">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
          </div>
        {/each}
        {#each Array(24) as _, hour}
          {#each Array(7) as _, day}
            <div class="bg-card p-2 min-h-[100px] border-t">
              {#if hour === 0}
                <div class="text-xs text-muted-foreground mb-1">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              {/if}
              <!-- Example Event -->
              {#if hour === 10 && day === 1}
                <div class="bg-primary/10 text-primary rounded p-1 text-xs">
                  Mathematics
                  <div class="text-xs text-muted-foreground">Room 101</div>
                </div>
              {/if}
            </div>
          {/each}
        {/each}
      </div>
    </Card>
  </div>
</div> 