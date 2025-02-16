<!-- src/lib/components/ui/dropdown-menu/dropdown-menu-separator.svelte -->
<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import { cn } from "$lib/utils";

    type $$Props = DropdownMenu.SeparatorProps;

    let className: $$Props["class"] = undefined;
    export { className as class };
</script>

<DropdownMenu.Separator
    class={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...$$restProps}
/> 