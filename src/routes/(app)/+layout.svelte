<script lang="ts">
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth';
  import * as Icons from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '$lib/components/ui/dropdown-menu';
  import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
  import { cn } from '$lib/utils';

  const navigation = [
    { name: 'Schedule', href: '/schedule', icon: Icons.Calendar },
    { name: 'Rooms', href: '/rooms', icon: Icons.Building2 },
    { name: 'Profile', href: '/profile', icon: Icons.User },
  ];

  const teacherNavigation = [
    { name: 'Availability', href: '/availability', icon: Icons.Clock },
  ];

  const adminNavigation = [
    { name: 'Admin', href: '/admin', icon: Icons.Settings },
  ];

  $: currentPath = $page.url.pathname;
</script>

<div class="min-h-screen bg-background">
  <!-- Top Navigation -->
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center">
      <a href="/" class="mr-6 flex items-center space-x-2">
        <span class="font-bold text-primary">TimetablePro</span>
      </a>

      <nav class="flex items-center space-x-6 text-sm font-medium">
        {#each navigation as item}
          <a
            href={item.href}
            class={cn(
              "transition-colors hover:text-foreground/80",
              currentPath === item.href ? "text-foreground" : "text-foreground/60"
            )}
          >
            {item.name}
          </a>
        {/each}

        {#if $authStore.user?.role === 'teacher'}
          {#each teacherNavigation as item}
            <a
              href={item.href}
              class={cn(
                "transition-colors hover:text-foreground/80",
                currentPath === item.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              {item.name}
            </a>
          {/each}
        {/if}

        {#if $authStore.user?.role === 'admin'}
          {#each adminNavigation as item}
            <a
              href={item.href}
              class={cn(
                "transition-colors hover:text-foreground/80",
                currentPath === item.href ? "text-foreground" : "text-foreground/60"
              )}
            >
              {item.name}
            </a>
          {/each}
        {/if}
      </nav>

      <div class="flex flex-1 items-center justify-end space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" class="relative h-8 w-8 rounded-full">
              <Avatar class="h-8 w-8">
                <AvatarFallback>
                  {$authStore.user?.email?.[0].toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56" align="end" forceMount>
            <DropdownMenuLabel class="font-normal">
              <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium leading-none">{$authStore.user?.email}</p>
                <p class="text-xs leading-none text-muted-foreground">
                  {$authStore.user?.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/profile">
                <Icons.User class="mr-2 h-4 w-4" />
                Profile
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/settings">
                <Icons.Settings class="mr-2 h-4 w-4" />
                Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-red-600 focus:bg-red-50 focus:text-red-600"
              on:click={() => authStore.logout()}
            >
              <Icons.LogOut class="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="container py-8">
    <slot />
  </main>
</div> 