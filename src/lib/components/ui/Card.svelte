<script lang="ts">
  import { cn } from '$lib/utils';

  export let className = '';
</script>

<div class={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
  <slot />
</div>

<script context="module">
  import CardHeader from './CardHeader.svelte';
  import CardTitle from './CardTitle.svelte';
  import CardDescription from './CardDescription.svelte';
  import CardContent from './CardContent.svelte';
  import CardFooter from './CardFooter.svelte';

  export {
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
  };
</script> 