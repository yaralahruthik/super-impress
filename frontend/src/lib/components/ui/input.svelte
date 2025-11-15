<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let { class: className, ...restProps }: HTMLInputAttributes = $props();
</script>

<input class={cn('input', className)} {...restProps} />
