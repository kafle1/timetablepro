<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	type SelectValue = string | number | null;

	export let selected: SelectValue = null;
	export let onSelectedChange: ((value: SelectValue) => void) | undefined = undefined;
	export let disabled: boolean = false;
</script>

<SelectPrimitive.Root
	selected={selected}
	onSelectedChange={onSelectedChange}
	{disabled}
	{...$$restProps}
>
	<slot />
</SelectPrimitive.Root> 
