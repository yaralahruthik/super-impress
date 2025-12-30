<script lang="ts">
	import { createGetLinkedinStatus } from '$lib/api/linkedin/linkedin';
	import LinkedInConnectButton from '$lib/features/linkedin/linkedin-connect-button.svelte';
	import LinkedInDisconnectButton from '$lib/features/linkedin/linkedin-disconnect-button.svelte';
	import AppLayout from '$lib/layouts/app-layout.svelte';
	import { Check } from '@lucide/svelte';

	const statusQuery = createGetLinkedinStatus();
</script>

<AppLayout>
	<div class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Settings</h1>
	</div>

	<div class="space-y-6">
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<h2 class="mb-4 card-title text-xl">LinkedIn Integration</h2>

				{#if statusQuery.isLoading}
					<p class="text-sm text-base-content/60">Checking LinkedIn connection...</p>
				{:else if statusQuery.data?.connected}
					<div class="alert alert-success">
						<Check class="h-6 w-6" />
						<span class="font-bold">LinkedIn Connected</span>
					</div>
					<div class="mt-4">
						<LinkedInDisconnectButton />
					</div>
				{:else}
					<LinkedInConnectButton />
				{/if}
			</div>
		</div>
	</div>
</AppLayout>
