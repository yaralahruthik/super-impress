<script lang="ts">
	import { resolve } from '$app/paths';

	let email = '';
	let password = '';
	let confirmPassword = '';
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
		if (!email || !password || !confirmPassword) {
			errorMessage = 'All fields are required';
			return;
		}

		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			errorMessage = 'Password must be at least 8 characters long';
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			if (!response.ok) {
				const data = await response.json();
				errorMessage = data.detail || 'Registration failed';
				return;
			}

			const data = await response.json();
			successMessage = `Registration successful! Welcome, ${data.email}`;

			// Clear form
			email = '';
			password = '';
			confirmPassword = '';
		} catch {
			errorMessage = 'An error occurred. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="container mx-auto flex h-svh flex-col items-center justify-center">
	<h1 class="sr-only text-xl">Register</h1>

	<a class="text-3xl font-black" href={resolve('/')}>SuperImpress</a>
	<form onsubmit={handleSubmit} class="mt-4" aria-labelledby="form-heading">
		<fieldset
			class="fieldset w-xs rounded-box border border-base-300 bg-base-200 p-4"
			disabled={isSubmitting}
		>
			<legend id="form-heading" class="fieldset-legend">Create your account</legend>

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
				autocomplete="new-password"
				aria-required="true"
				aria-describedby={errorMessage ? 'error-message' : undefined}
			/>

			<label for="confirm-password" class="label"> Confirm password </label>
			<input
				type="password"
				id="confirm-password"
				name="confirm-password"
				class="input"
				bind:value={confirmPassword}
				required
				autocomplete="new-password"
				aria-required="true"
				aria-describedby={errorMessage ? 'error-message' : undefined}
			/>

			<button type="submit" class="btn mt-4 btn-neutral" aria-busy={isSubmitting}>
				{isSubmitting ? 'Registering...' : 'Register'}
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
		Already have an account?
		<a href={resolve('/login')} class="link" data-sveltekit-preload-data>Log in</a>
	</p>
</div>
