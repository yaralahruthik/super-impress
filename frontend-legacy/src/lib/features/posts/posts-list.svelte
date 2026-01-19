<script lang="ts">
	import { resolve } from '$app/paths';
	import { createListPosts } from '$lib/api/posts/posts';
	import Button from '$lib/components/ui/button.svelte';
	import AppLayout from '$lib/layouts/app-layout.svelte';
	import PostCard from './post-card.svelte';

	const postsQuery = createListPosts({
		limit: 100,
		offset: 0
	});
</script>

<AppLayout>
	{#if postsQuery.isPending}
		<div class="flex h-[50vh] items-center justify-center">
			<div
				class="loading loading-lg loading-spinner text-primary"
				role="status"
				aria-label="Loading posts"
			></div>
		</div>
	{:else if postsQuery.isError}
		<div role="alert" class="alert alert-error">
			<span>Failed to load posts. Please try again.</span>
		</div>
	{:else if postsQuery.data}
		{#if postsQuery.data.posts.length === 0}
			<div class="flex h-[50vh] flex-col items-center justify-center space-y-4">
				<p class="text-lg text-base-content/70">You haven't created any posts yet.</p>
				<Button href={resolve('/posts/new')}>Create Your First Post</Button>
			</div>
		{:else}
			<div class="mb-6 flex items-center justify-between">
				<div class="space-y-1">
					<h1 class="text-3xl font-bold tracking-tight">Posts</h1>
					<p class="text-base-content/70">
						{postsQuery.data.total}
						{postsQuery.data.total === 1 ? 'post' : 'posts'}
					</p>
				</div>
				<Button href={resolve('/posts/new')}>Create Post</Button>
			</div>

			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each postsQuery.data.posts as post (post.id)}
					<PostCard {post} />
				{/each}
			</div>
		{/if}
	{/if}
</AppLayout>
