<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { data } = $props();

	let userEmail = $derived(data.user?.email);

	async function handleLogout() {
		try {
			await fetch('/api/logout', {
				method: 'POST',
				credentials: 'include'
			});

			await invalidateAll();
			await goto(resolve('/login'));
		} catch (err) {
			console.error('Logout failed:', err);
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
