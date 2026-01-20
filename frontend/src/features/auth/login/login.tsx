import { useLoginUser } from '@/api/authentication/authentication';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { AuthLayout } from '@/layouts/auth-layout';
import { getErrorMessage } from '@/utils/get-error-message';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import * as z from 'zod';

const formSchema = z.object({
	email: z.email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export default function Login() {
	const [error, setError] = useState<string | null>(null);

	const navigate = useNavigate();
	const { login } = useAuth();
	const { mutate, isPending } = useLoginUser();

	const form = useForm({
		defaultValues: {
			email: '',
			password: ''
		},
		validators: {
			onSubmit: formSchema
		},
		onSubmit: async ({ value }) => {
			setError(null);
			mutate(
				{
					data: {
						username: value.email,
						password: value.password
					}
				},
				{
					onSuccess: (response) => {
						login(response.access_token);
						navigate({ to: '/' });
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
			<div className="space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-2xl font-bold">Sign In</h1>
					<p className="text-sm text-muted-foreground">
						Enter your email and password to access your account
					</p>
				</div>

				<form
					id="login-form"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-4"
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
							{isPending ? 'Signing in...' : 'Sign In'}
						</Button>
					</fieldset>
				</form>

				<div className="text-center text-sm">
					<span className="text-muted-foreground">Don't have an account? </span>
					<Link to="/register" className="font-medium text-primary hover:underline">
						Sign up
					</Link>
				</div>
			</div>
		</AuthLayout>
	);
}
