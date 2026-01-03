<script lang="ts">
	import { createInitiateLinkedinConnection } from '$lib/api/linkedin/linkedin';

	import { Linkedin } from '@lucide/svelte';

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
	<button
		onclick={handleConnect}
		disabled={connectMutation.isPending}
		class="btn border-none bg-[#0077B5] text-white shadow-md transition-all hover:bg-[#006097] hover:shadow-lg"
	>
		{#if connectMutation.isPending}
			<span class="loading loading-xs loading-spinner"></span>
			Connecting...
		{:else}
			<Linkedin class="h-4 w-4" />
			Connect LinkedIn
		{/if}
	</button>

	{#if connectMutation.isError}
		<p class="mt-2 text-sm text-error">
			{connectMutation.error?.message || 'Failed to initiate LinkedIn connection'}
		</p>
	{/if}
</div>
