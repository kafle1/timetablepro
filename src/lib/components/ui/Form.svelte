<script>
  import { cn } from '$lib/utils';
  export let className = '';
</script>

<form class={cn('space-y-6', className)} {...$$restProps}>
  <slot />
</form>

<script context="module">
  import FormField from './FormField.svelte';
  import FormLabel from './FormLabel.svelte';
  import FormControl from './FormControl.svelte';
  import FormDescription from './FormDescription.svelte';
  import FormMessage from './FormMessage.svelte';

  export {
    FormField,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage
  };
</script> 