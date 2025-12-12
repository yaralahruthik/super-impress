<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createReadCurrentUser } from '$lib/api/authentication/authentication';
	import Button from '$lib/components/ui/button.svelte';
	import { auth } from '$lib/stores/auth';
	import UserInfoCard from './user-info-card.svelte';

	const userQuery = createReadCurrentUser();
</script>

<div class="container mx-auto flex min-h-svh flex-col items-center justify-center p-4">
	{#if userQuery.isPending}
		<div
			class="loading loading-lg loading-spinner"
			role="status"
			aria-label="Loading user information"
		></div>
	{:else if userQuery.isError}
		<div role="alert" class="alert max-w-md alert-error">
			<span>Failed to load user information. Please try again.</span>
		</div>
	{:else if userQuery.data}
		<h1 class="mb-8 text-3xl font-black">Welcome back, {userQuery.data.email}!</h1>

		<UserInfoCard user={userQuery.data} />

		<div class="mt-8 flex w-full max-w-md flex-col gap-4">
			<a href={resolve('/change-password')} class="btn btn-outline"> Change Password </a>
			<Button
				type="button"
				onclick={() => {
					auth.logout();
					goto(resolve('/login'));
				}}
			>
				Logout
			</Button>
		</div>
	{/if}
</div>
