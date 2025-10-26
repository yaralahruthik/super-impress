<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		const oauthError = params.get('error');
		if (oauthError) {
			if (oauthError === 'oauth_failed') {
				error = 'Google sign-in failed. Please try again.';
			} else if (oauthError === 'no_user_info') {
				error = 'Could not get your information from Google.';
			}
		}
	});

	async function loginUser(event: SubmitEvent) {
		event.preventDefault();
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

	function signInWithGoogle() {
		window.location.href = `${API_BASE}/google`;
	}
</script>

<main>
	<h1>Login</h1>
	{#if error}
		<p style="color: red;">{error}</p>
	{/if}
	<form onsubmit={loginUser}>
		<label for="email">Email:</label>
		<input type="email" id="email" bind:value={email} required disabled={loading} />
		<label for="password">Password:</label>
		<input type="password" id="password" bind:value={password} required disabled={loading} />
		<button type="submit" disabled={loading}>
			{loading ? 'Logging in...' : 'Login'}
		</button>
	</form>

	<div class="divider">
		<span>or</span>
	</div>

	<button class="google-btn" onclick={signInWithGoogle} disabled={loading}>
		Continue with Google
	</button>

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

	.divider {
		width: 300px;
		text-align: center;
		margin: 20px 0;
		position: relative;
	}
	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background-color: #ccc;
	}
	.divider span {
		background-color: white;
		padding: 0 10px;
		position: relative;
		color: #666;
		font-size: 14px;
	}

	.google-btn {
		width: 300px;
		background-color: white;
		color: #3c4043;
		border: 1px solid #dadce0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		font-weight: 500;
		transition: background-color 0.2s;
	}
	.google-btn:hover:not(:disabled) {
		background-color: #f8f9fa;
	}
	.google-btn:disabled {
		background-color: white;
		opacity: 0.6;
	}

	a {
		color: blue;
	}
</style>
