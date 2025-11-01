<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authStore } from '$lib/stores/auth-store';
	import { get } from 'svelte/store';

	let { children } = $props();

	$effect(() => {
		if (!browser) return;

		const currentAuth = get(authStore);
		if (currentAuth.accessToken) {
			goto(resolve('/dashboard'), { replaceState: true });
		}
	});
</script>

{@render children?.()}
