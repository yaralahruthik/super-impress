<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AuthLayout from '$lib/layouts/auth-layout.svelte';
	import { createForm } from '@tanstack/svelte-form';
	import { createMutation } from '@tanstack/svelte-query';
	import z from 'zod';
	import FieldInfo from '../field-info.svelte';
	import { loginApi } from './api';

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
		class="mt-4"
		aria-labelledby="form-heading"
	>
		<fieldset
			class="fieldset w-xs rounded-box border border-base-300 bg-base-200 p-4"
			disabled={loginMutation.isPending}
		>
			<legend id="form-heading" class="fieldset-legend">Log In to your account</legend>

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
		</fieldset>
	</form>

	{#if loginMutation.isError}
		<div role="alert" aria-live="polite" id="error-message">
			<p><strong>Error:</strong> {loginMutation.error?.message}</p>
		</div>
	{/if}

	{#if loginMutation.isSuccess}
		<div role="status" aria-live="polite" id="success-message">
			<p>Login successful! Welcome back.</p>
		</div>
	{/if}

	<p>
		Don't have an account?
		<a href={resolve('/register')} class="link" data-sveltekit-preload-data>Register</a>
	</p>
</AuthLayout>
