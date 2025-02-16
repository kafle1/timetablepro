<script lang="ts">
    import { cn } from '$lib/utils';

    export let size: 'sm' | 'md' | 'lg' = 'md';
    export let color: 'primary' | 'secondary' | 'white' = 'primary';

    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-6 w-6 border-2',
        lg: 'h-8 w-8 border-3'
    };

    const colorClasses = {
        primary: 'border-primary border-t-transparent',
        secondary: 'border-secondary border-t-transparent',
        white: 'border-white border-t-transparent'
    };
</script>

<div
    class={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        colorClasses[color]
    )}
    role="status"
    aria-label="Loading"
>
    <span class="sr-only">Loading...</span>
</div> 