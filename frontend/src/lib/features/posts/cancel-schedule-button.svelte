<script lang="ts">
	import { createCancelSchedule } from '$lib/api/posts/posts';
	import { X } from '@lucide/svelte';
	import { useQueryClient } from '@tanstack/svelte-query';
	import Button from '$lib/components/ui/button.svelte';

	type Props = { postId: number };
	let { postId }: Props = $props();

	const queryClient = useQueryClient();

	const cancelMutation = createCancelSchedule({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
			}
		}
	});

	function handleCancel() {
		if (confirm('Cancel this scheduled post?')) {
			cancelMutation.mutate({ postId });
		}
	}
</script>

<Button
	onclick={handleCancel}
	disabled={cancelMutation.isPending}
	variant="ghost"
	size="sm"
	class="gap-2"
>
	<X size={16} />
	Cancel
</Button>
