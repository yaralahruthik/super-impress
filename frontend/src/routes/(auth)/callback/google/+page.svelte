<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const error = params.get('error');

		if (error) {
			goto(resolve('/login?error=' + error));
		} else {
			await invalidateAll();
			goto(resolve('/dashboard'));
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
