<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { createVerifyEmail } from '$lib/api/email-verification/email-verification';
	import AuthLayout from '$lib/layouts/auth-layout.svelte';
	import { getErrorMessage } from '$lib/utils/get-error-message';
	import { onMount } from 'svelte';

	const verifyEmailMutation = createVerifyEmail();

	onMount(() => {
		const token = page.params.token;
		if (token) {
			verifyEmailMutation.mutate({ data: { token } });
		}
	});
</script>

<AuthLayout>
	<div class="my-4">
		<div class="card w-xs border border-base-300 bg-base-200">
			<div class="card-body items-center text-center">
				{#if verifyEmailMutation.isPending}
					<h2 class="card-title">Verifying...</h2>
					<span class="loading mt-4 loading-md loading-dots"></span>
				{/if}

				{#if verifyEmailMutation.isSuccess}
					<h2 class="card-title text-green-500">Email Verified</h2>
					<p>You can now log in to your account.</p>
					<div class="mt-6 card-actions">
						<a href={resolve('/login')} class="btn btn-primary">Go to Login</a>
					</div>
				{/if}

				{#if verifyEmailMutation.isError}
					{@const errorMessage = getErrorMessage(verifyEmailMutation.error)}
					{#if errorMessage === 'Invalid or expired verification token'}
						<h2 class="card-title text-orange-500">Link Invalid</h2>
						<p>This verification link is invalid or has been used.</p>
						<div class="mt-6 card-actions">
							<a href={resolve('/verify-email/resend')} class="btn btn-primary">Resend Email</a>
						</div>
						<p class="mt-4 text-sm">
							Already verified? <a href={resolve('/login')} class="link">Log in</a>.
						</p>
					{:else}
						<h2 class="card-title text-red-500">Verification Failed</h2>
						<p>{errorMessage}</p>
						<div class="mt-6 card-actions">
							<a href={resolve('/verify-email/resend')} class="btn btn-primary">Try again</a>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</AuthLayout>
