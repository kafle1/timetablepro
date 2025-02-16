<script lang="ts">
	import { cn } from '$lib/utils';
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { type Events, type Props, buttonVariants } from "./index.js";

	type $$Props = Props;
	type $$Events = Events;

	let className: $$Props["class"] = undefined;
	export let variant: $$Props["variant"] = "default";
	export let size: $$Props["size"] = "default";
	export let type: $$Props["type"] = "button";
	export { className as class };
</script>

<ButtonPrimitive.Root
	{type}
	class={cn(buttonVariants({ variant, size }), className)}
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</ButtonPrimitive.Root>
