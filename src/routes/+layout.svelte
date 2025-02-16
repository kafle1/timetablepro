<script lang="ts">
	import '../app.css';
	import { userStore } from '$lib/stores/userStore';
	import { onMount } from 'svelte';
	import { authService } from '$lib/services/auth';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { ROUTES, USER_ROLES } from '$lib/config';
	import NotificationBell from '$lib/components/NotificationBell.svelte';

	// Protected routes configuration
	const protectedRoutes = [
		'/admin',
		'/teacher',
		'/student',
		'/rooms',
		'/schedules',
		'/profile'
	];

	const roleBasedRoutes = {
		[USER_ROLES.ADMIN]: ['/admin', '/rooms', '/schedules'],
		[USER_ROLES.TEACHER]: ['/teacher', '/schedules'],
		[USER_ROLES.STUDENT]: ['/student', '/schedules']
	};

	onMount(async () => {
		const user = await authService.getCurrentUser();
		if (user) {
			userStore.set(user);
		}
	});

	$: if ($page.url.pathname !== '/') {
		handleRouteProtection($page.url.pathname, $userStore);
	}

	function handleRouteProtection(path: string, user: any) {
		// Allow public routes
		if (!protectedRoutes.some(route => path.startsWith(route))) {
			return;
		}

		// Redirect to login if not authenticated
		if (!user) {
			goto(ROUTES.LOGIN);
			return;
		}

		// Check role-based access
		const allowedRoutes = roleBasedRoutes[user.role] || [];
		if (!allowedRoutes.some(route => path.startsWith(route))) {
			// Redirect to appropriate dashboard
			switch (user.role) {
				case USER_ROLES.ADMIN:
					goto(ROUTES.ADMIN_DASHBOARD);
					break;
				case USER_ROLES.TEACHER:
					goto(ROUTES.TEACHER_DASHBOARD);
					break;
				case USER_ROLES.STUDENT:
					goto(ROUTES.STUDENT_DASHBOARD);
					break;
				default:
					goto(ROUTES.LOGIN);
			}
		}
	}
</script>

<div class="min-h-screen bg-background text-foreground">
	{#if $userStore}
		<header class="border-b border-border">
			<div class="container flex items-center justify-between px-4 py-4 mx-auto">
				<nav class="flex items-center space-x-6">
					<a href="/" class="text-lg font-semibold">TimeTablePro</a>
					{#if $userStore.role === 'admin'}
						<a href="/admin" class="hover:text-primary">Admin</a>
					{:else if $userStore.role === 'teacher'}
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
