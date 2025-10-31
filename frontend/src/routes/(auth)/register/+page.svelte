<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import FormField from '$lib/components/FormField.svelte';

	let name = '';
	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function registerUser() {
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			});

			if (response.ok) {
				await goto(resolve('/login'));
			} else {
				const data = await response.json();
				error = data.detail || 'Registration failed.';
			}
		} catch (err) {
			error = 'An error occurred during registration.';
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<main class="flex flex-col items-center p-5">
	<h1>Register</h1>

	{#if error}
		<p class="text-red-500">{error}</p>
	{/if}

	<form onsubmit={registerUser} class="flex w-xs flex-col gap-4">
		<FormField label="Name" id="name" type="text" bind:value={name} required disabled={loading} />

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
			{loading ? 'Registering...' : 'Register'}
		</Button>
	</form>
	<p class="my-4">
		Already have an account?
		<a class="text-blue-500" href={resolve('/login')}>Login</a>
	</p>
</main>
