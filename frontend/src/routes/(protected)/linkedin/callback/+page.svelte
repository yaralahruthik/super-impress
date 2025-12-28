<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createCompleteLinkedinConnection } from '$lib/api/linkedin/linkedin';
	import { onMount } from 'svelte';

	let error = $state('');
	let processing = $state(true);

	const callbackMutation = createCompleteLinkedinConnection({
		mutation: {
			onSuccess: () => {
				sessionStorage.removeItem('linkedin_oauth_state');
				goto(resolve('/settings?linkedin=connected'));
			},
			onError: (err) => {
				error = err.message || 'Failed to connect LinkedIn account';
				processing = false;
			}
		}
	});

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const state = urlParams.get('state');
		const errorParam = urlParams.get('error');

		if (errorParam) {
			error = `LinkedIn OAuth error: ${errorParam}`;
			processing = false;
			return;
		}

		if (!code || !state) {
			error = 'Missing authorization code or state';
			processing = false;
			return;
		}

		const storedState = sessionStorage.getItem('linkedin_oauth_state');
		if (state !== storedState) {
			error = 'Invalid state parameter. Please try connecting again.';
			processing = false;
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
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
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
