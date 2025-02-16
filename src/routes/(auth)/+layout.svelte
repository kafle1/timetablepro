<script lang="ts">
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import { userStore } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { ROUTES, USER_ROLES } from '$lib/config';

  onMount(() => {
    if ($userStore) {
      switch ($userStore.role) {
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

<div class="flex min-h-screen">
  <!-- Left: Auth Form -->
  <div class="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
    <div class="w-full max-w-sm mx-auto">
      {#if !isAuthCallback}
        <div class="flex flex-col mb-8 space-y-4 text-center">
          <a href="/" class="mx-auto">
            <h1 class="text-2xl font-bold tracking-tight">
              <span class="text-primary">Timetable</span>Pro
            </h1>
          </a>
          <p class="text-sm text-muted-foreground">
            {#if $page.url.pathname === ROUTES.LOGIN}
              Welcome back! Please login to your account.
            {:else if $page.url.pathname === ROUTES.REGISTER}
              Create an account to get started.
            {/if}
          </p>
        </div>
      {/if}
      
      <slot />
    </div>
  </div>

  <!-- Right: Hero Image -->
  {#if !isAuthCallback}
    <div class="hidden lg:flex-1 lg:flex lg:flex-col lg:relative">
      <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10"></div>
      <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div class="relative flex flex-col justify-center flex-1 px-12" in:fade={{ duration: 300 }}>
        <div class="max-w-lg mx-auto space-y-8 text-center">
          <h2 class="text-4xl font-bold tracking-tight text-gray-900">
            {#if $page.url.pathname === ROUTES.LOGIN}
              Welcome back to TimetablePro
            {:else if $page.url.pathname === ROUTES.REGISTER}
              Join TimetablePro Today
            {/if}
          </h2>
          <p class="text-lg text-gray-600">
            {#if $page.url.pathname === ROUTES.LOGIN}
              Streamline your scheduling process with intelligent timetable management.
            {:else if $page.url.pathname === ROUTES.REGISTER}
              Create smarter schedules with our intelligent timetable management system.
            {/if}
          </p>
          <div class="relative w-full aspect-[4/3] max-w-lg mx-auto">
            <img 
              src={$page.url.pathname === ROUTES.LOGIN ? '/auth-illustration-login.svg' : '/auth-illustration-register.svg'} 
              alt="Authentication" 
              class="absolute inset-0 object-contain w-full h-full animate-float drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      <footer class="relative py-6 text-sm text-center text-gray-500 bg-white/5 backdrop-blur-sm">
        © {new Date().getFullYear()} TimetablePro. All rights reserved.
      </footer>
    </div>
  {/if}
</div>

<style>
  .bg-grid-pattern {
    background-image: 
      linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
</style> 