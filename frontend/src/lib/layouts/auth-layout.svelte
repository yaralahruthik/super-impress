<script lang="ts">
	import Logo from '$lib/components/logo.svelte';

	let { children } = $props();
</script>

<div class="container mx-auto flex h-svh flex-col items-center justify-center">
	<Logo />
	{@render children?.()}
</div>
