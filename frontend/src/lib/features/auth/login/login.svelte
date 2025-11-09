<script lang="ts">
	import { resolve } from '$app/paths';
	import AuthLayout from '$lib/layouts/auth-layout.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { loginApi } from './api';

	let email = $state('');
	let password = $state('');

	const loginMutation = createMutation(() => ({
		mutationFn: loginApi,
		onSuccess: (data) => {
			console.log('Login success', data);
		}
	}));

	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();
		loginMutation.mutate({ email, password });
	}
</script>

<AuthLayout>
	<h1 class="sr-only text-xl">Log in</h1>

	<form onsubmit={handleSubmit} class="mt-4" aria-labelledby="form-heading">
		<fieldset
			class="fieldset w-xs rounded-box border border-base-300 bg-base-200 p-4"
			disabled={loginMutation.isPending}
		>
			<legend id="form-heading" class="fieldset-legend">Log In to your account</legend>

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
				autocomplete="current-password"
				aria-required="true"
			/>

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
