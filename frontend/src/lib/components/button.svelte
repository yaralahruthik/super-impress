<script lang="ts">
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let disabled: boolean = false;
	export let variant: 'primary' | 'outline' = 'primary';
	export let classes: string = '';
	export let onclick: (() => void) | undefined = undefined;

	const baseClasses =
		'w-xs mx-auto cursor-pointer rounded px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-60';
	const variantClasses = {
		primary: 'bg-emerald-500 text-white',
		outline: 'border border-emerald-500 text-black bg-white'
	};
</script>

<button {type} {disabled} {onclick} class="{baseClasses} {variantClasses[variant]} {classes}">
	<slot />
</button>
