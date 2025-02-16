<script lang="ts">
  import { cn } from '$lib/utils';
  import Spinner from './Spinner.svelte';

  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'default';
  export let size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  export let className = '';
  export let disabled = false;
  export let loading = false;

  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline'
  };

  const sizeStyles = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  };

  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
</script>

<button
  {type}
  class={cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  )}
  {disabled}
  on:click
  on:focus
  on:blur
  on:mouseenter
  on:mouseleave
>
  {#if loading}
    <Spinner
      size="sm"
      className="mr-2"
    />
  {/if}
  <slot />
</button> 