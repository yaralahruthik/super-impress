<script lang="ts">
	export let type: string = 'text';
	export let id: string;
	export let value: string = '';
	export let required: boolean = false;
	export let disabled: boolean = false;
	export let placeholder: string = '';
	export let classes: string = '';
</script>

<input
	{type}
	{id}
	bind:value
	{required}
	{disabled}
	{placeholder}
	class="w-full rounded border p-2 disabled:cursor-not-allowed disabled:bg-gray-100 {classes}"
/>
