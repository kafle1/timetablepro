<script lang="ts">
	import '../app.css';
	import { onMount, onDestroy } from 'svelte';
	import { userStore } from '$lib/stores/user';
	import { Toasts } from "$lib/components/ui/toast";
	import { browser } from '$app/environment';
	import { navigating } from '$app/stores';

	let mounted = false;
	let sessionInitialized = false;
	let destroyed = false;
	let navAborter: AbortController | null = null;

	// Initialize authentication on mount
	onMount(async () => {
		mounted = true;
		
		// Clean up any previous navigation attempts
		if (navAborter) {
			navAborter.abort();
			navAborter = null;
		}
		
		if (browser && !sessionInitialized && !destroyed) {
			try {
				// Create an abort controller for this operation
				navAborter = new AbortController();
				const signal = navAborter.signal;
				
				// Initialize the user store
				sessionInitialized = true;
				const userInitPromise = userStore.init();
				
				// Set up a way to cancel this operation
				signal.addEventListener('abort', () => {
					console.log('Auth check aborted due to navigation or component destruction');
				});
				
				// Only proceed if not aborted and component still mounted
				if (!signal.aborted && !destroyed) {
					await userInitPromise;
				}
			} catch (error) {
				console.error("Error initializing session:", error);
				
				// Ensure we clean up on errors
				if (browser && !destroyed) {
					try {
						localStorage.removeItem('cookieFallback');
					} catch (e) {
						console.error("Error clearing localStorage:", e);
					}
				}
			}
		}
	});
	
	// Handle navigation events
	$: if ($navigating && navAborter) {
		// Cancel any in-flight authentication operations when navigating
		navAborter.abort();
		navAborter = null;
	}
	
	// Clean up on component destruction
	onDestroy(() => {
		destroyed = true;
		if (navAborter) {
			navAborter.abort();
			navAborter = null;
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
