<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createCompleteLinkedinConnection } from '$lib/api/linkedin/linkedin';
	import { onMount } from 'svelte';
	import { X } from '@lucide/svelte';

	let error = $state('');
	let processing = $state(true);

	function cleanupOAuthState() {
		sessionStorage.removeItem('linkedin_oauth_state');
	}

	function handleError(message: string) {
		cleanupOAuthState();
		error = message;
		processing = false;
	}

	const callbackMutation = createCompleteLinkedinConnection({
		mutation: {
			onSuccess: () => {
				cleanupOAuthState();
				goto(resolve('/settings'));
			},
			onError: (err) => {
				handleError(err.message || 'Failed to connect LinkedIn account');
			}
		}
	});

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const state = urlParams.get('state');
		const errorParam = urlParams.get('error');

		if (errorParam) {
			handleError(`LinkedIn OAuth error: ${errorParam}`);
			return;
		}

		if (!code || !state) {
			handleError('Missing authorization code or state');
			return;
		}

		const storedState = sessionStorage.getItem('linkedin_oauth_state');
		if (state !== storedState) {
			handleError('Invalid state parameter. Please try connecting again.');
			return;
		}

		callbackMutation.mutate({
			data: { code, state }
		});
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="card max-w-md bg-base-200 shadow-xl">
		<div class="card-body">
			{#if processing}
				<div class="flex flex-col items-center gap-4">
					<span class="loading loading-lg loading-spinner"></span>
					<h2 class="text-xl font-bold">Connecting LinkedIn...</h2>
					<p class="text-sm text-base-content/70">Please wait while we complete the connection.</p>
				</div>
			{:else if error}
				<div class="alert alert-error">
					<X class="h-6 w-6" />
					<div>
						<h3 class="font-bold">Connection Failed</h3>
						<div class="text-sm">{error}</div>
					</div>
				</div>
				<button onclick={() => goto(resolve('/settings'))} class="btn mt-4">
					Back to Settings
				</button>
			{/if}
		</div>
	</div>
</div>
