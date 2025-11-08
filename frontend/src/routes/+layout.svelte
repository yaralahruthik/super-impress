<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import '../app.css';

	let { children } = $props();

	const queryClient = new QueryClient();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<main>
		{@render children?.()}
	</main>
	<SvelteQueryDevtools />
</QueryClientProvider>
