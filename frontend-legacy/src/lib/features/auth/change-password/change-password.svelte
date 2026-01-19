<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createChangePassword } from '$lib/api/authentication/authentication';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import AppLayout from '$lib/layouts/app-layout.svelte';
	import { cn } from '$lib/utils/cn';
	import { getErrorMessage } from '$lib/utils/get-error-message';
	import { createForm } from '@tanstack/svelte-form';
	import z from 'zod';
	import FieldInfo from '../field-info.svelte';

	const changePasswordFormSchema = z
		.object({
			currentPassword: z.string().trim().min(1, 'Current password is required'),
			newPassword: z.string().trim().min(1, 'New password is required'),
			confirmNewPassword: z.string()
		})
		.refine((data) => data.newPassword === data.confirmNewPassword, {
			error: 'Passwords do not match',
			path: ['confirmNewPassword']
		});

	const changePasswordMutation = createChangePassword({
		mutation: {
			onSuccess: () => {
				goto(resolve('/'));
			}
		}
	});

	const form = createForm(() => ({
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: ''
		},
		validators: { onSubmit: changePasswordFormSchema },
		onSubmit: async ({ value }) => {
			changePasswordMutation.mutate({
				data: { old_password: value.currentPassword, new_password: value.newPassword }
			});
		}
	}));
</script>

<AppLayout>
	<h1 class="sr-only text-xl">Change Password</h1>

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
			class="fieldset w-xs rounded-box border border-base-300 bg-base-200 p-4"
			disabled={changePasswordMutation.isPending}
		>
			<legend id="form-heading" class="fieldset-legend">Change your password</legend>

			<form.Field name="currentPassword">
				{#snippet children(field)}
					<Label for={field.name}>Current password</Label>
					<Input
						id={field.name}
						name={field.name}
						value={field.state.value}
						type="password"
						class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'input-error')}
						aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
						autocomplete="current-password"
						onchange={(e) => {
							const target = e.target as HTMLInputElement;
							field.handleChange(target.value);
						}}
					/>
					<FieldInfo {field} />
				{/snippet}
			</form.Field>

			<form.Field name="newPassword">
				{#snippet children(field)}
					<Label for={field.name}>New password</Label>
					<Input
						id={field.name}
						name={field.name}
						value={field.state.value}
						type="password"
						class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'input-error')}
						aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
						autocomplete="new-password"
						onchange={(e) => {
							const target = e.target as HTMLInputElement;
							field.handleChange(target.value);
						}}
					/>

					<FieldInfo {field} />
				{/snippet}
			</form.Field>

			<form.Field name="confirmNewPassword">
				{#snippet children(field)}
					<Label for={field.name}>Confirm new password</Label>
					<Input
						id={field.name}
						name={field.name}
						value={field.state.value}
						type="password"
						class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'input-error')}
						aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
						autocomplete="new-password"
						onchange={(e) => {
							const target = e.target as HTMLInputElement;
							field.handleChange(target.value);
						}}
					/>

					<FieldInfo {field} />
				{/snippet}
			</form.Field>

			<Button type="submit" class="mt-4" aria-busy={changePasswordMutation.isPending}>
				{changePasswordMutation.isPending ? 'Changing password...' : 'Change Password'}
			</Button>

			{#if changePasswordMutation.isError}
				<em role="alert" class="text-sm text-error" aria-live="polite" id="error-message">
					{getErrorMessage(changePasswordMutation.error)}
				</em>
			{/if}
		</fieldset>
	</form>
</AppLayout>
