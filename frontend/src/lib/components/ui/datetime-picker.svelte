<script lang="ts">
	import { Calendar, Popover } from 'bits-ui';
	import {
		CalendarDate,
		CalendarDateTime,
		getLocalTimeZone,
		parseAbsoluteToLocal,
		type DateValue
	} from '@internationalized/date';
	import { ChevronDown, ChevronLeft, ChevronRight } from '@lucide/svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import { cn } from '$lib/utils/cn';

	type Props = {
		value: string;
		onchange: (value: string) => void;
		minDate?: string;
		label?: string;
		id?: string;
		disabled?: boolean;
		class?: string;
		portalTarget?: string;
	};

	let {
		value = $bindable(),
		onchange,
		minDate,
		label,
		id = 'datetime-picker',
		disabled = false,
		class: className,
		portalTarget
	}: Props = $props();

	let open = $state(false);

	// Parse ISO string to CalendarDateTime
	function parseIsoToCalendarDateTime(isoString: string): CalendarDateTime | undefined {
		if (!isoString) return undefined;
		try {
			const zdt = parseAbsoluteToLocal(isoString);
			return new CalendarDateTime(zdt.year, zdt.month, zdt.day, zdt.hour, zdt.minute);
		} catch {
			return undefined;
		}
	}

	// Convert date and time to ISO string
	function toIsoString(date: DateValue, time: string): string {
		const [hour, minute] = time.split(':').map((n) => parseInt(n) || 0);
		return new CalendarDateTime(date.year, date.month, date.day, hour, minute)
			.toDate(getLocalTimeZone())
			.toISOString();
	}

	// Parse minDate to DateValue
	function parseMinDate(isoString?: string): DateValue | undefined {
		if (!isoString) return undefined;
		try {
			const zdt = parseAbsoluteToLocal(isoString);
			return new CalendarDate(zdt.year, zdt.month, zdt.day);
		} catch {
			return undefined;
		}
	}

	// State
	let calendarValue = $state<DateValue | undefined>(undefined);
	let timeValue = $state('12:00');

	// Sync from external value
	$effect(() => {
		const parsed = parseIsoToCalendarDateTime(value);
		if (parsed) {
			calendarValue = new CalendarDate(parsed.year, parsed.month, parsed.day);
			timeValue = `${parsed.hour.toString().padStart(2, '0')}:${parsed.minute.toString().padStart(2, '0')}`;
		}
	});

	// Emit change
	function emitChange() {
		if (calendarValue) {
			onchange(toIsoString(calendarValue, timeValue));
		}
	}

	function handleCalendarChange() {
		emitChange();
		open = false;
	}

	function handleTimeChange() {
		emitChange();
	}

	// Display
	const displayDate = $derived(
		calendarValue ? calendarValue.toDate(getLocalTimeZone()).toLocaleDateString() : 'Select date'
	);

	const minValue = $derived(parseMinDate(minDate));
</script>

<div class={cn('flex gap-3', className)}>
	<div class="flex flex-1 flex-col gap-1.5">
		{#if label}
			<Label for="{id}-date" class="text-sm font-medium text-base-content/80">{label}</Label>
		{/if}
		<Popover.Root bind:open>
			<Popover.Trigger id="{id}-date" {disabled} class="w-full">
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						{disabled}
						class={cn(
							'w-full justify-between font-normal',
							!calendarValue && 'text-base-content/50'
						)}
					>
						{displayDate}
						<ChevronDown class="size-4 opacity-50" />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Portal to={portalTarget}>
				<Popover.Content
					class="w-auto overflow-hidden rounded-box border border-base-300 bg-base-100 p-0 shadow-xl"
					align="start"
					sideOffset={4}
				>
					<Calendar.Root
						type="single"
						bind:value={calendarValue}
						onValueChange={handleCalendarChange}
						weekdayFormat="short"
						fixedWeeks={true}
						{minValue}
						class="p-3"
					>
						{#snippet children({ months, weekdays })}
							<Calendar.Header class="relative flex w-full items-center justify-center pt-1">
								<Calendar.PrevButton
									class="btn absolute left-0 btn-square opacity-50 btn-ghost btn-sm hover:opacity-100 disabled:pointer-events-none disabled:opacity-30"
								>
									<ChevronLeft class="size-4" />
								</Calendar.PrevButton>

								<div class="flex items-center gap-1">
									<Calendar.MonthSelect
										class="select cursor-pointer select-ghost select-sm text-sm font-medium focus:outline-none"
									/>
									<Calendar.YearSelect
										class="select cursor-pointer select-ghost select-sm text-sm font-medium focus:outline-none"
									/>
								</div>

								<Calendar.NextButton
									class="btn absolute right-0 btn-square opacity-50 btn-ghost btn-sm hover:opacity-100 disabled:pointer-events-none disabled:opacity-30"
								>
									<ChevronRight class="size-4" />
								</Calendar.NextButton>
							</Calendar.Header>

							<div class="pt-4">
								{#each months as month (month.value.toString())}
									<Calendar.Grid class="w-full border-collapse space-y-1 select-none">
										<Calendar.GridHead>
											<Calendar.GridRow class="mb-1 flex w-full justify-between">
												{#each weekdays as day (day)}
													<Calendar.HeadCell
														class="w-9 rounded-md text-center text-xs font-normal text-base-content/60"
													>
														{day.slice(0, 2)}
													</Calendar.HeadCell>
												{/each}
											</Calendar.GridRow>
										</Calendar.GridHead>

										<Calendar.GridBody>
											{#each month.weeks as weekDates, weekIndex (weekIndex)}
												<Calendar.GridRow class="flex w-full">
													{#each weekDates as date (date.toString())}
														<Calendar.Cell
															{date}
															month={month.value}
															class="relative size-9 p-0 text-center text-sm"
														>
															<Calendar.Day
																class={cn(
																	'btn inline-flex size-9 items-center justify-center p-0 text-sm font-normal btn-ghost btn-sm hover:bg-primary hover:text-primary-content',
																	'data-selected:bg-primary data-selected:text-primary-content',
																	'data-today:border-primary',
																	'data-outside-month:text-base-content/10'
																)}
															>
																{date.day}
															</Calendar.Day>
														</Calendar.Cell>
													{/each}
												</Calendar.GridRow>
											{/each}
										</Calendar.GridBody>
									</Calendar.Grid>
								{/each}
							</div>
						{/snippet}
					</Calendar.Root>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	</div>

	<div class="flex flex-col gap-1.5">
		{#if label}
			<Label for="{id}-time" class="text-sm font-medium text-base-content/80">Time</Label>
		{/if}
		<Input
			type="time"
			id="{id}-time"
			bind:value={timeValue}
			onchange={handleTimeChange}
			{disabled}
			class="w-32 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
		/>
	</div>
</div>
