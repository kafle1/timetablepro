<!-- src/lib/components/ui/avatar/avatar-image.svelte -->
<script lang="ts">
    import { Avatar as AvatarPrimitive } from "bits-ui";
    import { cn } from "$lib/utils";

    type $$Props = AvatarPrimitive.ImageProps;

    let className: $$Props["class"] = undefined;
    export { className as class };
</script>

<AvatarPrimitive.Image
    class={cn("aspect-square h-full w-full", className)}
    {...$$restProps}
/> 