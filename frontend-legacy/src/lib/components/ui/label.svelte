<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Label as LabelPrimitive } from 'bits-ui';

	let { class: className, ...restProps }: LabelPrimitive.RootProps = $props();
</script>

<LabelPrimitive.Root class={cn('label', className)} {...restProps} />
