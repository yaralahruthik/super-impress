<script lang="ts">
	import { resolve } from '$app/paths';
	import AuthLayout from '$lib/layouts/auth-layout.svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let email = '';
	let password = '';
	let errorMessage = '';
	let successMessage = '';
	let isSubmitting = false;

	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();
		errorMessage = '';
		successMessage = '';

		// Client-side validation
		if (!email || !password) {
			errorMessage = 'All fields are required';
			return;
		}

		isSubmitting = true;

		try {
			// OAuth2PasswordRequestForm expects form-urlencoded data with username/password
			const formData = new SvelteURLSearchParams();
			formData.append('username', email);
			formData.append('password', password);

			const response = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: formData.toString()
			});

			if (!response.ok) {
				const data = await response.json();
				errorMessage = data.detail || 'Login failed';
				return;
			}

			const data = await response.json();
			successMessage = `Login successful! Welcome back.`;

			// Store the access token for authenticated requests
			localStorage.setItem('access_token', data.access_token);

			// Clear form
			email = '';
			password = '';
		} catch {
			errorMessage = 'An error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<AuthLayout>
	<h1 class="sr-only text-xl">Log in</h1>
	<form onsubmit={handleSubmit} class="mt-4" aria-labelledby="form-heading">
		<fieldset
			class="fieldset w-xs rounded-box border border-base-300 bg-base-200 p-4"
			disabled={isSubmitting}
		>
			<legend id="form-heading" class="fieldset-legend">Log In to your account</legend>

			<label for="email" class="label"> Email address </label>
			<input
				type="email"
				id="email"
				name="email"
				class="input"
				bind:value={email}
				required
				autocomplete="email"
				aria-required="true"
				aria-describedby={errorMessage ? 'error-message' : undefined}
			/>

			<label for="password" class="label"> Password </label>
			<input
				type="password"
				id="password"
				name="password"
				class="input"
				bind:value={password}
				required
				autocomplete="current-password"
				aria-required="true"
				aria-describedby={errorMessage ? 'error-message' : undefined}
			/>

			<button type="submit" class="btn mt-4 btn-neutral" aria-busy={isSubmitting}>
				{isSubmitting ? 'Logging in...' : 'Log in'}
			</button>
		</fieldset>
	</form>

	{#if errorMessage}
		<div role="alert" aria-live="polite" id="error-message">
			<p><strong>Error:</strong> {errorMessage}</p>
		</div>
	{/if}

	{#if successMessage}
		<div role="status" aria-live="polite" id="success-message">
			<p>{successMessage}</p>
		</div>
	{/if}

	<p>
		Don't have an account?
		<a href={resolve('/register')} class="link" data-sveltekit-preload-data>Register</a>
	</p>
</AuthLayout>
