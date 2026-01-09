<script lang="ts">
	import { format } from 'date-fns';
	import Label from '$lib/components/ui/label.svelte';
	import { cn } from '$lib/utils/cn';

	type Props = {
		value: string;
		onchange: (value: string) => void;
		minDate?: string;
		label?: string;
		id?: string;
		required?: boolean;
		disabled?: boolean;
		class?: string;
	};

	let {
		value = $bindable(),
		onchange,
		minDate,
		label,
		id = 'datetime-picker',
		required = false,
		disabled = false,
		class: className
	}: Props = $props();

	let inputRef: HTMLInputElement | undefined = $state();

	const toDatetimeLocal = (isoString: string) => {
		if (!isoString) return '';
		return format(new Date(isoString), "yyyy-MM-dd'T'HH:mm");
	};

	const fromDatetimeLocal = (datetimeLocal: string) => {
		if (!datetimeLocal) return '';
		return new Date(datetimeLocal).toISOString();
	};

	let localValue = $state(toDatetimeLocal(value));

	const handleChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		localValue = target.value;
		const isoValue = fromDatetimeLocal(target.value);
		onchange(isoValue);
	};

	function openPicker() {
		if (!disabled && inputRef) {
			try {
				inputRef.showPicker();
			} catch {
				inputRef.focus();
			}
		}
	}
</script>

<div class={cn('w-full', className)}>
	{#if label}
		<Label for={id} class="pt-0 pb-1.5 font-medium text-base-content/80">
			{label}
		</Label>
	{/if}

	<div
		class="group relative cursor-pointer"
		onclick={openPicker}
		onkeydown={(e) => e.key === 'Enter' && openPicker()}
		role="button"
		tabindex="0"
	>
		<input
			bind:this={inputRef}
			{id}
			type="datetime-local"
			value={localValue}
			onchange={handleChange}
			min={minDate ? toDatetimeLocal(minDate) : undefined}
			{required}
			{disabled}
			class={cn(
				'input w-full pr-10 font-medium transition-all hover:border-base-content/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none',
				'tracking-wide text-base-content tabular-nums',
				disabled && 'cursor-not-allowed opacity-50'
			)}
		/>
	</div>
</div>
