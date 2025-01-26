<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/stores/auth';
	import { checkSession } from '$lib/services/auth';
	import '../app.css';
</script>

<div class="min-h-screen bg-background">
	<header class="border-b">
		<nav class="container mx-auto px-4 py-4 flex items-center justify-between">
			<a href="/" class="text-2xl font-bold text-primary">TimetablePro</a>
			
			{#if $authStore.user}
				<div class="flex items-center gap-4">
					{#if $authStore.user.role === 'admin'}
						<a href="/admin" class="text-muted-foreground hover:text-primary">Admin</a>
					{/if}
					<a href="/schedule" class="text-muted-foreground hover:text-primary">Schedule</a>
					<a href="/rooms" class="text-muted-foreground hover:text-primary">Rooms</a>
					{#if $authStore.user.role === 'teacher'}
						<a href="/availability" class="text-muted-foreground hover:text-primary">Availability</a>
					{/if}
					<a href="/profile" class="text-muted-foreground hover:text-primary">Profile</a>
					<button 
						on:click={() => authStore.logout()}
						class="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
					>
						Logout
					</button>
				</div>
			{:else}
				<div class="flex items-center gap-4">
					<a 
						href="/login"
						class="px-4 py-2 text-muted-foreground hover:text-primary"
					>
						Login
					</a>
					<a 
						href="/register"
						class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
					>
						Register
					</a>
				</div>
			{/if}
		</nav>
	</header>

	<main class="container mx-auto px-4 py-8">
		<slot />
	</main>

	<footer class="border-t mt-auto">
		<div class="container mx-auto px-4 py-6 text-center text-muted-foreground">
			© 2024 TimetablePro. All rights reserved.
		</div>
	</footer>
</div>

<style>
	:global(html) {
		@apply antialiased;
	}
</style>
