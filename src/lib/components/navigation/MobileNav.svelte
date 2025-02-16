<script lang="ts">
  import { Menu, X } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let mainNavigation: Array<{
    title: string;
    href: string;
    icon: any;
  }>;

  export let userNavigation: Array<{
    title: string;
    href: string;
    icon: any;
  }>;

  export let currentPath: string;

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function closeMenu() {
    isOpen = false;
  }
</script>

<button
  class="inline-flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors rounded-md lg:hidden hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  on:click={toggleMenu}
  aria-label="Toggle menu"
>
  {#if isOpen}
    <X class="w-5 h-5" />
  {:else}
    <Menu class="w-5 h-5" />
  {/if}
</button>

{#if isOpen}
  <div class="fixed inset-0 z-50">
    <button
      type="button"
      class="fixed inset-0 w-full h-full bg-background/80 backdrop-blur-sm"
      on:click={closeMenu}
      on:keydown={e => e.key === 'Escape' && closeMenu()}
      aria-label="Close mobile navigation"
    ></button>
    <div
      class="fixed inset-y-0 left-0 w-3/4 max-w-xs shadow-lg bg-card"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <nav class="flex flex-col h-full" aria-label="Mobile navigation">
        <div class="p-4 border-b border-border">
          <span class="text-xl font-semibold">TimeTablePro</span>
        </div>
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          {#each mainNavigation as item}
            <a
              href={item.href}
              class={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${currentPath === item.href ? 'bg-primary/10' : ''}`}
              class:text-primary={currentPath === item.href}
              class:text-muted-foreground={currentPath !== item.href}
              class:hover:bg-accent={currentPath !== item.href}
              class:hover:text-accent-foreground={currentPath !== item.href}
              style="background-color: {currentPath === item.href ? 'rgb(var(--primary) / 0.1)' : 'transparent'}"
              on:click={closeMenu}
            >
              <svelte:component
                this={item.icon}
                class="w-5 h-5 mr-3"
              />
              {item.title}
            </a>
          {/each}
        </nav>
        <div class="p-4 space-y-1 border-t border-border">
          {#each userNavigation as item}
            <a
              href={item.href}
              class={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${currentPath === item.href ? 'bg-primary/10' : ''}`}
              class:text-primary={currentPath === item.href}
              class:text-muted-foreground={currentPath !== item.href}
              class:hover:bg-accent={currentPath !== item.href}
              class:hover:text-accent-foreground={currentPath !== item.href}
              on:click={closeMenu}
            >
              <svelte:component
                this={item.icon}
                class="w-5 h-5 mr-3"
              />
              {item.title}
            </a>
          {/each}
        </div>
      </nav>
    </div>
  </div>
{/if}