<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { Check } from "lucide-svelte";

	let className: string | undefined = undefined;
	export let value: any;
	export { className as class };
</script>

<SelectPrimitive.Item
	class={cn(
		"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		className
	)}
	{value}
	{...$$restProps}
>
	<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
		<SelectPrimitive.ItemIndicator>
			<Check class="w-4 h-4" />
		</SelectPrimitive.ItemIndicator>
	</span>
	<slot />
</SelectPrimitive.Item>
