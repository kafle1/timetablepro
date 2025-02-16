<script lang="ts">
  import { Moon, Sun } from 'lucide-svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let theme: 'light' | 'dark' = 'light';

  onMount(() => {
    if (browser) {
      theme = localStorage.getItem('theme') as 'light' | 'dark' || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  });

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    if (browser) {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }
</script>

<button
  class="inline-flex items-center justify-center rounded-md w-10 h-10 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
  on:click={toggleTheme}
>
  <Sun class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
  <Moon class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
  <span class="sr-only">Toggle theme</span>
</button> 