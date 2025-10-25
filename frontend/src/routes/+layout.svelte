<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children, data } = $props();

	let authenticated = $derived(data.authenticated);

	$effect(() => {
		if (!browser) return;

		const path = window.location.pathname;

		const authRoutes = ['/login', '/register'];
		const publicRoutes = ['/', '/login', '/register'];

		if (authenticated && authRoutes.includes(path)) {
			goto(resolve('/dashboard'), { replaceState: true });
		}

		if (!authenticated && !publicRoutes.includes(path)) {
			goto(resolve('/login'), { replaceState: true });
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
