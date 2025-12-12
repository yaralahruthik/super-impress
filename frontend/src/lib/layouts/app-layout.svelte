<script lang="ts">
	import AppSidebar from '$lib/components/app-sidebar.svelte';

	let { children } = $props();
</script>

<div class="flex h-svh w-full bg-base-100">
	<AppSidebar />

	<div class="flex flex-1 flex-col overflow-hidden">
		<main class="flex-1 overflow-y-auto p-8">
			{@render children?.()}
		</main>
	</div>
</div>
