<script lang="ts">
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/user';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { ROUTES, USER_ROLES } from '$lib/config';
  import { browser } from '$app/environment';
  import { Calendar, Users, Building2, Settings, UserCircle, LogOut, Home, AlertTriangle, LayoutDashboard, Building } from 'lucide-svelte';
  import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';
  import MobileNav from '$lib/components/navigation/MobileNav.svelte';
  import { Button } from '$lib/components/ui/button';
  import type { User } from '$lib/types';
  import { authService } from '$lib/services/auth';
  import Sidebar from '$lib/components/navigation/Sidebar.svelte';
  import { Toasts } from '$lib/components/ui/toast';

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

  interface NavigationItem {
    title: string;
    href: string;
    icon: any;
    roles?: string[];
  }

  // Navigation items - Filtered based on user role later
  const mainNavigation: NavigationItem[] = [
    // Role-specific Dashboards (Added previously)
    {
      title: 'Admin Dashboard',
      href: ROUTES.ADMIN_DASHBOARD,
      icon: LayoutDashboard,
      roles: [USER_ROLES.ADMIN]
    },
    {
      title: 'Teacher Dashboard',
      href: ROUTES.TEACHER_DASHBOARD,
      icon: LayoutDashboard,
      roles: [USER_ROLES.TEACHER]
    },
    {
      title: 'Student Dashboard',
      href: ROUTES.STUDENT_DASHBOARD,
      icon: LayoutDashboard,
      roles: [USER_ROLES.STUDENT]
    },
    // Schedule Links (Role-Specific)
    {
      title: 'Manage Schedule', // Admin specific title
      href: ROUTES.ADMIN.SCHEDULES,
      icon: Calendar,
      roles: [USER_ROLES.ADMIN]
    },
    {
      title: 'My Schedule', // Teacher specific title
      href: ROUTES.TEACHER.SCHEDULES,
      icon: Calendar,
      roles: [USER_ROLES.TEACHER]
    },
    {
      title: 'View Schedule', // Student specific title
      href: ROUTES.STUDENT.SCHEDULES,
      icon: Calendar,
      roles: [USER_ROLES.STUDENT]
    },
    // Teacher Links (Role-Specific)
    {
      title: 'Manage Teachers',
      href: ROUTES.ADMIN.TEACHERS,
      icon: Users,
      roles: [USER_ROLES.ADMIN]
    },
    {
      title: 'View Teachers',
      href: ROUTES.STUDENT.TEACHERS, // Assuming students can view teachers
      icon: Users,
      roles: [USER_ROLES.STUDENT]
    },
     // Student Links (Role-Specific)
    {
      title: 'Manage Students',
      href: ROUTES.ADMIN.STUDENTS,
      icon: Users,
      roles: [USER_ROLES.ADMIN]
    },
    {
      title: 'View Students',
      href: ROUTES.TEACHER.STUDENTS, // Assuming teachers can view students
      icon: Users,
      roles: [USER_ROLES.TEACHER]
    },
    // Rooms Link (Admin Only)
    {
      title: 'Manage Rooms',
      href: ROUTES.ADMIN.ROOMS,
      icon: Building, // Using Building icon
      roles: [USER_ROLES.ADMIN]
    },
    // Availability Links (Role-Specific)
    {
      title: 'Manage Availability', // Admin view
      href: ROUTES.ADMIN.AVAILABILITY,
      icon: Calendar,
      roles: [USER_ROLES.ADMIN]
    },
    {
      title: 'Set Availability', // Teacher view
      href: ROUTES.TEACHER.AVAILABILITY,
      icon: Calendar,
      roles: [USER_ROLES.TEACHER]
    },
    // Reports Link (Admin Only)
    {
      title: 'Reports',
      href: ROUTES.ADMIN.REPORTS,
      icon: AlertTriangle,
      roles: [USER_ROLES.ADMIN]
    },
    // Settings Link (All Roles, points to a single settings page)
    {
      title: 'Settings',
      href: ROUTES.SETTINGS,
      icon: Settings,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]
    }
  ];

  const userNavigation: NavigationItem[] = [
    {
      title: 'Profile',
      href: ROUTES.PROFILE,
      icon: UserCircle,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]
    }
  ];

  // --- DEBUGGING START ---
  $: {
    console.log("[Layout Debug] User Store Role:", $userStore?.role);
    // Ensure USER_ROLES.ADMIN is defined before comparing
    if (typeof USER_ROLES !== 'undefined' && USER_ROLES.hasOwnProperty('ADMIN')) {
      console.log("[Layout Debug] USER_ROLES.ADMIN:", USER_ROLES.ADMIN);
      console.log("[Layout Debug] Is Role Admin?", $userStore?.role === USER_ROLES.ADMIN);
    } else {
      console.log("[Layout Debug] USER_ROLES or USER_ROLES.ADMIN is undefined");
    }
    // Log the result of the includes check for a specific admin item
    const manageScheduleItem = mainNavigation.find(item => item.title === 'Manage Schedule');
    if (manageScheduleItem) {
        console.log("[Layout Debug] Checking 'Manage Schedule' item:", manageScheduleItem.roles?.includes($userStore?.role || ''));
    }
  }
  // --- DEBUGGING END ---

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
      // Reset user store 
      await authService.logout();
      userStore.set(null);

      // Use goto for navigation
      await goto('/login?success=logout');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
</script>

{#if isLoading}
  <div class="flex items-center justify-center w-full h-screen">
    <div class="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
  </div>
{:else}
  <div class="flex h-screen bg-background">
    <!-- Sidebar - Fixed for desktop, hidden on mobile -->
    <aside class="hidden shadow-md lg:block lg:w-64 lg:fixed lg:inset-y-0">
      <div class="flex flex-col h-full border-r border-border bg-card">
        <div class="flex items-center justify-between h-16 px-6 border-b border-border">
          <span class="text-xl font-bold text-primary">TimeTablePro</span>
          <ThemeToggle />
        </div>
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <div class="mb-6">
            <p class="px-2 mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">Main</p>
            {#each filteredMainNavigation as item}
              <a
                href={item.href}
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors {currentPath === item.href || currentPath.startsWith(item.href + '/') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-secondary-foreground'}"
              >
                <svelte:component
                  this={item.icon}
                  class="flex-shrink-0 w-5 h-5 mr-3"
                />
                {item.title}
              </a>
            {/each}
          </div>
          
          <div class="mb-2">
            <p class="px-2 mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">User</p>
            {#each filteredUserNavigation as item}
              <a
                href={item.href}
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors {currentPath === item.href || currentPath.startsWith(item.href + '/') ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary hover:text-secondary-foreground'}"
              >
                <svelte:component
                  this={item.icon}
                  class="flex-shrink-0 w-5 h-5 mr-3"
                />
                {item.title}
              </a>
            {/each}
          </div>
        </nav>
        <div class="p-4 border-t border-border">
          <Button variant="outline" class="justify-start w-full" on:click={handleLogout}>
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
    <div class="w-full min-h-screen lg:pl-64">
      <!-- Content wrapper with padding -->
      <div class="pt-16 lg:pt-0">
        <div class="p-4 lg:p-8">
          <slot />
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Toast notifications -->
<Toasts position="top-right" />

<style>
  :global(html) {
    @apply overflow-hidden;
  }
</style>