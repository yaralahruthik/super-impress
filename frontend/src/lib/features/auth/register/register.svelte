<script lang="ts">
	import { resolve } from '$app/paths';
	import AuthLayout from '$lib/layouts/auth-layout.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { registerApi } from './api';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	const registerMutation = createMutation(() => ({
		mutationFn: registerApi,
		onSuccess: (data) => {
			console.log('Registration success:', data);
		}
	}));

	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();

		registerMutation.mutate({ email, password });
	}
</script>

<AuthLayout>
	<h1 class="sr-only text-xl">Register</h1>

	<form onsubmit={handleSubmit} class="mt-4" aria-labelledby="form-heading">
		<fieldset
			class="fieldset w-xs rounded-box border border-base-300 bg-base-200 p-4"
			disabled={registerMutation.isPending}
		>
			<legend id="form-heading" class="fieldset-legend">Create your account</legend>

			<label for="email" class="label">Email address</label>
			<input
				type="email"
				id="email"
				name="email"
				class="input"
				bind:value={email}
				required
				autocomplete="email"
				aria-required="true"
			/>

			<label for="password" class="label">Password</label>
			<input
				type="password"
				id="password"
				name="password"
				class="input"
				bind:value={password}
				required
				autocomplete="new-password"
				aria-required="true"
			/>

			<label for="confirm-password" class="label">Confirm password</label>
			<input
				type="password"
				id="confirm-password"
				name="confirm-password"
				class="input"
				bind:value={confirmPassword}
				required
				autocomplete="new-password"
				aria-required="true"
			/>

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
