<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type Props = WithElementRef<HTMLTextareaAttributes>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		'data-slot': dataSlot = 'textarea',
		...restProps
	}: Props = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	class={cn('textarea', className)}
	bind:value
	{...restProps}
></textarea>
