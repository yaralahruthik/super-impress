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
	class="btn btn-outline btn-error"
>
	{disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect LinkedIn'}
</button>

{#if disconnectMutation.isError}
	<p class="mt-2 text-sm text-error">
		{disconnectMutation.error?.message || 'Failed to disconnect LinkedIn'}
	</p>
{/if}
