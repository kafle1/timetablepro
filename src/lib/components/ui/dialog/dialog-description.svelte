<script lang="ts">
	import { Dialog } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = Dialog.DescriptionProps;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<Dialog.Description
	class={cn("text-sm text-muted-foreground", className)}
	{...$$restProps}
>
	<slot />
</Dialog.Description>
