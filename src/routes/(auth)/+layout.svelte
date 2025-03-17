<script lang="ts">
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ROUTES, USER_ROLES } from '$lib/config';

  onMount(() => {
    console.log('UI Testing Mode - No Redirection in Auth Layout');
  });

  $: isAuthCallback = $page.url.pathname === '/auth/callback';
</script>

<div class="min-h-screen bg-background bg-gradient-to-b from-background to-muted/20">
  <slot />
</div>

<style>
  :global(body) {
    @apply bg-background;
  }
</style> 