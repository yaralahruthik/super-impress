<script lang="ts">
	import { Linkedin, CheckCircle2, AlertCircle, Calendar, MessageCircle } from '@lucide/svelte';
	import LinkedInConnectButton from './linkedin-connect-button.svelte';
	import LinkedInDisconnectButton from './linkedin-disconnect-button.svelte';
	import type { LinkedInConnectionStatus } from '$lib/api/superimpress.schemas';

	let { status, loading = false }: { status: LinkedInConnectionStatus; loading?: boolean } =
		$props();

	function formatDate(dateString: string | null | undefined) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<div class="group card overflow-hidden border border-base-content/5 bg-base-100 shadow-xl">
	<div class="h-2 bg-[#0077B5]"></div>
	<div class="card-body p-6">
		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div
					class="rounded-2xl bg-[#0077B5]/10 p-3 text-[#0077B5] transition-colors group-hover:bg-[#0077B5]/20"
				>
					<Linkedin class="size-8" />
				</div>
				<div>
					<h2 class="text-xl font-bold tracking-tight">LinkedIn</h2>
					<p class="text-xs font-medium tracking-wider text-base-content/50 uppercase">
						Professional Network
					</p>
				</div>
			</div>

			<div class="flex flex-col items-end">
				{#if loading}
					<span class="loading loading-sm loading-spinner text-[#0077B5]"></span>
				{:else if status.connected}
					<div class="badge gap-1.5 badge-outline p-3.5 text-xs font-semibold badge-success">
						<CheckCircle2 class="size-3.5" />
						ACTIVE
					</div>
				{:else}
					<div
						class="badge gap-1.5 border-dashed badge-ghost p-3.5 text-xs font-semibold text-base-content/40"
					>
						<AlertCircle class="size-3.5" />
						NOT CONNECTED
					</div>
				{/if}
			</div>
		</div>

		{#if status.connected}
			<div class="space-y-6">
				<div
					class="grid grid-cols-1 gap-4 rounded-xl border border-base-content/5 bg-base-200/30 p-4 sm:grid-cols-2"
				>
					<div class="space-y-1">
						<div
							class="flex items-center gap-2 text-xs font-semibold tracking-tight text-base-content/50 uppercase"
						>
							<Calendar class="size-3.5" />
							Connected on
						</div>
						<p class="text-sm font-medium">{formatDate(status.connected_at)}</p>
					</div>
					{#if status.expires_at}
						<div class="space-y-1">
							<div
								class="flex items-center gap-2 text-xs font-semibold tracking-tight text-base-content/50 uppercase"
							>
								<div class="h-1.5 w-1.5 rounded-full bg-warning"></div>
								Re-auth required by
							</div>
							<p class="text-sm font-medium">{formatDate(status.expires_at)}</p>
						</div>
					{/if}
				</div>

				<div class="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
					<div class="flex items-center gap-2 text-xs text-base-content/40 italic">
						<MessageCircle class="size-3.5" />
						<span>Super Impress is authorized to post updates to your profile.</span>
					</div>
					<div class="w-full sm:w-auto">
						<LinkedInDisconnectButton />
					</div>
				</div>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center space-y-6 py-6 text-center">
				<div class="max-w-sm space-y-2">
					<h3 class="text-lg font-semibold">Share your progress effortlessly</h3>
					<p class="text-sm leading-relaxed text-base-content/60">
						Connect your account to automatically share your achievements, updates, and milestones
						with your professional network.
					</p>
				</div>
				<div class="w-full sm:w-auto">
					<LinkedInConnectButton />
				</div>
			</div>
		{/if}
	</div>
</div>
