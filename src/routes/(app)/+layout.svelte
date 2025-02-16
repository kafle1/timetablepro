<script lang="ts">
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/user';
  import { ROUTES, USER_ROLES } from '$lib/config';
  import { Calendar, Users, Building2, Settings, UserCircle } from 'lucide-svelte';
  import ThemeToggle from '$lib/components/theme/ThemeToggle.svelte';
  import MobileNav from '$lib/components/navigation/MobileNav.svelte';

  const mainNavigation = [
    {
      title: 'Dashboard',
      href: $userStore?.role === USER_ROLES.ADMIN 
        ? ROUTES.ADMIN_DASHBOARD 
        : $userStore?.role === USER_ROLES.TEACHER 
          ? ROUTES.TEACHER_DASHBOARD 
          : ROUTES.STUDENT_DASHBOARD,
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
    (item) => item.roles.includes($userStore?.role || '')
  );

  $: filteredUserNavigation = userNavigation.filter(
    (item) => item.roles.includes($userStore?.role || '')
  );

  $: currentPath = $page.url.pathname;
</script>

<div class="flex h-screen">
  <!-- Sidebar -->
  <aside class="fixed inset-y-0 flex-col hidden w-64 h-full lg:flex">
    <div class="flex flex-col flex-grow px-6 border-r border-border bg-card">
      <div class="flex items-center justify-between h-16">
        <span class="text-xl font-semibold">TimeTablePro</span>
        <ThemeToggle />
      </div>
      <nav class="flex-1 pt-4 space-y-1">
        {#each filteredMainNavigation as item}
          <a
            href={item.href}
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors {currentPath === item.href ? 'bg-primary/10' : ''}"
            class:text-primary={currentPath === item.href}
            class:text-muted-foreground={currentPath !== item.href}
            class:hover:bg-accent={currentPath !== item.href}
            class:hover:text-accent-foreground={currentPath !== item.href}
          >
            <svelte:component
              this={item.icon}
              class="w-5 h-5 mr-3"
            />
            {item.title}
          </a>
        {/each}
      </nav>
      <div class="flex flex-col gap-1 pb-4">
        {#each filteredUserNavigation as item}
          <a
            href={item.href}
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors {currentPath === item.href ? 'bg-primary/10' : ''}"
            class:text-primary={currentPath === item.href}
            class:text-muted-foreground={currentPath !== item.href}
            class:hover:bg-accent={currentPath !== item.href}
            class:hover:text-accent-foreground={currentPath !== item.href}
          >
            <svelte:component
              this={item.icon}
              class="w-5 h-5 mr-3"
            />
            {item.title}
          </a>
        {/each}
      </div>
    </div>
  </aside>

  <!-- Mobile header -->
  <div class="fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 border-b lg:hidden border-border bg-card">
    <span class="text-xl font-semibold">TimeTablePro</span>
    <div class="flex items-center gap-2">
      <ThemeToggle />
      <MobileNav
        {mainNavigation}
        {userNavigation}
        {currentPath}
      />
    </div>
  </div>

  <!-- Main content -->
  <main class="flex-1 lg:pl-64">
    <div class="h-full px-4 py-8 lg:px-8">
      <slot />
    </div>
  </main>
</div>