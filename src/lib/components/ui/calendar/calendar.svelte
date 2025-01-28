<script lang="ts">
  import { cn } from '$lib/utils';
  import * as Icons from 'lucide-svelte';
  import { Button } from '../button';

  export let selected: Date | undefined = undefined;
  export let mode: 'single' | 'multiple' | 'range' = 'single';
  export let className: string | undefined = undefined;
  export let onSelect: (date: Date) => void = () => {};

  let currentMonth = new Date();

  function previousMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  }

  function nextMonth() {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  }

  function isSelected(date: Date) {
    if (!selected) return false;
    return date.toDateString() === selected.toDateString();
  }

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  $: year = currentMonth.getFullYear();
  $: month = currentMonth.getMonth();
  $: daysInMonth = getDaysInMonth(year, month);
  $: firstDay = getFirstDayOfMonth(year, month);
</script>

<div class={cn("p-3", className)}>
  <div class="flex justify-between items-center mb-4">
    <Button
      variant="ghost"
      size="icon"
      on:click={previousMonth}
    >
      <Icons.ChevronLeft class="h-4 w-4" />
    </Button>
    <h2 class="font-semibold">
      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
    </h2>
    <Button
      variant="ghost"
      size="icon"
      on:click={nextMonth}
    >
      <Icons.ChevronRight class="h-4 w-4" />
    </Button>
  </div>

  <div class="grid grid-cols-7 gap-1 text-center text-sm mb-2">
    {#each ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as day}
      <div class="text-muted-foreground">{day}</div>
    {/each}
  </div>

  <div class="grid grid-cols-7 gap-1">
    {#each Array(firstDay) as _}
      <div />
    {/each}
    {#each Array(daysInMonth) as _, i}
      {@const date = new Date(year, month, i + 1)}
      <Button
        variant="ghost"
        size="icon"
        class={cn(
          "h-9 w-9",
          isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          date.toDateString() === new Date().toDateString() && "bg-muted"
        )}
        on:click={() => onSelect(date)}
      >
        {i + 1}
      </Button>
    {/each}
  </div>
</div> 
