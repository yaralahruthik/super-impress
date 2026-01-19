<script lang="ts">
	import { createDisconnectLinkedin } from '$lib/api/linkedin/linkedin';
	import { useQueryClient } from '@tanstack/svelte-query';

	const queryClient = useQueryClient();

	const disconnectMutation = createDisconnectLinkedin({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['/api/linkedin/status'] });
			}
		}
	});

	function handleDisconnect() {
		if (
			confirm(
				'Are you sure you want to disconnect LinkedIn? You will need to reconnect to post to LinkedIn.'
			)
		) {
			disconnectMutation.mutate();
		}
	}
</script>

<button
	onclick={handleDisconnect}
	disabled={disconnectMutation.isPending}
	class="btn border-error/20 text-error btn-ghost btn-sm hover:bg-error/10"
>
	{#if disconnectMutation.isPending}
		<span class="loading loading-xs loading-spinner"></span>
		Disconnecting...
	{:else}
		Disconnect
	{/if}
</button>

{#if disconnectMutation.isError}
	<p class="mt-2 text-sm text-error">
		{disconnectMutation.error?.message || 'Failed to disconnect LinkedIn'}
	</p>
{/if}
