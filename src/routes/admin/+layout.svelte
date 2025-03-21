<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<div class="min-h-screen flex">
	<!-- Sidebar -->
	<aside class="w-64 bg-gray-800 text-white p-6">
		<h2 class="text-2xl font-bold mb-6">Admin Panel</h2>
		<nav>
			<ul class="space-y-2">
				<li>
					<a 
						href="/admin/dashboard" 
						class="block py-2 px-4 rounded transition-colors {$page.url.pathname === '/admin/dashboard' ? 'bg-blue-600' : 'hover:bg-gray-700'}"
					>
						Dashboard
					</a>
				</li>
				<li>
					<a 
						href="/admin/users" 
						class="block py-2 px-4 rounded transition-colors {$page.url.pathname === '/admin/users' ? 'bg-blue-600' : 'hover:bg-gray-700'}"
					>
						Users
					</a>
				</li>
				<li>
					<a 
						href="/admin/rooms" 
						class="block py-2 px-4 rounded transition-colors {$page.url.pathname === '/admin/rooms' ? 'bg-blue-600' : 'hover:bg-gray-700'}"
					>
						Rooms
					</a>
				</li>
				<li>
					<a 
						href="/admin/schedule" 
						class="block py-2 px-4 rounded transition-colors {$page.url.pathname === '/admin/schedule' ? 'bg-blue-600' : 'hover:bg-gray-700'}"
					>
						Schedule
					</a>
				</li>
				<li>
					<a 
						href="/admin/reports" 
						class="block py-2 px-4 rounded transition-colors {$page.url.pathname === '/admin/reports' ? 'bg-blue-600' : 'hover:bg-gray-700'}"
					>
						Reports
					</a>
				</li>
				<li>
					<a 
						href="/admin/settings" 
						class="block py-2 px-4 rounded transition-colors {$page.url.pathname === '/admin/settings' ? 'bg-blue-600' : 'hover:bg-gray-700'}"
					>
						Settings
					</a>
				</li>
				<li>
					<a 
						href="/admin/appwrite-setup" 
						class="block py-2 px-4 rounded transition-colors {$page.url.pathname === '/admin/appwrite-setup' ? 'bg-blue-600' : 'hover:bg-gray-700'}"
					>
						Appwrite Setup
					</a>
				</li>
				<li>
					<a 
						href="/admin/test-schedules" 
						class="block py-2 px-4 rounded transition-colors {$page.url.pathname === '/admin/test-schedules' ? 'bg-blue-600' : 'hover:bg-gray-700'}"
					>
						Test Schedules
					</a>
				</li>
			</ul>
		</nav>
	</aside>

	<!-- Main content -->
	<main class="flex-1 bg-gray-100">
		<slot />
	</main>
</div> 