<script lang="ts">
	import { createInitiateLinkedinConnection } from '$lib/api/linkedin/linkedin';

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

<div>
	<button onclick={handleConnect} disabled={connectMutation.isPending} class="btn btn-primary">
		{connectMutation.isPending ? 'Connecting...' : 'Connect LinkedIn'}
	</button>

	{#if connectMutation.isError}
		<p class="mt-2 text-sm text-error">
			{connectMutation.error?.message || 'Failed to initiate LinkedIn connection'}
		</p>
	{/if}
</div>
