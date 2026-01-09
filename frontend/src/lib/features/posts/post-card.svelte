<script lang="ts">
	import type { PostPublic } from '$lib/api/superimpress.schemas';
	import PostToLinkedinButton from '$lib/features/linkedin/post-to-linkedin-button.svelte';
	import SchedulePostButton from './schedule-post-button.svelte';
	import CancelScheduleButton from './cancel-schedule-button.svelte';
	import { formatDate } from '$lib/utils/format-date';
	import { cn } from '$lib/utils/cn';
	import { Clock, CircleAlert, Calendar } from '@lucide/svelte';

	type Props = {
		post: PostPublic;
	};

	let { post }: Props = $props();
</script>

<div
	class="group card border border-base-200 bg-base-100 transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
>
	<div class="card-body p-5">
		<div class="mb-3 flex items-start justify-between">
			<div class="flex items-center gap-2 text-xs font-medium text-base-content/60">
				<span class="flex items-center gap-1">
					<Calendar size={12} />
					{formatDate(post.created_at, 'MMMM D, YYYY')}
				</span>
			</div>

			<div
				class={cn(
					'badge gap-1.5 border-0 badge-sm font-semibold',
					post.status === 'published' && 'bg-success/15 text-success',
					post.status === 'scheduled' && 'bg-warning/15 text-warning',
					post.status === 'failed' && 'bg-error/15 text-error',
					!['published', 'scheduled', 'failed'].includes(post.status) && 'badge-ghost'
				)}
			>
				{#if post.status === 'scheduled'}
					<Clock size={10} />
				{:else if post.status === 'failed'}
					<CircleAlert size={10} />
				{:else if post.status === 'published'}
					<div class="size-1.5 rounded-full bg-current"></div>
				{/if}
				<span class="capitalize">{post.status}</span>
			</div>
		</div>

		<div class="flex-1">
			{#if post.title}
				<h3
					class="mb-2 line-clamp-1 text-lg font-bold tracking-tight text-base-content transition-colors group-hover:text-primary"
				>
					{post.title}
				</h3>
			{/if}

			<p class="line-clamp-3 text-sm leading-relaxed text-base-content/70">
				{post.content}
			</p>
		</div>

		{#if post.scheduled_for && post.status === 'scheduled'}
			<div
				class="mt-3 flex items-center gap-2 rounded-md bg-base-200/50 px-3 py-2 text-xs text-base-content/70"
			>
				<Clock size={12} class="text-primary" />
				<span
					>Scheduled for <span class="font-semibold text-base-content"
						>{formatDate(post.scheduled_for, 'MMM DD, h:mm a')}</span
					></span
				>
			</div>
		{/if}

		{#if post.status === 'failed' && post.reason_failed}
			<div class="mt-3 rounded-md bg-error/10 px-3 py-2 text-xs font-medium text-error">
				<div class="flex items-start gap-2">
					<CircleAlert size={14} class="mt-0.5 shrink-0" />
					<span>{post.reason_failed}</span>
				</div>
			</div>
		{/if}

		<div class="mt-5 flex flex-col gap-4 border-t border-base-200 pt-4">
			<div class="flex flex-wrap gap-1.5">
				{#if post.tags && post.tags.length > 0}
					{#each post.tags.slice(0, 2) as tag (tag)}
						<div class="badge badge-xs font-medium badge-neutral">{tag}</div>
					{/each}
					{#if post.tags.length > 2}
						<div class="badge badge-ghost badge-xs">+{post.tags.length - 2}</div>
					{/if}
				{:else}
					<span class="text-xs text-base-content/40 italic">No tags</span>
				{/if}
			</div>

			<div class="flex w-full items-center justify-end gap-2">
				{#if post.status === 'scheduled'}
					<CancelScheduleButton postId={post.id} />
				{/if}

				<SchedulePostButton
					postId={post.id}
					status={post.status}
					currentScheduledFor={post.scheduled_for}
				/>

				<PostToLinkedinButton postId={post.id} status={post.status} />
			</div>
		</div>
	</div>
</div>
