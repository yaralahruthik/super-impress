<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authenticatedFetch } from '$lib/api';
	import Button from '$lib/components/Button.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import { setTokens } from '$lib/stores/authStore';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let error = '';
	let loading = false;

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
			const response = await authenticatedFetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			if (response.ok) {
				const data = await response.json();
				setTokens(data.access_token, data.refresh_token);
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

	async function signInWithGoogle() {
		await goto('/api/google');
	}
</script>

<main class="flex flex-col items-center p-5">
	<h1>Login</h1>

	{#if error}
		<p class="text-red-500">{error}</p>
	{/if}

	<form onsubmit={loginUser} class="flex w-xs flex-col gap-4">
		<FormField
			label="Email"
			id="email"
			type="email"
			bind:value={email}
			required
			disabled={loading}
		/>

		<FormField
			label="Password"
			id="password"
			type="password"
			bind:value={password}
			required
			disabled={loading}
		/>

		<Button type="submit" disabled={loading}>
			{loading ? 'Logging in...' : 'Login'}
		</Button>
	</form>

	<Button variant="outline" classes="mt-4" onclick={signInWithGoogle} disabled={loading}
		>Continue with Google</Button
	>

	<p class="my-4">
		Don't have an account?
		<a class="text-blue-500" href={resolve('/register')}>Register</a>
	</p>
</main>
