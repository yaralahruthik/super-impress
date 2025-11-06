<script lang="ts">
	import { resolve } from '$app/paths';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	let email = '';
	let password = '';
	let errorMessage = '';
	let successMessage = '';
	let isSubmitting = false;

	async function handleSubmit(event: Event) {
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

<main class="container space-y-4 p-10">
	<h1 class="text-xl">Log in</h1>

	<form on:submit={handleSubmit} aria-labelledby="form-heading">
		<fieldset class="space-y-2" disabled={isSubmitting}>
			<legend id="form-heading">Log in to your account</legend>

			<div>
				<label for="email">
					Email address
					<input
						type="email"
						id="email"
						name="email"
						class="border"
						bind:value={email}
						required
						autocomplete="email"
						aria-required="true"
						aria-describedby={errorMessage ? 'error-message' : undefined}
					/>
				</label>
			</div>

			<div>
				<label for="password">
					Password
					<input
						type="password"
						id="password"
						name="password"
						class="border"
						bind:value={password}
						required
						autocomplete="current-password"
						aria-required="true"
						aria-describedby={errorMessage ? 'error-message' : undefined}
					/>
				</label>
			</div>

			<button type="submit" class="border px-2 py-1" aria-busy={isSubmitting}>
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
		<a href={resolve('/register')} class="underline" data-sveltekit-preload-data>Register</a>
	</p>
</main>
