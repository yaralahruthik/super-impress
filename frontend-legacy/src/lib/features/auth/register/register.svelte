<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createRegisterUser } from '$lib/api/authentication/authentication';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import AuthLayout from '$lib/layouts/auth-layout.svelte';
	import { cn } from '$lib/utils/cn';
	import { getErrorMessage } from '$lib/utils/get-error-message';
	import { createForm } from '@tanstack/svelte-form';
	import z from 'zod';
	import FieldInfo from '../field-info.svelte';

	const registerFormSchema = z
		.object({
			email: z.email('Invalid email address').trim(),
			password: z.string().trim().min(1, 'Password is required'),
			confirmPassword: z.string()
		})
		.refine((data) => data.password === data.confirmPassword, {
			error: 'Passwords do not match',
			path: ['confirmPassword']
		});

	const registerMutation = createRegisterUser({
		mutation: {
			onSuccess: () => {
				goto(resolve('/login'));
			}
		}
	});

	const form = createForm(() => ({
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: ''
		},
		validators: { onSubmit: registerFormSchema },
		onSubmit: async ({ value }) => {
			registerMutation.mutate({
				data: { email: value.email, password: value.password }
			});
		}
	}));
</script>

<AuthLayout>
	<h1 class="sr-only text-xl">Register</h1>

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
			disabled={registerMutation.isPending}
		>
			<legend id="form-heading" class="fieldset-legend">Create your account</legend>

			<form.Field name="email">
				{#snippet children(field)}
					<Label for={field.name}>Email</Label>
					<Input
						id={field.name}
						name={field.name}
						value={field.state.value}
						type="email"
						class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'input-error')}
						aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
						autocomplete="email"
						onchange={(e) => {
							const target = e.target as HTMLInputElement;
							field.handleChange(target.value);
						}}
					/>

					<FieldInfo {field} />
				{/snippet}
			</form.Field>

			<form.Field name="password">
				{#snippet children(field)}
					<Label for={field.name}>Password</Label>
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

			<form.Field name="confirmPassword">
				{#snippet children(field)}
					<Label for={field.name}>Confirm password</Label>
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

			<Button type="submit" class="mt-4" aria-busy={registerMutation.isPending}>
				{registerMutation.isPending ? 'Registering...' : 'Register'}
			</Button>

			{#if registerMutation.isError}
				<em role="alert" class="text-sm text-error" aria-live="polite" id="error-message">
					{getErrorMessage(registerMutation.error)}
				</em>
			{/if}
		</fieldset>
	</form>

	<p>
		Already have an account?
		<a href={resolve('/login')} class="link" data-sveltekit-preload-data>Log in</a>
	</p>
</AuthLayout>
