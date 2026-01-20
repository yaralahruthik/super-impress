import { useRegisterUser } from '@/api/authentication/authentication';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/layouts/auth-layout';
import { getErrorMessage } from '@/utils/get-error-message';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import * as z from 'zod';

const formSchema = z
	.object({
		email: z.email('Invalid email address'),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.max(15, 'Password must be at most 15 characters'),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export default function Register() {
	const [error, setError] = useState<string | null>(null);

	const navigate = useNavigate();
	const { mutate, isPending } = useRegisterUser();

	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: ''
		},
		validators: {
			onSubmit: formSchema
		},
		onSubmit: async ({ value }) => {
			setError(null);
			mutate(
				{
					data: {
						email: value.email,
						password: value.password
					}
				},
				{
					onSuccess: () => {
						navigate({ to: '/login' });
					},
					onError: (error) => {
						setError(getErrorMessage(error));
					}
				}
			);
		}
	});

	return (
		<AuthLayout>
			<Card>
				<CardHeader>
					<CardTitle>Create Account</CardTitle>
					<CardDescription>Enter your details to create a new account</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						id="register-form"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
						<fieldset disabled={isPending} className="space-y-4">
							<FieldGroup>
								<form.Field
									name="email"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="email">Email</FieldLabel>
												<Input
													id="email"
													name="email"
													type="email"
													autoComplete="email"
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
									name="password"
									children={(field) => {
										const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor="password">Password</FieldLabel>
												<Input
													id="password"
													name="password"
													type="password"
													autoComplete="new-password"
													required
													minLength={8}
													maxLength={15}
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
													onBlur={field.handleBlur}
													aria-invalid={isInvalid}
												/>
												<p className="text-xs text-muted-foreground">
													Must be 8-15 characters with uppercase, lowercase, digit, and special
													character
												</p>
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
												<FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
												<Input
													id="confirmPassword"
													name="confirmPassword"
													type="password"
													autoComplete="new-password"
													required
													minLength={8}
													maxLength={15}
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

							<Button type="submit" className="w-full" aria-busy={isPending}>
								{isPending ? 'Creating account...' : 'Create Account'}
							</Button>
						</fieldset>
					</form>
				</CardContent>

				<CardFooter className="justify-center">
					<div className="text-center text-sm">
						<span className="text-muted-foreground">Already have an account? </span>
						<Link to="/login" className="font-medium text-primary hover:underline">
							Sign in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</AuthLayout>
	);
}
