# Svelte Component Design Patterns

DECISION STATUS: **PROPOSED**

## Context

With the adoption of Svelte 5 (Runes) and a desire for a consistent, accessible, and type-safe UI, we need to establish clear patterns for building components in the `super-impress` frontend.

Existing inconsistencies include:

- Mixed usage of raw HTML and bespoke styles.
- Inconsistent prop typing and event handling.
- Challenges in managing complex component variants.

## Decision

We will adopt the following patterns for all new Svelte components (specifically "Primitive" and "Composite" components).

### 1. Framework Features (Svelte 5)

- **Runes**: Exclusively use Svelte 5 Runes.
  - `$props()` for receiving properties.
  - `$bindable()` for two-way binding (e.g., `ref`, `value`).
  - `$derived()` for reactive computed values.
  - `$state()` for internal state.
- **Snippets**: Use `Snippet` type for render props and `{@render ...}` tags instead of `<slot>`.
  - Standard prop name for main content is `children`.
- **Events**: Do NOT use `createEventDispatcher`. Use callback props (e.g., `onchange`) or rely on event bubbling for DOM events.

### 2. Base Primitives & Accessibility

- **Bits UI**: Use [Bits UI](https://bits-ui.com) as the headless foundation for complex interactive components (Buttons, Dropdowns, Dialogs, etc.) to ensure accessibility.
- **HTML Elements**: Use native HTML elements (e.g., `<input>`, `<label>`) only when Bits UI does not provide a primitive or when simple behavior suffices, but wrap them to enforce styling and types.

### 3. Styling & Variants

- **Tailwind CSS (v4) + DaisyUI**: Use Tailwind utility classes. DaisyUI component classes (e.g., `btn`, `input`) are permitted within strict "Primitive" components.
- **CVA (Class Variance Authority)**: Use `cva` to define and manage component variants.
  - Define variants in a `<script context="module">` block to export them for consumption.
- **Class Merging**: Use a `cn` utility (wrapping `clsx` and `tailwind-merge`) to safely merge default styles, variant styles, and custom `class` props.
  - **Rule**: Always accept a `class` prop and merge it as the last argument to `cn()`.

### 4. Type Safety

- **Explicit Props**: Define a `Props` interface/type.
- **Extending Types**:
  - For primitives wrapping Bits UI: Extend `BitsPrimitive.RootProps`.
  - For HTML wrappers: Extend `HTMLAttributes<HTMLElement>` (imported from `svelte/elements`).
- **Exports**: Export the `Props` type and the variant types (e.g., `ButtonVariant`) module-side for consumers.

### 5. Prop Forwarding

- **Rest Props**: Use JavaScript rest syntax (`...restProps`) to capture and forward arbitrary attributes (like `aria-` labels or data attributes) to the underlying root element.
- **Ref Forwarding**: Always provide a `bind:ref` (or `bind:this`) to allow consumers to access the DOM element.

## Examples

### Primitive Component (Button)

```svelte
<script lang="ts" module>
	import type { Button as ButtonPrimitiveTypes } from 'bits-ui';
	import { cva, type VariantProps } from 'class-variance-authority';

	export const buttonVariants = cva('btn', {
		variants: {
			variant: {
				default: 'btn-primary',
				outline: 'btn-outline',
				// ... other variants
			},
			size: {
				default: '',
				sm: 'btn-sm',
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
	import { Button as BitsButton } from 'bits-ui';

	let {
		variant = 'default',
		size = 'default',
		class: className,
		ref = $bindable(null),
		children,
		...restProps
	}: ButtonProps = $props();
</script>

<BitsButton.Root
	bind:ref
	class={cn(buttonVariants({ variant, size }), className)}
	{...restProps}
>
	{@render children?.()}
</BitsButton.Root>
```

### HTML Wrapper (Input)

```svelte
<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type InputProps = HTMLInputAttributes & {
        // Custom props if any
    };

	let {
		class: className,
		value = $bindable(),
		ref = $bindable(null),
        ...restProps
	}: InputProps = $props();
</script>

<input
	bind:this={ref}
	bind:value
	class={cn('input input-bordered', className)}
	{...restProps}
/>
```

## Consequences

- **Positive**:
  - Uniform codebase that is easier to read and maintain.
  - Strong type safety reduces runtime errors.
  - Standardized accessibility patterns.
  - Separation of logical styles (variants) from implementation.
- **Negative**:
  - Slightly more boilerplate file structure (requires imports, type definitions).
  - Learning curve for Svelte 5 Runes for developers used to Svelte 4.
