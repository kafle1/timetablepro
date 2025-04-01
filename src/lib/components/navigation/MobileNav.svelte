<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { Button } from '$lib/components/ui/button';
  import { Menu, X, LogOut } from 'lucide-svelte';
  import { authService } from '$lib/services/auth';
  import { userStore } from '$lib/stores/user';
  import { goto } from '$app/navigation';
  import { SheetContent, SheetClose } from '$lib/components/ui/sheet';
  import { Sheet, SheetTrigger } from '$lib/components/ui/sheet';

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

<Sheet>
  <SheetTrigger asChild let:builder>
    <Button builders={[builder]} variant="ghost" size="icon" class="lg:hidden">
      <Menu class="w-6 h-6" />
      <span class="sr-only">Toggle menu</span>
    </Button>
  </SheetTrigger>
  <SheetContent side="left" class="p-0 w-72">
    <div class="flex flex-col h-full">
      <div class="flex items-center justify-between h-16 px-6 border-b border-border">
        <span class="text-xl font-bold text-primary">TimeTablePro</span>
        <SheetClose asChild>
          <Button variant="ghost" size="icon">
            <X class="w-5 h-5" />
            <span class="sr-only">Close menu</span>
          </Button>
        </SheetClose>
      </div>
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <!-- Main Navigation Loop -->
        <div class="mb-6">
          <h3 class="px-2 mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            Main Menu
          </h3>
          {#each mainNavigation as item}
            <SheetClose asChild>
              <a 
                href={item.href}
                class="flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors {currentPath === item.href || currentPath.startsWith(item.href + '/') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}"
              >
                <svelte:component this={item.icon} class="h-5 w-5 mr-3" />
                {item.title}
              </a>
            </SheetClose>
          {/each}
        </div>
        <!-- User Navigation Loop -->
        <div class="mb-2">
          <h3 class="px-2 mb-2 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            User Menu
          </h3>
          {#each userNavigation as item}
            <SheetClose asChild>
              <a 
                href={item.href}
                class="flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors {currentPath === item.href || currentPath.startsWith(item.href + '/') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}"
              >
                <svelte:component this={item.icon} class="h-5 w-5 mr-3" />
                {item.title}
              </a>
            </SheetClose>
          {/each}
        </div>
      </nav>
      <!-- Logout Button Area -->
      <div class="p-4 border-t border-border">
         <SheetClose asChild>
           <Button 
             variant="outline" 
             class="w-full justify-start"
             on:click={handleLogout} 
           >
             <LogOut class="h-5 w-5 mr-3" />
             Logout
           </Button>
         </SheetClose>
      </div>
    </div>
  </SheetContent>
</Sheet>