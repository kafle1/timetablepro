<!-- src/lib/components/ui/dropdown-menu/dropdown-menu-label.svelte -->
<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import { cn } from "$lib/utils";

    type $$Props = DropdownMenu.LabelProps;

    let className: $$Props["class"] = undefined;
    export { className as class };
</script>

<DropdownMenu.Label
    class={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...$$restProps}
>
    <slot />
</DropdownMenu.Label> 