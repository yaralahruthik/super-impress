<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createCreatePost } from '$lib/api/posts/posts';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import AppLayout from '$lib/layouts/app-layout.svelte';
	import { cn } from '$lib/utils/cn';
	import { getErrorMessage } from '$lib/utils/get-error-message';
	import { createForm } from '@tanstack/svelte-form';
	import z from 'zod';
	import FieldInfo from '../auth/field-info.svelte';

	const createPostFormSchema = z.object({
		title: z.string().trim().optional(),
		content: z.string().trim().min(1, 'Content is required'),
		tagsInput: z.string().trim().optional()
	});

	const createPostMutation = createCreatePost({
		mutation: {
			onSuccess: () => {
				goto(resolve('/posts'));
			}
		}
	});

	const form = createForm(() => ({
		defaultValues: {
			title: '',
			content: '',
			tagsInput: ''
		},
		validators: {
			onSubmit: createPostFormSchema
		},
		onSubmit: async ({ value }) => {
			// Split comma-separated tags into array
			const tags =
				value.tagsInput
					?.split(',')
					.map((t) => t.trim())
					.filter(Boolean) || [];

			createPostMutation.mutate({
				data: {
					title: value.title || undefined,
					content: value.content,
					tags: tags.length > 0 ? tags : undefined
				}
			});
		}
	}));
</script>

<AppLayout>
	<div class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Create Post</h1>
	</div>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			e.stopPropagation();
			form.handleSubmit();
		}}
		class="my-4"
		aria-labelledby="form-heading"
	>
		<fieldset
			class="fieldset max-w-2xl rounded-box border border-base-300 bg-base-200 p-6"
			disabled={createPostMutation.isPending}
		>
			<legend id="form-heading" class="fieldset-legend">New Post</legend>

			<form.Field name="title">
				{#snippet children(field)}
					<Label for={field.name}>Title</Label>
					<Input
						id={field.name}
						name={field.name}
						value={field.state.value}
						type="text"
						class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'input-error')}
						aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
						placeholder="My awesome post"
						onchange={(e) => {
							const target = e.target as HTMLInputElement;
							field.handleChange(target.value);
						}}
					/>
					<p class="text-sm text-base-content/60">
						Optional: Give your post a title to help organize your drafts
					</p>
					<FieldInfo {field} />
				{/snippet}
			</form.Field>

			<form.Field name="content">
				{#snippet children(field)}
					<Label for={field.name}>Content *</Label>
					<Textarea
						id={field.name}
						name={field.name}
						value={field.state.value}
						rows={8}
						class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'textarea-error')}
						aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
						placeholder="Write your LinkedIn post content here..."
						onchange={(e) => {
							const target = e.target as HTMLTextAreaElement;
							field.handleChange(target.value);
						}}
					/>
					<p class="text-sm text-base-content/60">Write your LinkedIn post content here</p>
					<FieldInfo {field} />
				{/snippet}
			</form.Field>

			<form.Field name="tagsInput">
				{#snippet children(field)}
					<Label for={field.name}>Tags</Label>
					<Input
						id={field.name}
						name={field.name}
						value={field.state.value}
						type="text"
						class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'input-error')}
						aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
						placeholder="productivity, career, tips"
						onchange={(e) => {
							const target = e.target as HTMLInputElement;
							field.handleChange(target.value);
						}}
					/>
					<p class="text-sm text-base-content/60">
						Enter tags separated by commas (e.g., 'productivity, career, tips')
					</p>
					<FieldInfo {field} />
				{/snippet}
			</form.Field>

			<Button type="submit" class="mt-4" aria-busy={createPostMutation.isPending}>
				{createPostMutation.isPending ? 'Creating post...' : 'Create Post'}
			</Button>

			{#if createPostMutation.isError}
				<em role="alert" class="text-sm text-error" aria-live="polite">
					{getErrorMessage(createPostMutation.error)}
				</em>
			{/if}
		</fieldset>
	</form>
</AppLayout>
