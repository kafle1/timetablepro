<script lang="ts">
    import { cn } from '$lib/utils';

    export let value = '';
    export let placeholder: string | undefined = undefined;
    export let disabled = false;
    export let required = false;
    export let readonly = false;
    export let className: string | undefined = undefined;
    export let name: string | undefined = undefined;
    export let id: string | undefined = undefined;
    export let rows = 3;
    export let minlength: number | undefined = undefined;
    export let maxlength: number | undefined = undefined;
    export let resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical';
    export let autosize = false;

    let textarea: HTMLTextAreaElement;

    function adjustHeight() {
        if (autosize && textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }

    $: if (value && autosize) {
        setTimeout(adjustHeight, 0);
    }
</script>

<textarea
    bind:this={textarea}
    bind:value
    {name}
    {id}
    {placeholder}
    {disabled}
    {required}
    {readonly}
    {rows}
    {minlength}
    {maxlength}
    class={cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
    )}
    style={`resize: ${resize};`}
    on:blur
    on:change
    on:click
    on:focus
    on:keydown
    on:keypress
    on:keyup
    on:input={autosize ? adjustHeight : undefined}
    {...$$restProps}
/> 