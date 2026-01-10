<script lang="ts">
	import { createSchedulePost, createReschedulePost } from '$lib/api/posts/posts';
	import DatetimePicker from '$lib/components/ui/datetime-picker.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { Clock, X } from '@lucide/svelte';
	import { useQueryClient } from '@tanstack/svelte-query';
	import { addMinutes } from 'date-fns';
	import { untrack } from 'svelte';
	import { getErrorMessage } from '$lib/utils/get-error-message';

	type Props = {
		postId: number;
		status: string;
		currentScheduledFor?: string | null;
	};

	let { postId, status, currentScheduledFor }: Props = $props();

	const queryClient = useQueryClient();
	let showModal = $state(false);
	let scheduledFor = $state(
		untrack(() => currentScheduledFor) || addMinutes(new Date(), 30).toISOString()
	);
	let dialogRef: HTMLDialogElement | undefined = $state();

	const isScheduled = $derived(status === 'scheduled');
	const isFailed = $derived(status === 'failed');
	const canSchedule = $derived(['draft', 'failed', 'scheduled'].includes(status));

	const scheduleMutation = createSchedulePost({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
				closeModal();
			}
		}
	});

	const rescheduleMutation = createReschedulePost({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
				closeModal();
			}
		}
	});

	function closeModal() {
		dialogRef?.close();
	}

	function openModal() {
		scheduledFor = currentScheduledFor || addMinutes(new Date(), 30).toISOString();
		showModal = true;
	}

	function handleSchedule() {
		if (isScheduled || isFailed) {
			rescheduleMutation.mutate({ postId, data: { scheduled_for: scheduledFor } });
		} else {
			scheduleMutation.mutate({ postId, data: { scheduled_for: scheduledFor } });
		}
	}

	const isPending = $derived(scheduleMutation.isPending || rescheduleMutation.isPending);
	const isError = $derived(scheduleMutation.isError || rescheduleMutation.isError);
	const error = $derived(scheduleMutation.error || rescheduleMutation.error);

	$effect(() => {
		if (showModal && dialogRef && !dialogRef.open) {
			dialogRef.showModal();
		}
	});
</script>

{#if canSchedule}
	<Button
		onclick={openModal}
		variant="outline"
		class="gap-2 hover:bg-primary/10 hover:text-primary"
	>
		<Clock size={16} />
		{#if isScheduled}
			<span class="hidden sm:inline">Reschedule</span>
		{:else if isFailed}
			<span>Retry</span>
		{:else}
			<span>Schedule</span>
		{/if}
	</Button>

	{#if showModal}
		<dialog
			bind:this={dialogRef}
			class="modal backdrop:bg-base-content/20 backdrop:backdrop-blur-sm"
			onclose={() => (showModal = false)}
		>
			<div
				id="schedule-modal-portal"
				class="relative modal-box flex max-w-sm flex-col gap-4 overflow-visible rounded-xl border border-base-200 bg-base-100 p-6 shadow-2xl"
			>
				<Button
					onclick={closeModal}
					variant="ghost"
					size="sm"
					class="absolute top-3 right-3 btn-circle text-base-content/50 hover:text-base-content"
				>
					<X size={18} />
				</Button>

				<div class="flex flex-col items-center gap-2 text-center">
					<div
						class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<Clock size={16} />
					</div>
					<h3 class="text-xl font-bold tracking-tight">
						{isScheduled ? 'Reschedule Post' : 'Schedule Post'}
					</h3>
					<p class="text-sm text-base-content/60">Pick a date and time to publish this post.</p>
				</div>

				<DatetimePicker
					label="Date"
					value={scheduledFor}
					onchange={(v: string) => (scheduledFor = v)}
					minDate={new Date().toISOString()}
					portalTarget="#schedule-modal-portal"
				/>

				<div class="flex gap-3">
					<Button
						onclick={closeModal}
						variant="ghost"
						class="flex-1 border-none bg-base-200 hover:bg-base-300 hover:no-underline"
					>
						Cancel
					</Button>
					<Button
						onclick={handleSchedule}
						disabled={isPending}
						class="flex-1 shadow-lg shadow-primary/25"
					>
						{#if isPending}
							<span class="loading loading-xs loading-spinner"></span>
						{:else}
							<Clock size={16} />
						{/if}
						{isScheduled ? 'Reschedule' : 'Schedule'}
					</Button>
				</div>

				{#if isError}
					<p class="text-center text-sm text-error">
						{getErrorMessage(error)}
					</p>
				{/if}
			</div>

			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	{/if}
{/if}
