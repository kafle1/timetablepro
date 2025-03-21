<script lang="ts">
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/user';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { ROUTES, USER_ROLES } from '$lib/config';
  import { browser } from '$app/environment';
  import { Calendar, Users, Building2, Settings, UserCircle, LogOut, Home } from 'lucide-svelte';
  import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';
  import MobileNav from '$lib/components/navigation/MobileNav.svelte';
  import { Button } from '$lib/components/ui/button';
  import type { User } from '$lib/types';
  import { authService } from '$lib/services/auth';
  import Sidebar from '$lib/components/navigation/Sidebar.svelte';

  // Get the user from the server-loaded data
  export let data;
  
  // Simple loading state
  let isLoading = true;
  
  onMount(() => {
    // Initialize user if needed
    if (!$userStore) {
      userStore.init();
    }
    isLoading = false;
  });

  // Navigation items - these will be filtered based on user role
  const mainNavigation = [
    {
      title: 'Dashboard',
      href: $userStore?.role === USER_ROLES.ADMIN 
        ? ROUTES.ADMIN_DASHBOARD 
        : $userStore?.role === USER_ROLES.TEACHER 
          ? ROUTES.TEACHER_DASHBOARD 
          : ROUTES.STUDENT_DASHBOARD,
      icon: Home,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]
    },
    {
      title: 'Schedule',
      href: '/schedule',
      icon: Calendar,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]
    },
    {
      title: 'Teachers',
      href: ROUTES.TEACHERS,
      icon: Users,
      roles: [USER_ROLES.ADMIN]
    },
    {
      title: 'Students',
      href: ROUTES.STUDENTS,
      icon: Users,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER]
    },
    {
      title: 'Rooms',
      href: ROUTES.ROOMS,
      icon: Building2,
      roles: [USER_ROLES.ADMIN]
    },
    {
      title: 'Availability',
      href: ROUTES.AVAILABILITY,
      icon: Calendar,
      roles: [USER_ROLES.TEACHER]
    }
  ];

  const userNavigation = [
    {
      title: 'Profile',
      href: ROUTES.PROFILE,
      icon: UserCircle,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]
    },
    {
      title: 'Settings',
      href: ROUTES.SETTINGS,
      icon: Settings,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]
    }
  ];

  // Filter navigation items based on user role
  $: filteredMainNavigation = mainNavigation.filter(item => 
      $userStore?.role && 
      Array.isArray(item.roles) && 
      item.roles.includes($userStore.role)
    );

  $: filteredUserNavigation = userNavigation.filter(item => 
      $userStore?.role && 
      Array.isArray(item.roles) && 
      item.roles.includes($userStore.role)
    );

  $: currentPath = $page.url.pathname;

  // Handle logout
  async function handleLogout() {
    try {
      // Reset user store (which also calls auth service logout)
      await userStore.reset();
      
      // Redirect to login page
      window.location.href = '/login?success=logout';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
</script>

{#if isLoading}
  <div class="flex h-screen w-full items-center justify-center">
    <div class="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
{:else}
  <div class="flex h-screen bg-background">
    <!-- Sidebar - Fixed for desktop, hidden on mobile -->
    <aside class="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 shadow-md">
      <div class="flex flex-col h-full border-r border-border bg-card">
        <div class="flex items-center justify-between h-16 px-6 border-b border-border">
          <span class="text-xl font-bold text-primary">TimeTablePro</span>
          <ThemeToggle />
        </div>
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <div class="mb-6">
            <p class="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2">Main</p>
            {#each filteredMainNavigation as item}
              <a
                href={item.href}
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors {currentPath === item.href || currentPath.startsWith(item.href + '/') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-secondary-foreground'}"
              >
                <svelte:component
                  this={item.icon}
                  class="w-5 h-5 mr-3 flex-shrink-0"
                />
                {item.title}
              </a>
            {/each}
          </div>
          
          <div class="mb-2">
            <p class="mb-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2">User</p>
            {#each filteredUserNavigation as item}
              <a
                href={item.href}
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors {currentPath === item.href || currentPath.startsWith(item.href + '/') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-secondary-foreground'}"
              >
                <svelte:component
                  this={item.icon}
                  class="w-5 h-5 mr-3 flex-shrink-0"
                />
                {item.title}
              </a>
            {/each}
          </div>
        </nav>
        <div class="p-4 border-t border-border">
          <Button variant="outline" class="w-full justify-start" on:click={handleLogout}>
            <LogOut class="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </aside>

    <!-- Mobile header - Fixed at top -->
    <div class="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 border-b shadow-sm lg:hidden border-border bg-card">
      <span class="text-xl font-bold text-primary">TimeTablePro</span>
      <div class="flex items-center gap-2">
        <ThemeToggle />
        <MobileNav
          mainNavigation={filteredMainNavigation}
          userNavigation={filteredUserNavigation}
          {currentPath}
        />
      </div>
    </div>

    <!-- Main content - Takes the remaining space, with appropriate padding -->
    <div class="w-full lg:pl-64 min-h-screen">
      <!-- Content wrapper with padding -->
      <div class="pt-16 lg:pt-0">
        <div class="p-4 lg:p-8">
          <slot />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(html) {
    @apply overflow-hidden;
  }
</style>