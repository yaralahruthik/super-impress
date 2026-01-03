<script lang="ts">
	import { createGetLinkedinStatus, createPostToLinkedin } from '$lib/api/linkedin/linkedin';
	import { Linkedin } from '@lucide/svelte';
	import { useQueryClient } from '@tanstack/svelte-query';

	type Props = {
		postId: number;
		status: string;
	};

	let { postId, status }: Props = $props();

	const isPublished = $derived(status === 'published');
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
	<button
		onclick={handlePost}
		disabled={postMutation.isPending || isPublished}
		class="btn gap-2 btn-primary"
	>
		<Linkedin size={16} />
		{#if isPublished}
			Just Published
		{:else if postMutation.isPending}
			Posting...
		{:else}
			Post to LinkedIn
		{/if}
	</button>

	{#if postMutation.isError}
		<p class="mt-2 text-sm text-error">
			{postMutation.error?.message || 'Failed to post to LinkedIn'}
		</p>
	{/if}
{:else}
	<div class="tooltip" data-tip="Connect LinkedIn in Settings to post">
		<button disabled class="btn gap-2 btn-outline">
			<Linkedin size={16} />
			Post to LinkedIn
		</button>
	</div>
{/if}
