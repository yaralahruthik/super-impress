<script lang="ts">
	import {
		createGetLinkedinStatus,
		createInitiateLinkedinConnection
	} from '$lib/api/linkedin/linkedin';

	const statusQuery = createGetLinkedinStatus();

	const connectMutation = createInitiateLinkedinConnection({
		mutation: {
			onSuccess: (data) => {
				sessionStorage.setItem('linkedin_oauth_state', data.state);
				window.location.href = data.authorization_url;
			}
		}
	});

	function handleConnect() {
		connectMutation.mutate();
	}
</script>

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
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
		</svg>
		<div>
			<h3 class="font-bold">LinkedIn Connected</h3>
			{#if statusQuery.data.connected_at}
				<div class="text-xs">
					Connected: {new Date(statusQuery.data.connected_at).toLocaleDateString()}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="card bg-base-200 shadow">
		<div class="card-body">
			<h3 class="card-title text-lg">Connect LinkedIn</h3>
			<p class="text-sm text-base-content/70">
				Connect your LinkedIn account to share your posts directly to your LinkedIn profile.
			</p>

			<button
				onclick={handleConnect}
				disabled={connectMutation.isPending}
				class="btn mt-4 btn-primary"
			>
				{connectMutation.isPending ? 'Connecting...' : 'Connect LinkedIn'}
			</button>

			{#if connectMutation.isError}
				<p class="mt-2 text-sm text-error">
					{connectMutation.error?.message || 'Failed to initiate LinkedIn connection'}
				</p>
			{/if}
		</div>
	</div>
{/if}
