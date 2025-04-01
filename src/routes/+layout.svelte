<script lang="ts">
	import '../app.css';
	import { onDestroy } from 'svelte';
	import { Toasts } from "$lib/components/ui/toast";
	import { browser } from '$app/environment';
</script>

<div class="min-h-screen bg-background text-foreground">
	<main>
		<slot />
	</main>
</div>

<!-- Toast notifications -->
<Toasts position="top-right" />

<style>
	:global(body) {
		@apply bg-background text-foreground antialiased;
	}

	:global(.dark) {
		color-scheme: dark;
	}
</style>
