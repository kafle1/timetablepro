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

	// AUTHENTICATION CHECKS DISABLED FOR UI TESTING
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

	const publicRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, '/', '/auth/callback'];
	let isInitialized = false;

	// Create a mock admin user
	const mockAdminUser = {
		$id: 'mock-admin',
		userId: 'mock-admin',
		email: 'admin@timetablepro.com',
		name: 'Admin User',
		role: 'ADMIN',
		isActive: true,
		emailVerified: true,
		preferences: {},
		createdAt: new Date().toISOString(),
		lastLoginAt: new Date().toISOString(),
		$collectionId: 'users',
		$databaseId: 'default',
		$createdAt: new Date().toISOString(),
		$updatedAt: new Date().toISOString(),
		$permissions: []
	} as User;

	onMount(() => {
		// Always set the mock admin user
		userStore.setUser(mockAdminUser);
		isInitialized = true;
	});

	$: currentUser = $userStore?.user || mockAdminUser;
	// Authentication checks disabled for UI testing
</script>

<div class="min-h-screen bg-background text-foreground">
	{#if currentUser}
		<header class="border-b border-border">
			<div class="container flex items-center justify-between px-4 py-4 mx-auto">
				<nav class="flex items-center space-x-6">
					<a href="/" class="text-lg font-semibold">TimeTablePro</a>
					<a href="/admin/dashboard" class="hover:text-primary">Admin</a>
					<a href="/teacher/dashboard" class="hover:text-primary">Teacher</a>
					<a href="/student/dashboard" class="hover:text-primary">Student</a>
					<a href="/rooms" class="hover:text-primary">Rooms</a>
					<a href="/schedules" class="hover:text-primary">Schedules</a>
				</nav>
				<div class="flex items-center space-x-4">
					<NotificationBell />
					<a href="/login" class="text-sm hover:text-primary">Login Page</a>
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
