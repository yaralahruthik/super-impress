<script lang="ts">
	import { resolve } from '$app/paths';
	import { createResendVerification } from '$lib/api/email-verification/email-verification';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import AuthLayout from '$lib/layouts/auth-layout.svelte';
	import { cn } from '$lib/utils/cn';
	import { getErrorMessage } from '$lib/utils/get-error-message';
	import { createForm } from '@tanstack/svelte-form';
	import z from 'zod';
	import FieldInfo from '../field-info.svelte';

	const resendFormSchema = z.object({
		email: z.email('Invalid email address').trim()
	});

	const resendMutation = createResendVerification();

	const form = createForm(() => ({
		defaultValues: {
			email: ''
		},
		validators: {
			onSubmit: resendFormSchema
		},
		onSubmit: async ({ value }) => {
			resendMutation.mutate({
				data: {
					email: value.email
				}
			});
		}
	}));
</script>

<AuthLayout>
	<h1 class="sr-only text-xl">Resend verification email</h1>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			e.stopPropagation();
			form.handleSubmit();
		}}
		class="my-4"
		aria-labelledby="form-heading"
	>
		<fieldset
			class="fieldset w-xs rounded-box border border-base-300 bg-base-200 p-4"
			disabled={resendMutation.isPending}
		>
			<legend id="form-heading" class="fieldset-legend">Request a new verification email</legend>

			{#if resendMutation.isSuccess}
				<div>
					<p class="text-green-600">
						{resendMutation.data.message}
					</p>
					<div class="mt-6 text-center">
						<a href={resolve('/login')} class="text-blue-600 hover:underline">Go to Login</a>
					</div>
				</div>
			{:else}
				<form.Field name="email">
					{#snippet children(field)}
						<Label for={field.name}>Email</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							type="email"
							class={cn(field.state.meta.isTouched && !field.state.meta.isValid && 'input-error')}
							aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
							autocomplete="email"
							onchange={(e) => {
								const target = e.target as HTMLInputElement;
								field.handleChange(target.value);
							}}
						/>

						<FieldInfo {field} />
					{/snippet}
				</form.Field>

				<Button type="submit" class="mt-4" aria-busy={resendMutation.isPending}>
					{resendMutation.isPending ? 'Sending...' : 'Resend verification email'}
				</Button>
			{/if}

			{#if resendMutation.isError}
				<em role="alert" class="text-sm text-error" aria-live="polite" id="error-message">
					{getErrorMessage(resendMutation.error)}
				</em>
			{/if}
		</fieldset>
	</form>
	<p>
		Remember your password?
		<a href={resolve('/login')} class="link" data-sveltekit-preload-data>Log in</a>
	</p>
</AuthLayout>
