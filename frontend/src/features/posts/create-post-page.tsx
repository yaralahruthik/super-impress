import { usePostApiPosts } from '@/api/posts/posts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/utils/get-error-message';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import * as z from 'zod';

const formSchema = z.object({
	title: z.string().trim(),
	content: z.string().trim().min(1, 'Content is required'),
	tagsInput: z.string().trim()
});

export default function CreatePostPage() {
	const [error, setError] = useState<string | null>(null);

	const navigate = useNavigate();
	const { mutate, isPending } = usePostApiPosts();

	const form = useForm({
		defaultValues: {
			title: '',
			content: '',
			tagsInput: ''
		},
		validators: {
			onSubmit: formSchema
		},
		onSubmit: async ({ value }) => {
			setError(null);

			const tags = value.tagsInput
				.split(',')
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0);

			mutate(
				{
					data: {
						title: value.title || undefined,
						content: value.content,
						tags: tags.length > 0 ? tags : undefined
					}
				},
				{
					onSuccess: () => {
						navigate({ to: '/posts' });
					},
					onError: (error) => {
						setError(getErrorMessage(error));
					}
				}
			);
		}
	});

	return (
		<div className="max-w-2xl py-8">
			<Card>
				<CardHeader>
					<CardTitle>Create Post</CardTitle>
					<CardDescription>Create a new post to share your thoughts</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						id="create-post-form"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<fieldset disabled={isPending} className="space-y-4">
							<FieldGroup>
								<form.Field
									name="title"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="title">Title</FieldLabel>
												<Input
													id="title"
													name="title"
													type="text"
													placeholder="Enter a title (optional)"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
												/>
												<p className="text-sm text-muted-foreground">
													Give your post a descriptive title
												</p>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										);
									}}
								/>
								<form.Field
									name="content"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="content">Content</FieldLabel>
												<Textarea
													id="content"
													name="content"
													placeholder="What's on your mind?"
													required
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										);
									}}
								/>
								<form.Field
									name="tagsInput"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="tagsInput">Tags</FieldLabel>
												<Input
													id="tagsInput"
													name="tagsInput"
													type="text"
													placeholder="tech, programming, ideas"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
												/>
												<p className="text-sm text-muted-foreground">Separate tags with commas</p>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										);
									}}
								/>
							</FieldGroup>

							{error && (
								<div
									role="alert"
									className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
								>
									{error}
								</div>
							)}

							<Button type="submit" className="w-full" aria-busy={isPending}>
								{isPending ? 'Creating...' : 'Create Post'}
							</Button>
						</fieldset>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
