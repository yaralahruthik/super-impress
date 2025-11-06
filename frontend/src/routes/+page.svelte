<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	let data: { message: string } | null = null;

	onMount(async () => {
		try {
			const res = await fetch('/api/test');
			data = await res.json();
		} catch (error) {
			console.error(error);
		}
	});
</script>

<h1>Dashboard Page</h1>
<a href={resolve('/register')}>Register Page</a>

{#if data}
	<p>{data.message}</p>
{/if}
