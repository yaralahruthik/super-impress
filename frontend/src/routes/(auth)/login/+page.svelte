<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function loginUser() {
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ email, password })
			});

			if (response.ok) {
				await invalidateAll();
				await goto(resolve('/dashboard'));
			} else {
				const data = await response.json();
				error = data.detail || 'Login failed.';
			}
		} catch (err) {
			error = 'An error occurred during login.';
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<main>
	<h1>Login</h1>
	{#if error}
		<p style="color: red;">{error}</p>
	{/if}
	<form on:submit|preventDefault={loginUser}>
		<label for="email">Email:</label>
		<input type="email" id="email" bind:value={email} required disabled={loading} />
		<label for="password">Password:</label>
		<input type="password" id="password" bind:value={password} required disabled={loading} />
		<button type="submit" disabled={loading}>
			{loading ? 'Logging in...' : 'Login'}
		</button>
	</form>
	<p>Don't have an account? <a href={resolve('/register')}>Register</a></p>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px;
	}
	form {
		display: flex;
		flex-direction: column;
		width: 300px;
	}
	label {
		margin-bottom: 5px;
	}
	input {
		padding: 8px;
		margin-bottom: 10px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	input:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}
	button {
		padding: 10px 15px;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	a {
		color: blue;
	}
</style>
