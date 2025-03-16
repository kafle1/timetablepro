<script lang="ts">
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ROUTES, USER_ROLES } from '$lib/config';

  onMount(() => {
    if ($userStore && $userStore.user) {
      switch ($userStore.user.role) {
        case USER_ROLES.ADMIN:
          goto(ROUTES.ADMIN_DASHBOARD);
          break;
        case USER_ROLES.TEACHER:
          goto(ROUTES.TEACHER_DASHBOARD);
          break;
        case USER_ROLES.STUDENT:
          goto(ROUTES.STUDENT_DASHBOARD);
          break;
      }
    }
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