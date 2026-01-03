<script lang="ts">
	import type { PostPublic } from '$lib/api/superimpress.schemas';
	import PostToLinkedinButton from '$lib/features/linkedin/post-to-linkedin-button.svelte';
	import { formatDate } from '$lib/utils/format-date';

	type Props = {
		post: PostPublic;
	};

	let { post }: Props = $props();
</script>

<div
	class="card border border-base-200 bg-base-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
>
	<div class="card-body p-6">
		<div class="mb-2 flex items-start justify-between">
			<div class="flex flex-col">
				<div class="flex items-center gap-2 text-xs font-medium text-base-content/60">
					<span>{formatDate(post.created_at, 'MM/DD/YYYY')}</span>
					<span>•</span>
					<span
						class:text-success={post.status === 'published'}
						class:text-base-content={post.status !== 'published'}
						class="capitalize"
					>
						{post.status}
					</span>
				</div>
			</div>
		</div>

		{#if post.title}
			<h3 class="mb-2 card-title text-xl font-bold tracking-tight text-base-content">
				{post.title}
			</h3>
		{/if}

		<p class="line-clamp-3 text-base text-base-content/80">
			{post.content}
		</p>

		<div class="mt-6 flex items-center justify-between">
			{#if post.tags && post.tags.length > 0}
				<div class="flex gap-2">
					{#each post.tags.slice(0, 3) as tag (tag)}
						<div class="badge badge-sm font-medium badge-neutral">{tag}</div>
					{/each}
					{#if post.tags.length > 3}
						<div class="badge badge-ghost badge-sm">+{post.tags.length - 3}</div>
					{/if}
				</div>
			{/if}

			<div class="ml-auto">
				<PostToLinkedinButton postId={post.id} status={post.status} />
			</div>
		</div>
	</div>
</div>
