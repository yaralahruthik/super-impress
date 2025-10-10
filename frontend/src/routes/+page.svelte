<script lang="ts">
	import { onMount } from 'svelte';

	const API_BASE = import.meta.env?.VITE_API_BASE;
	let data: { message: string } | null = null;

	onMount(async () => {
		try {
			const res = await fetch(`${API_BASE}/`);
			data = await res.json();
		} catch (error) {
			console.error(error);
		}
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

{#if data}
	<p>{data.message}</p>
{/if}
