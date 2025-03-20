<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { toastStore } from '$lib/stores/toastStore';
  import Toast from './Toast.svelte';

  // Position can be adjusted as needed
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

  // Get positioning classes based on position prop
  let positionClasses: string;

  $: {
    switch (position) {
      case 'top-right':
        positionClasses = 'top-4 right-4';
        break;
      case 'top-left':
        positionClasses = 'top-4 left-4';
        break;
      case 'bottom-right':
        positionClasses = 'bottom-4 right-4';
        break;
      case 'bottom-left':
        positionClasses = 'bottom-4 left-4';
        break;
      default:
        positionClasses = 'top-4 right-4';
    }
  }

  function dismissToast(id: string) {
    toastStore.remove(id);
  }
</script>

<div 
  class={`fixed z-50 flex flex-col gap-2 max-h-screen overflow-hidden ${positionClasses}`}
  aria-live="polite"
  aria-atomic="true"
>
  {#each $toastStore.toasts as toast (toast.id)}
    <div 
      in:fly={{ y: position.startsWith('top') ? -20 : 20, duration: 300 }}
      out:fade={{ duration: 200 }}
      class="transform transition-all duration-300"
    >
      <Toast 
        id={toast.id}
        type={toast.type}
        message={toast.message}
        onDismiss={dismissToast}
        timeout={toast.timeout}
      />
    </div>
  {/each}
</div> 