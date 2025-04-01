<!-- src/lib/components/navigation/Sidebar.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/user';
  import { ROUTES, USER_ROLES } from '$lib/config';
  import { Calendar, Users, Building2, Settings, UserCircle, LogOut, Home } from 'lucide-svelte';
  import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';
  import { Button } from '$lib/components/ui/button';
  import { authService } from '$lib/services/auth';
  import { goto } from '$app/navigation';

  // Navigation items
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
      href: $userStore?.role === USER_ROLES.ADMIN
        ? ROUTES.ADMIN.SCHEDULES
        : $userStore?.role === USER_ROLES.TEACHER
          ? ROUTES.TEACHER.SCHEDULES
          : ROUTES.STUDENT.SCHEDULES,
      icon: Calendar,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT]
    },
    {
      title: 'Teachers',
      href: $userStore?.role === USER_ROLES.ADMIN
        ? ROUTES.ADMIN.TEACHERS
        : ROUTES.STUDENT.TEACHERS,
      icon: Users,
      roles: [USER_ROLES.ADMIN, USER_ROLES.STUDENT]
    },
    {
      title: 'Students',
      href: $userStore?.role === USER_ROLES.ADMIN
        ? ROUTES.ADMIN.STUDENTS
        : ROUTES.TEACHER.STUDENTS,
      icon: Users,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER]
    },
    {
      title: 'Rooms',
      href: ROUTES.ADMIN.ROOMS,
      icon: Building2,
      roles: [USER_ROLES.ADMIN]
    },
    {
      title: 'Availability',
      href: $userStore?.role === USER_ROLES.ADMIN
        ? ROUTES.ADMIN.AVAILABILITY
        : ROUTES.TEACHER.AVAILABILITY,
      icon: Calendar,
      roles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER]
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