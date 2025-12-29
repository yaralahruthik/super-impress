<script lang="ts">
	import { createGetLinkedinStatus } from '$lib/api/linkedin/linkedin';
	import LinkedInConnectButton from '$lib/features/linkedin/linkedin-connect-button.svelte';
	import LinkedInDisconnectButton from '$lib/features/linkedin/linkedin-disconnect-button.svelte';

	const statusQuery = createGetLinkedinStatus();
</script>

<div class="container mx-auto max-w-4xl px-4 py-8">
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
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
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
</div>
