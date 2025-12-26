<script lang="ts">
	import type { PostPublic } from '$lib/api/superimpress.schemas';

	type Props = {
		post: PostPublic;
	};

	let { post }: Props = $props();
</script>

<div class="card bg-base-200 shadow-xl">
	<div class="card-body">
		{#if post.title}
			<h3 class="card-title">{post.title}</h3>
		{/if}

		<p class="whitespace-pre-wrap text-base-content/90">{post.content}</p>

		{#if post.tags && post.tags.length > 0}
			<div class="mt-2 card-actions justify-start">
				{#each post.tags as tag (tag)}
					<div class="badge badge-outline badge-sm">{tag}</div>
				{/each}
			</div>
		{/if}

		<div class="mt-2 text-xs text-base-content/50">
			<div class="badge badge-ghost badge-sm">{post.status}</div>
			<span class="ml-2">
				Created: {new Date(post.created_at).toLocaleDateString()}
			</span>
		</div>
	</div>
</div>
