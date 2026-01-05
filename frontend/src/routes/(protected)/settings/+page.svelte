<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createDeleteCurrentUser } from '$lib/api/authentication/authentication';
	import { createGetLinkedinStatus } from '$lib/api/linkedin/linkedin';
	import LinkedInConnectionCard from '$lib/features/linkedin/linkedin-connection-card.svelte';
	import AppLayout from '$lib/layouts/app-layout.svelte';
	import { auth } from '$lib/stores/auth';
	import { getErrorMessage } from '$lib/utils/get-error-message';

	const statusQuery = createGetLinkedinStatus();

	const deleteMutation = createDeleteCurrentUser({
		mutation: {
			onSuccess: () => {
				auth.logout();
				goto(resolve('/login'));
			}
		}
	});

	function handleDeleteAccount() {
		if (
			confirm(
				'Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data including posts and connections will be deleted.'
			)
		) {
			deleteMutation.mutate();
		}
	}
</script>

<AppLayout>
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold tracking-tight">Settings</h1>
		<p class="text-base-content/60">Manage your account integrations and preferences.</p>
	</div>

	<div class="max-w-4xl space-y-8">
		<section>
			<div class="mb-4 flex items-center gap-2">
				<h2 class="text-xl font-bold tracking-tight">Integrations</h2>
				<div class="ml-2 h-px flex-1 bg-base-content/10"></div>
			</div>

			<LinkedInConnectionCard
				status={statusQuery.data || { connected: false }}
				loading={statusQuery.isLoading}
			/>
		</section>

		<section>
			<div class="mb-4 flex items-center gap-2">
				<h2 class="text-xl font-bold tracking-tight">Danger Zone</h2>
				<div class="ml-2 h-px flex-1 bg-base-content/10"></div>
			</div>

			<div class="card border border-error/20 bg-base-100">
				<div class="card-body">
					<h3 class="card-title text-error">Delete Account</h3>
					<p class="text-base-content/60">
						Once you delete your account, there is no going back. This action is permanent and will
						delete all your data including posts and social connections.
					</p>

					<div class="mt-4 card-actions">
						<button
							onclick={handleDeleteAccount}
							disabled={deleteMutation.isPending}
							class="btn border-error/20 text-error btn-ghost hover:bg-error/10"
						>
							{#if deleteMutation.isPending}
								<span class="loading loading-sm loading-spinner"></span>
								Deleting Account...
							{:else}
								Delete My Account
							{/if}
						</button>
					</div>

					{#if deleteMutation.isError}
						<p role="alert" class="mt-2 text-sm text-error">
							{getErrorMessage(deleteMutation.error)}
						</p>
					{/if}
				</div>
			</div>
		</section>
	</div>
</AppLayout>
