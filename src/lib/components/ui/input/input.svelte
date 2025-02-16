<script lang="ts">
	import { cn } from '$lib/utils';

	export let type: HTMLInputElement['type'] = 'text';
	export let value: string | number = '';
	export let placeholder: string | undefined = undefined;
	export let disabled = false;
	export let required = false;
	export let readonly = false;
	export let className: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let id: string | undefined = undefined;
	export let autocomplete: string | undefined = undefined;
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step: number | undefined = undefined;
	export let pattern: string | undefined = undefined;
	export let minlength: number | undefined = undefined;
	export let maxlength: number | undefined = undefined;

	let input: HTMLInputElement;

	export function focus() {
		input?.focus();
	}

	export function select() {
		input?.select();
	}

	export function setSelectionRange(start: number, end: number) {
		input?.setSelectionRange(start, end);
	}

	export function setRangeText(
		replacement: string,
		start?: number,
		end?: number,
		selectMode?: 'select' | 'start' | 'end' | 'preserve'
	) {
		input?.setRangeText(replacement, start, end, selectMode);
	}
</script>

<input
	bind:this={input}
	{type}
	bind:value
	{name}
	{id}
	{placeholder}
	{disabled}
	{required}
	{readonly}
	{autocomplete}
	{min}
	{max}
	{step}
	{pattern}
	{minlength}
	{maxlength}
	class={cn(
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	on:blur
	on:change
	on:click
	on:focus
	on:keydown
	on:keypress
	on:keyup
	on:mouseenter
	on:mouseleave
	{...$$restProps}
/>
