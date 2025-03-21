<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { Button } from '$lib/components/ui/button';
  import { Menu, X, LogOut } from 'lucide-svelte';
  import { authService } from '$lib/services/auth';
  import { userStore } from '$lib/stores/user';
  import { goto } from '$app/navigation';

  export let mainNavigation: Array<{
    title: string;
    href: string;
    icon: any;
    roles?: string[];
  }> = [];

  export let userNavigation: Array<{
    title: string;
    href: string;
    icon: any;
    roles?: string[];
  }> = [];

  export let currentPath: string = '';

  let isOpen = false;

  function closeMenu() {
    isOpen = false;
  }

  function toggleMenu() {
    isOpen = !isOpen;
  }

  async function handleLogout() {
    try {
      // Call the auth service logout method
      await authService.logout();
      
      // Reset the user store
      userStore.set(null);
      
      // Redirect to login page
      closeMenu();
      goto('/login?success=logout');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
</script>

<div class="relative z-50">
  <Button 
    variant="ghost"
    size="icon"
    class="lg:hidden"
    aria-label={isOpen ? 'Close menu' : 'Open menu'}
    on:click={toggleMenu}
  >
    {#if isOpen}
      <X class="h-6 w-6" />
    {:else}
      <Menu class="h-6 w-6" />
    {/if}
  </Button>

  {#if isOpen}
    <!-- Mobile menu backdrop -->
    <div 
      class="fixed inset-0 bg-background/80 backdrop-blur-sm"
      on:click={closeMenu}
      transition:slide={{ duration: 200, easing: quintOut }}
    />

    <!-- Mobile menu panel -->
    <div 
      class="fixed inset-y-0 right-0 w-full max-w-xs bg-card shadow-xl flex flex-col h-full"
      transition:slide={{ duration: 300, easing: quintOut }}
    >
      <div class="flex items-center justify-between p-4 border-b border-border">
        <span class="text-lg font-semibold">Menu</span>
        <Button variant="ghost" size="icon" on:click={closeMenu}>
          <X class="h-5 w-5" />
        </Button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <!-- Main navigation -->
        <div class="space-y-1 mb-6">
          <h3 class="px-3 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
            Main
          </h3>
          {#each mainNavigation as item}
            <a 
              href={item.href}
              class="flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors {currentPath === item.href || currentPath.startsWith(item.href + '/') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}"
              on:click={closeMenu}
            >
              <svelte:component this={item.icon} class="h-5 w-5 mr-3" />
              {item.title}
            </a>
          {/each}
        </div>

        <!-- User navigation -->
        <div class="space-y-1">
          <h3 class="px-3 text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
            User
          </h3>
          {#each userNavigation as item}
            <a 
              href={item.href}
              class="flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors {currentPath === item.href || currentPath.startsWith(item.href + '/') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}"
              on:click={closeMenu}
            >
              <svelte:component this={item.icon} class="h-5 w-5 mr-3" />
              {item.title}
            </a>
          {/each}
        </div>
      </div>

      <div class="p-4 border-t border-border">
        <Button 
          variant="outline" 
          class="w-full justify-start"
          on:click={handleLogout}
        >
          <LogOut class="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  {/if}
</div>