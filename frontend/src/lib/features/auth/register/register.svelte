<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AuthLayout from '$lib/layouts/auth-layout.svelte';
	import { createForm } from '@tanstack/svelte-form';
	import { createMutation } from '@tanstack/svelte-query';
	import z from 'zod';
	import FieldInfo from '../field-info.svelte';
	import { registerApi } from './api';

	const registerMutation = createMutation(() => ({
		mutationFn: registerApi,
		onSuccess: () => {
			goto(resolve('/login'));
		}
	}));

	const form = createForm(() => ({
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: ''
		},
		onSubmit: async ({ value }) => {
			registerMutation.mutate(value);
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
		class="mt-4"
		aria-labelledby="form-heading"
	>
		<fieldset
			class="fieldset w-xs rounded-box border border-base-300 bg-base-200 p-4"
			disabled={registerMutation.isPending}
		>
			<legend id="form-heading" class="fieldset-legend">Create your account</legend>

			<form.Field
				name="email"
				validators={{
					onChange: z.email('Invalid email address')
				}}
			>
				{#snippet children(field)}
					<label for={field.name} class="label">Email</label>
					<input
						id={field.name}
						name={field.name}
						value={field.state.value}
						type="email"
						class="validator input"
						required
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
					<label for={field.name} class="label">Password</label>
					<input
						id={field.name}
						name={field.name}
						value={field.state.value}
						type="password"
						class="validator input"
						required
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
					<label for={field.name} class="label">Confirm password</label>
					<input
						id={field.name}
						name={field.name}
						value={field.state.value}
						type="password"
						class="validator input"
						required
						autocomplete="new-password"
						onchange={(e) => {
							const target = e.target as HTMLInputElement;
							field.handleChange(target.value);
						}}
					/>

					<FieldInfo {field} />
				{/snippet}
			</form.Field>

			<button type="submit" class="btn mt-4 btn-neutral" aria-busy={registerMutation.isPending}>
				{registerMutation.isPending ? 'Registering...' : 'Register'}
			</button>
		</fieldset>
	</form>

	{#if registerMutation.isError}
		<div role="alert" aria-live="polite" id="error-message">
			<p><strong>Error:</strong> {registerMutation.error?.message}</p>
		</div>
	{/if}

	{#if registerMutation.isSuccess}
		<div role="status" aria-live="polite" id="success-message">
			<p>Registration successful! Welcome, {registerMutation.data?.email}</p>
		</div>
	{/if}

	<p>
		Already have an account?
		<a href={resolve('/login')} class="link" data-sveltekit-preload-data>Log in</a>
	</p>
</AuthLayout>
