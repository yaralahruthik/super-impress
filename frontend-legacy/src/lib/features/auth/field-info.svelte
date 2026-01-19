<script lang="ts">
	import type { AnyFieldApi } from '@tanstack/svelte-form';

	let { field }: { field: AnyFieldApi } = $props();
</script>

{#if field.state.meta.isTouched}
	{#each field.state.meta.errors as error (error)}
		<em role="alert" class="text-error">{error.message}</em>
	{/each}
{/if}
