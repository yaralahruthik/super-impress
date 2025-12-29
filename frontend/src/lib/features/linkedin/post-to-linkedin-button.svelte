<script lang="ts">
	import { createGetLinkedinStatus, createPostToLinkedin } from '$lib/api/linkedin/linkedin';
	import { Linkedin } from '@lucide/svelte';

	type Props = {
		postId: number;
	};

	let { postId }: Props = $props();

	const statusQuery = createGetLinkedinStatus();

	const postMutation = createPostToLinkedin({
		mutation: {
			onSuccess: (data) => {
				if (data.success) {
					alert('Successfully posted to LinkedIn!');
				} else {
					alert(`Failed to post to LinkedIn: ${data.error}`);
				}
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
	<button onclick={handlePost} disabled={postMutation.isPending} class="btn gap-2 btn-primary">
		<Linkedin size={16} />
		{postMutation.isPending ? 'Posting...' : 'Post to LinkedIn'}
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
