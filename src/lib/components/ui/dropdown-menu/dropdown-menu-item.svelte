<!-- src/lib/components/ui/dropdown-menu/dropdown-menu-item.svelte -->
<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import { cn } from "$lib/utils";

    type $$Props = DropdownMenu.ItemProps;
    type $$Events = DropdownMenu.ItemEvents;

    let className: $$Props["class"] = undefined;
    export { className as class };
</script>

<DropdownMenu.Item
    class={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
    )}
    {...$$restProps}
    on:click
    on:keydown
    on:focusin
    on:focusout
    on:pointerdown
    on:pointerleave
    on:pointermove
>
    <slot />
</DropdownMenu.Item> 