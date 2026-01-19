<script lang="ts">
	import { createRequestVerification } from '$lib/api/email-verification/email-verification';
	import type { UserPublic } from '$lib/api/superimpress.schemas';
	import Button from '$lib/components/ui/button.svelte';
	import { getErrorMessage } from '$lib/utils/get-error-message';

	type Props = {
		user: UserPublic;
	};

	let { user }: Props = $props();

	const verificationRequest = createRequestVerification();
</script>

<div class="card w-full max-w-md bg-base-200 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">User Information</h2>

		<div class="divider"></div>

		<div class="space-y-4">
			<div class="flex flex-col">
				<span class="text-sm font-semibold text-base-content/70">Email</span>
				<div class="flex items-center justify-between">
					<span class="text-lg" data-testid="user-email">{user.email}</span>
					{#if user.email_verified}
						<div class="badge badge-sm badge-success">Verified</div>
					{:else}
						<div class="badge badge-sm badge-warning">Not Verified</div>
					{/if}
				</div>
			</div>

			<div class="flex flex-col">
				<span class="text-sm font-semibold text-base-content/70">User ID</span>
				<span class="font-mono text-lg" data-testid="user-id">{user.id}</span>
			</div>

			{#if !user.email_verified}
				<div class="mt-4">
					<Button
						class="w-full"
						disabled={verificationRequest.isPending}
						variant="outline"
						onclick={() => verificationRequest.mutate()}
					>
						{#if verificationRequest.isPending}
							<span class="loading loading-sm loading-spinner"></span>
							Sending...
						{:else}
							Verify Email
						{/if}
					</Button>

					{#if verificationRequest.isSuccess}
						<div class="mt-2 text-sm text-green-600">
							Verification email sent to {verificationRequest.data.email}
						</div>
					{/if}

					{#if verificationRequest.isError}
						<div class="mt-2 text-sm text-error" role="alert">
							{getErrorMessage(verificationRequest.error)}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
