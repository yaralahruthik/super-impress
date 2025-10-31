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

<main class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="text-center">
		<div
			class="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-500"
		></div>
		<p class="text-lg text-gray-600">Completing sign in...</p>
	</div>
</main>
