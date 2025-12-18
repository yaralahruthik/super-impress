<script lang="ts">
	import { createReadCurrentUser } from '$lib/api/authentication/authentication';
	import AppLayout from '$lib/layouts/app-layout.svelte';
	import UserInfoCard from './user-info-card.svelte';

	const userQuery = createReadCurrentUser();
</script>

<AppLayout>
	{#if userQuery.isPending}
		<div class="flex h-[50vh] items-center justify-center">
			<div
				class="loading loading-lg loading-spinner text-primary"
				role="status"
				aria-label="Loading user information"
			></div>
		</div>
	{:else if userQuery.isError}
		<div role="alert" class="alert alert-error">
			<span>Failed to load user information. Please try again.</span>
		</div>
	{:else if userQuery.data}
		{#if !userQuery.data.email_verified}
			<div class="mb-6 alert flex justify-center alert-warning">
				<span>Your email is not verified. Please verify your email to access all features.</span>
			</div>
		{/if}

		<div class="space-y-1">
			<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
			<p class="text-base-content/70">
				Welcome back, <span class="font-medium text-base-content">{userQuery.data.email}</span>
			</p>
		</div>

		<hr class="border-base-200" />

		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-6">
				<h2 class="text-lg font-semibold">Profile Information</h2>
				<UserInfoCard user={userQuery.data} />
			</div>
		</div>
	{/if}
</AppLayout>
