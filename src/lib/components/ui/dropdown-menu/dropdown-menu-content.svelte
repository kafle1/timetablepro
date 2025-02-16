<!-- src/lib/components/ui/dropdown-menu/dropdown-menu-content.svelte -->
<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import { cn } from "$lib/utils";
    import { scale } from "svelte/transition";
    import { quadOut } from "svelte/easing";

    type $$Props = DropdownMenu.ContentProps;
    type $$Events = DropdownMenu.ContentEvents;

    let className: $$Props["class"] = undefined;
    export { className as class };
</script>

<div
    in:scale={{ duration: 200, easing: quadOut }}
>
    <DropdownMenu.Content
        class={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
            className
        )}
        {...$$restProps}
        on:keydown
    >
        <slot />
    </DropdownMenu.Content>
</div> 