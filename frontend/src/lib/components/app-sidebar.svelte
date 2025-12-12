<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { auth } from '$lib/stores/auth';
	import Logo from './logo.svelte';

	function handleLogout() {
		auth.logout();
		goto(resolve('/login'));
	}

	const isActive = (path: string) => page.url.pathname === path;
</script>

<aside class="flex w-64 flex-col border-r border-base-200 bg-base-100/50">
	<div class="flex h-16 items-center border-b border-base-200/50 px-6">
		<Logo />
	</div>

	<nav class="flex-1 space-y-1 p-4">
		<a
			href={resolve('/')}
			class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-base-200
				{isActive('/') ? 'bg-primary/10 text-primary' : 'text-base-content/70'}"
		>
			<span>Dashboard</span>
		</a>

		<a
			href={resolve('/change-password')}
			class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-base-200
				{isActive('/change-password') ? 'bg-primary/10 text-primary' : 'text-base-content/70'}"
		>
			<span>Change Password</span>
		</a>
	</nav>

	<div class="border-t border-base-200 p-4">
		<button
			onclick={handleLogout}
			class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10"
		>
			<span>Logout</span>
		</button>
	</div>
</aside>
