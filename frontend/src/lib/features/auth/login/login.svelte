<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import AuthLayout from '$lib/layouts/auth-layout.svelte';
	import { cn } from '$lib/utils/cn';
	import { createForm } from '@tanstack/svelte-form';
	import { createMutation } from '@tanstack/svelte-query';
	import z from 'zod';
	import FieldInfo from '../field-info.svelte';
	import { loginApi } from './api';

	const loginFormSchema = z.object({
		email: z.email('Invalid email address').trim(),
		password: z.string().trim().min(1, 'Password is required')
	});

	const loginMutation = createMutation(() => ({
		mutationFn: loginApi,
		onSuccess: () => {
			goto(resolve('/'));
		}
	}));

	const form = createForm(() => ({
		defaultValues: {
			email: '',
			password: ''
		},
		validators: {
			onSubmit: loginFormSchema
		},
		onSubmit: async ({ value }) => {
			loginMutation.mutate(value);
		}
	}));
</script>

<AuthLayout>
	<h1 class="sr-only text-xl">Log in</h1>

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
			disabled={loginMutation.isPending}
		>
			<legend id="form-heading" class="fieldset-legend">Log In to your account</legend>

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
						autocomplete="current-password"
						onchange={(e) => {
							const target = e.target as HTMLInputElement;
							field.handleChange(target.value);
						}}
					/>

					<FieldInfo {field} />
				{/snippet}
			</form.Field>

			<button type="submit" class="btn mt-4 btn-neutral" aria-busy={loginMutation.isPending}>
				{loginMutation.isPending ? 'Logging in...' : 'Log in'}
			</button>
			{#if loginMutation.isError}
				<em role="alert" class="text-sm text-error" aria-live="polite" id="error-message">
					{loginMutation.error?.message}
				</em>
			{/if}
		</fieldset>
	</form>

	<p>
		Don't have an account?
		<a href={resolve('/register')} class="link" data-sveltekit-preload-data>Register</a>
	</p>
</AuthLayout>
