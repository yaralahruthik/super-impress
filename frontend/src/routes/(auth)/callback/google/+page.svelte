<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { setTokens } from '$lib/stores/authStore';
	import { onMount } from 'svelte';

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const error = params.get('error');
		const code = params.get('code');

		if (error) {
			goto(resolve(`/login?error=${encodeURIComponent(error)}`));
		} else if (code) {
			try {
				const response = await fetch('/api/google/exchange-code', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ code })
				});

				if (response.ok) {
					const data = await response.json();
					setTokens(data.access_token, data.refresh_token);
					await invalidateAll();
					goto(resolve('/dashboard'));
				} else {
					const data = await response.json();
					const errorMessage = data.detail || 'Failed to exchange Google code for tokens.';
					console.error('Token exchange failed:', response.status, errorMessage);
					goto(resolve(`/login?error=${encodeURIComponent(errorMessage)}`), {
						replaceState: true
					});
				}
			} catch (err) {
				console.error('Network error during token exchange:', err);
				goto(resolve('/login?error=network_error_google_login'), { replaceState: true });
			}
		} else {
			console.error('Google callback received no code or error.');
			goto(resolve('/login?error=google_login_failed'));
		}
	});
</script>

<main>
	<div class="loading">
		<div class="spinner"></div>
		<p>Completing sign in...</p>
	</div>
</main>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
	}
	.loading {
		text-align: center;
		color: #666;
	}
	.spinner {
		width: 40px;
		height: 40px;
		margin: 0 auto 20px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #4caf50;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
