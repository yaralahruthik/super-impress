import { useChangePassword } from '@/api/better-auth/better-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/utils/get-error-message';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import * as z from 'zod';

const formSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.max(15, 'Password must be at most 15 characters'),
		confirmPassword: z.string().min(1, 'Please confirm your new password')
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export default function ChangePasswordPage() {
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const navigate = useNavigate();
	const { mutate, isPending } = useChangePassword();

	const form = useForm({
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: ''
		},
		validators: {
			onSubmit: formSchema
		},
		onSubmit: async ({ value }) => {
			setError(null);
			setSuccess(false);
			mutate(
				{
					data: {
						currentPassword: value.currentPassword,
						newPassword: value.newPassword
					}
				},
				{
					onSuccess: () => {
						setSuccess(true);
						setTimeout(() => {
							navigate({ to: '/' });
						}, 1500);
					},
					onError: (error) => {
						setError(getErrorMessage(error));
					}
				}
			);
		}
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Change Password</h1>
				<p className="text-muted-foreground">Update your account password</p>
			</div>

			<Card className="max-w-md">
				<CardHeader>
					<CardTitle>New Password</CardTitle>
					<CardDescription>Enter your current password and choose a new one</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						id="change-password-form"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<fieldset disabled={isPending || success} className="space-y-4">
							<FieldGroup>
								<form.Field
									name="currentPassword"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="currentPassword">Current Password</FieldLabel>
												<Input
													id="currentPassword"
													name="currentPassword"
													type="password"
													autoComplete="current-password"
													required
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										);
									}}
								/>

								<form.Field
									name="newPassword"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="newPassword">New Password</FieldLabel>
												<Input
													id="newPassword"
													name="newPassword"
													type="password"
													autoComplete="new-password"
													required
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										);
									}}
								/>

								<form.Field
									name="confirmPassword"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
												<Input
													id="confirmPassword"
													name="confirmPassword"
													type="password"
													autoComplete="new-password"
													required
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
												/>
												{isInvalid && <FieldError errors={field.state.meta.errors} />}
											</Field>
										);
									}}
								/>
							</FieldGroup>

							{error && (
								<div
									role="alert"
									className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
								>
									{error}
								</div>
							)}

							{success && (
								<div
									role="status"
									className="rounded-md bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400"
								>
									Password changed successfully! Redirecting...
								</div>
							)}

							<Button type="submit" className="w-full" aria-busy={isPending}>
								{isPending ? 'Changing Password...' : 'Change Password'}
							</Button>
						</fieldset>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
