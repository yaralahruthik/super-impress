<script lang="ts">
	import Logo from '$lib/components/logo.svelte';
</script>

<div class="container mx-auto flex h-svh flex-col items-center justify-center">
	<Logo />
	<slot></slot>
</div>
