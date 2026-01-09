<script lang="ts">
	import { createGetLinkedinStatus, createPostToLinkedin } from '$lib/api/linkedin/linkedin';
	import { Linkedin } from '@lucide/svelte';
	import { useQueryClient } from '@tanstack/svelte-query';
	import Button from '$lib/components/ui/button.svelte';

	type Props = {
		postId: number;
		status: string;
	};

	let { postId, status }: Props = $props();

	const isPublished = $derived(status === 'published');
	const isScheduled = $derived(status === 'scheduled');
	const queryClient = useQueryClient();

	const statusQuery = createGetLinkedinStatus();

	const postMutation = createPostToLinkedin({
		mutation: {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
				alert('Successfully posted to LinkedIn!');
			}
		}
	});

	function handlePost() {
		if (confirm('Post this content to LinkedIn?')) {
			postMutation.mutate({
				data: { post_id: postId }
			});
		}
	}
</script>

{#if statusQuery.data?.connected}
	<Button
		onclick={handlePost}
		disabled={postMutation.isPending || isPublished || isScheduled}
		class="gap-2"
	>
		<Linkedin size={16} />
		{#if isPublished}
			Published
		{:else if isScheduled}
			Scheduled
		{:else if postMutation.isPending}
			Posting...
		{:else}
			Post Now
		{/if}
	</Button>

	{#if postMutation.isError}
		<p class="mt-2 text-sm text-error">
			{postMutation.error?.message || 'Failed to post to LinkedIn'}
		</p>
	{/if}
{:else}
	<div class="tooltip" data-tip="Connect LinkedIn in Settings to post">
		<Button disabled variant="outline" class="gap-2">
			<Linkedin size={16} />
			Post to LinkedIn
		</Button>
	</div>
{/if}
