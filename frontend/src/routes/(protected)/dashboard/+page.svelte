<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authenticatedFetch } from '$lib/api';
	import { authStore, clearTokens } from '$lib/stores/auth-store';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	let userEmail: string | null = null;

	onMount(async () => {
		const currentAuth = get(authStore);
		if (currentAuth.accessToken) {
			try {
				const response = await authenticatedFetch('/api/me');
				if (response.ok) {
					const userData = await response.json();
					userEmail = userData.email;
				} else if (response.status === 401) {
					console.warn('Access token invalid when fetching user data. Clearing tokens.');
					clearTokens();
				} else {
					console.error('Failed to fetch user data:', response.status, response.statusText);
				}
			} catch (error) {
				console.error('Network error fetching user data:', error);
			}
		}
	});

	async function handleLogout() {
		try {
			const response = await authenticatedFetch('/api/logout', {
				method: 'POST'
			});

			if (!response.ok) {
				console.error('Server-side logout failed:', response.status, response.statusText);
			}
		} catch (err) {
			console.error('Network error during logout:', err);
		} finally {
			clearTokens();
			await invalidateAll();
			await goto(resolve('/login'));
		}
	}
</script>

<main>
	<div class="container">
		<h1>Dashboard</h1>
		<p>Welcome! You are logged in.</p>

		{#if userEmail}
			<p><strong>Email:</strong> {userEmail}</p>
		{/if}

		<button onclick={handleLogout}> Logout </button>
	</div>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		padding: 40px 20px;
	}

	.container {
		max-width: 800px;
		width: 100%;
	}

	h1 {
		margin-bottom: 20px;
	}

	button {
		padding: 10px 20px;
		background-color: #f44336;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		margin-top: 20px;
	}
</style>
