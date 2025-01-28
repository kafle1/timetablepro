<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";

	type T = $$Generic;
	type $$Props = SelectPrimitive.Props<T>;

	export let selected: T | undefined = undefined;
	export let onSelectedChange: ((value: T | undefined) => void) | undefined = undefined;
	export let defaultSelected: T | undefined = undefined;
	export let placeholder: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let disabled: boolean = false;
	export let required: boolean = false;
</script>

<SelectPrimitive.Root<T>
	{selected}
	{onSelectedChange}
	defaultSelected={defaultSelected}
	{placeholder}
	{name}
	{disabled}
	{required}
	{...$$restProps}
>
	<slot />
</SelectPrimitive.Root> 
