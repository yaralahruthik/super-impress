<script lang="ts">
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { cn } from '$lib/utils/cn';
	import type { FullAutoFill } from 'svelte/elements';
	import FieldInfo from './field-info.svelte';

	//eslint-disable-next-line
	export let field: any;
	export let type: string = 'text';
	export let label: string;
	export let autocomplete: FullAutoFill = '';
</script>

<Label for={field.name}>{label}</Label>

<Input
	id={field.name}
	name={field.name}
	{type}
	value={field.state.value}
	class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'input-error')}
	aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
	{autocomplete}
	onchange={(e) => {
		const target = e.target as HTMLInputElement;
		field.handleChange(target.value);
	}}
/>

<FieldInfo {field} />
