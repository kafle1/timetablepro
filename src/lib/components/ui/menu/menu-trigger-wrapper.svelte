<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    
    type $$Props = HTMLAttributes<HTMLButtonElement> & {
        asChild?: boolean;
    };
    
    export let asChild = true;
</script>

<button type="button" {...$$restProps}>
    <slot />
</button> 