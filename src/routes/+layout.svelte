<script lang="ts">
	import '../app.css';
	import { userStore } from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	import { authService } from '$lib/services/auth';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { ROUTES, USER_ROLES } from '$lib/config';
	import NotificationBell from '$lib/components/NotificationBell.svelte';
	import type { User } from '$lib/types';
	import { browser } from '$app/environment';

	// Protected routes configuration
	const protectedRoutes = [
		'/admin',
		'/teacher',
		'/student',
		'/rooms',
		'/schedules',
		'/profile'
	];

	const roleBasedRoutes: Record<keyof typeof USER_ROLES, string[]> = {
		[USER_ROLES.ADMIN]: ['/admin', '/rooms', '/schedules'],
		[USER_ROLES.TEACHER]: ['/teacher', '/schedules'],
		[USER_ROLES.STUDENT]: ['/student', '/schedules']
	};

	const publicRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, '/'];

	onMount(async () => {
		try {
			// Check if we're on a public route first
			if (browser && publicRoutes.some((route: string) => $page.url.pathname.startsWith(route))) {
				// Don't try to get the current user on public routes
				return;
			}
			
			// Try to get the current user
			const user = await authService.getCurrentUser();
			
			if (user) {
				userStore.setUser(user);
			} else {
				// If we're not on a public route, redirect to login
				if (browser) {
					// Use direct window location for more reliable navigation
					window.location.href = `${ROUTES.LOGIN}?redirect=${encodeURIComponent($page.url.pathname)}`;
				}
			}
		} catch (error) {
			console.error('Error fetching user:', error);
			// If we're not on a public route, redirect to login
			if (browser && !publicRoutes.some((route: string) => $page.url.pathname.startsWith(route))) {
				// Use direct window location for more reliable navigation
				window.location.href = `${ROUTES.LOGIN}?redirect=${encodeURIComponent($page.url.pathname)}`;
			}
		}
	});

	$: currentUser = $userStore?.user;
	$: if (browser && $page.url.pathname !== '/') {
		handleRouteProtection($page.url.pathname, currentUser);
	}

	function handleRouteProtection(path: string, user: User | null) {
		// Skip if not in browser
		if (!browser) return;
		
		// Allow public routes
		if (!protectedRoutes.some(route => path.startsWith(route))) {
			return;
		}

		// Redirect to login if not authenticated
		if (!user) {
			// Use direct window location for more reliable navigation
			window.location.href = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(path)}`;
			return;
		}

		// Check role-based access
		const allowedRoutes = roleBasedRoutes[user.role] || [];
		if (!allowedRoutes.some(route => path.startsWith(route))) {
			// Redirect to appropriate dashboard
			switch (user.role) {
				case USER_ROLES.ADMIN:
					window.location.href = ROUTES.ADMIN_DASHBOARD;
					break;
				case USER_ROLES.TEACHER:
					window.location.href = ROUTES.TEACHER_DASHBOARD;
					break;
				case USER_ROLES.STUDENT:
					window.location.href = ROUTES.STUDENT_DASHBOARD;
					break;
				default:
					window.location.href = ROUTES.LOGIN;
			}
		}
	}
</script>

<div class="min-h-screen bg-background text-foreground">
	{#if currentUser}
		<header class="border-b border-border">
			<div class="container flex items-center justify-between px-4 py-4 mx-auto">
				<nav class="flex items-center space-x-6">
					<a href="/" class="text-lg font-semibold">TimeTablePro</a>
					{#if currentUser.role === USER_ROLES.ADMIN}
						<a href="/admin" class="hover:text-primary">Admin</a>
					{:else if currentUser.role === USER_ROLES.TEACHER}
						<a href="/teacher" class="hover:text-primary">Dashboard</a>
					{:else}
						<a href="/student" class="hover:text-primary">Dashboard</a>
					{/if}
				</nav>
				<div class="flex items-center space-x-4">
					<NotificationBell />
					<button
						class="text-sm hover:text-primary"
						on:click={() => authService.logout()}
					>
						Logout
					</button>
				</div>
			</div>
		</header>
	{/if}
	
	<main>
		<slot />
	</main>
</div>

<style>
	:global(body) {
		@apply bg-background text-foreground antialiased;
	}

	:global(.dark) {
		color-scheme: dark;
	}
</style>
