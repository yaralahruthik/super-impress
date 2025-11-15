<script lang="ts">
	import type { AnyFieldApi } from '@tanstack/svelte-form';

	let { field }: { field: AnyFieldApi } = $props();
</script>

{#if field.state.meta.isTouched}
	{#each field.state.meta.errors as error (error)}
		<em role="alert" class="validator-hint">{error.message}</em>
	{/each}
	{field.state.meta.isValidating ? 'Validating...' : ''}
{/if}
