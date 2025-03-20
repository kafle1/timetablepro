<script lang="ts">
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/user';
  import { ROUTES, USER_ROLES } from '$lib/config';
  import { Calendar, Users, Building2, Settings, UserCircle, LogOut, Home } from 'lucide-svelte';
  import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';
  import MobileNav from '$lib/components/navigation/MobileNav.svelte';
  import { Button } from '$lib/components/ui/button';
  import { authStore } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import type { User } from '$lib/types';

  // Get the user from the server-loaded data
  export let data;
  
  // Set the user in the store
  onMount(() => {
    if (data.user) {
      // Properly cast the user to ensure type safety
      userStore.set(data.user as User);
    }
  });

  const mainNavigation = [
    {
      title: 'Dashboard',
      href: data.user?.role === USER_ROLES.ADMIN 
        ? ROUTES.ADMIN_DASHBOARD 
        : data.user?.role === USER_ROLES.TEACHER 
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

  $: filteredMainNavigation = mainNavigation.filter(
    (item) => data.user?.role && item.roles.includes(data.user.role as "ADMIN" | "TEACHER" | "STUDENT")
  );

  $: filteredUserNavigation = userNavigation.filter(
    (item) => data.user?.role && item.roles.includes(data.user.role as "ADMIN" | "TEACHER" | "STUDENT")
  );

  $: currentPath = $page.url.pathname;

  function handleLogout() {
    authStore.logout();
  }
</script>

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