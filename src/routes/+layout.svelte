<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import { Toasts } from "$lib/components/ui/toast";
	import { browser } from '$app/environment';

	// Initialize authentication on mount
	onMount(() => {
		if (browser) {
			// Check for existing session
			authStore.checkSession();
		}
	});
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
