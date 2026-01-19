<script lang="ts" module>
	import type { Button as ButtonPrimitiveTypes } from 'bits-ui';
	import { cva, type VariantProps } from 'class-variance-authority';

	export const buttonVariants = cva('btn', {
		variants: {
			variant: {
				default: 'btn-primary',
				neutral: 'btn-neutral',
				secondary: 'btn-secondary',
				accent: 'btn-accent',
				info: 'btn-info',
				success: 'btn-success',
				warning: 'btn-warning',
				error: 'btn-error',
				ghost: 'btn-ghost',
				link: 'btn-link',
				outline: 'btn-outline'
			},
			size: {
				default: '',
				xs: 'btn-xs',
				sm: 'btn-sm',
				md: 'btn-md',
				lg: 'btn-lg'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = ButtonPrimitiveTypes.RootProps & {
		variant?: ButtonVariant;
		size?: ButtonSize;
	};
</script>

<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Button as ButtonPrimitive } from 'bits-ui';

	let {
		variant = 'default',
		size = 'default',
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: ButtonProps = $props();
</script>

<ButtonPrimitive.Root
	bind:ref
	class={cn(buttonVariants({ variant, size }), className)}
	{...restProps}
>
	{@render children?.()}
</ButtonPrimitive.Root>
