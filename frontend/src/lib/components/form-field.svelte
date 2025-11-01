<script lang="ts">
	import Input from './Input.svelte';

	export let label: string;
	export let id: string;
	export let type: string = 'text';
	export let value: string = '';
	export let required: boolean = false;
	export let disabled: boolean = false;
	export let placeholder: string = '';
	export let classes: string = '';
</script>

<div class="flex w-full flex-col gap-2">
	<label for={id}>{label}</label>
	<Input {type} {id} bind:value {required} {disabled} {placeholder} {classes} />
</div>
