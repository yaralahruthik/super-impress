<script lang="ts">
	let email = '';
	let password = '';
	let confirmPassword = '';
	let errorMessage = '';
	let successMessage = '';
	let isSubmitting = false;

	async function handleSubmit(event: Event) {
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

<main class="container space-y-4 p-10">
	<h1 class="text-xl">Register</h1>

	<form on:submit={handleSubmit} aria-labelledby="form-heading">
		<fieldset class="space-y-2" disabled={isSubmitting}>
			<legend id="form-heading">Create your account</legend>

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
						autocomplete="new-password"
						aria-required="true"
						aria-describedby={errorMessage ? 'error-message' : undefined}
					/>
				</label>
			</div>

			<div>
				<label for="confirm-password">
					Confirm password
					<input
						type="password"
						id="confirm-password"
						name="confirm-password"
						class="border"
						bind:value={confirmPassword}
						required
						autocomplete="new-password"
						aria-required="true"
						aria-describedby={errorMessage ? 'error-message' : undefined}
					/>
				</label>
			</div>

			<button type="submit" class="border px-2 py-1" aria-busy={isSubmitting}>
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
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/login" class="underline" data-sveltekit-preload-data>Log in</a>
	</p>
</main>
