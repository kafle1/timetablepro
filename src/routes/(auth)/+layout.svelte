<script lang="ts">
  import { onMount } from 'svelte';
  import { navigating, page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { ROUTES } from '$lib/config';
  import { authService } from '$lib/services/auth';
  import { browser } from '$app/environment';

  // Redirect param
  export let data;
  
  // Optional redirect path
  let redirectTo = $page.url.searchParams.get('redirect') || null;
  
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

    // Check if user is already authenticated
    const currentUser = await authService.getCurrentUser();
    
    // If user is already logged in and trying to access login/register
    // redirect to appropriate dashboard
    if (currentUser) {
      const isAuthRoute = $page.url.pathname === ROUTES.LOGIN || 
                          $page.url.pathname === ROUTES.REGISTER;
      
      if (isAuthRoute) {
        // Get dashboard based on user role
        let dashboardRoute;
        switch (currentUser.role) {
          case 'ADMIN':
            dashboardRoute = ROUTES.ADMIN_DASHBOARD;
            break;
          case 'TEACHER':
            dashboardRoute = ROUTES.TEACHER_DASHBOARD;
            break;
          default:
            dashboardRoute = ROUTES.STUDENT_DASHBOARD;
            break;
        }
        
        // Redirect to dashboard or specified redirect path
        if (redirectTo) {
          await goto(redirectTo);
        } else {
          await goto(dashboardRoute);
        }
      }
    }
  });

  // Show loading state
  $: loading = !!$navigating;
</script>

{#if loading}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
  </div>
{/if}

<div class="min-h-screen">
  <slot />
</div>

<style>
  :global(body) {
    @apply bg-background;
  }
</style> 