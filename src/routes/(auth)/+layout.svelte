<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // Unregister service worker during auth to prevent issues
  onMount(async () => {
    // Only execute in browser
    if (!browser) return;

    // Unregister existing service workers to avoid cached issues during auth
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.debug('Service worker unregistered during auth');
        }
      } catch (error) {
        console.error('Failed to unregister service worker:', error);
      }
    }
  });
</script>

<div class="min-h-screen">
  <slot />
</div>

<style>
  :global(body) {
    @apply bg-background;
  }
</style> 