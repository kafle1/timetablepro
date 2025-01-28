<script lang="ts">
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
</script>

<div class="min-h-screen flex">
  <!-- Left: Auth Form -->
  <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
    <div class="mx-auto w-full max-w-sm">
      <div class="flex flex-col space-y-4 text-center mb-8">
        <a href="/" class="mx-auto">
          <h1 class="text-2xl font-bold tracking-tight">
            <span class="text-primary">Timetable</span>Pro
          </h1>
        </a>
        <p class="text-sm text-muted-foreground">
          {#if $page.url.pathname === '/login'}
            Welcome back! Please login to your account.
          {:else if $page.url.pathname === '/register'}
            Create an account to get started.
          {/if}
        </p>
      </div>
      
      <slot />
    </div>
  </div>

  <!-- Right: Hero Image -->
  <div class="hidden lg:flex-1 lg:flex lg:flex-col lg:relative">
    <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10" />
    <div class="absolute inset-0 bg-grid-pattern opacity-10" />
    
    <div class="relative flex-1 flex flex-col justify-center px-12" in:fade={{ duration: 300 }}>
      <div class="max-w-lg mx-auto text-center space-y-8">
        <h2 class="text-4xl font-bold tracking-tight text-gray-900">
          {#if $page.url.pathname === '/login'}
            Welcome back to TimetablePro
          {:else if $page.url.pathname === '/register'}
            Join TimetablePro Today
          {/if}
        </h2>
        <p class="text-lg text-gray-600">
          {#if $page.url.pathname === '/login'}
            Streamline your scheduling process with intelligent timetable management.
          {:else if $page.url.pathname === '/register'}
            Create smarter schedules with our intelligent timetable management system.
          {/if}
        </p>
        <div class="relative w-full aspect-[4/3] max-w-lg mx-auto">
          <img 
            src={$page.url.pathname === '/login' ? '/auth-illustration-login.svg' : '/auth-illustration-register.svg'} 
            alt="Authentication" 
            class="absolute inset-0 w-full h-full object-contain animate-float drop-shadow-2xl"
          />
        </div>
      </div>
    </div>

    <footer class="relative py-6 text-center text-sm text-gray-500 bg-white/5 backdrop-blur-sm">
      © {new Date().getFullYear()} TimetablePro. All rights reserved.
    </footer>
  </div>
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