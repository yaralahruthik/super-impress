import { useRegisterUser } from '@/api/authentication/authentication';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/layouts/auth-layout';
import { getErrorMessage } from '@/utils/get-error-message';
import { Link, useNavigate } from '@tanstack/react-router';
import type { AxiosError } from 'axios';
import { useState } from 'react';

export default function Register() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);

	const navigate = useNavigate();
	const { mutate, isPending } = useRegisterUser();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		// Client-side validation
		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		mutate(
			{
				data: {
					email,
					password
				}
			},
			{
				onSuccess: () => {
					navigate({ to: '/login' });
				},
				onError: (error) => {
					setError(getErrorMessage(error as AxiosError));
				}
			}
		);
	};

	return (
		<AuthLayout>
			<div className="space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-2xl font-bold">Create Account</h1>
					<p className="text-sm text-muted-foreground">
						Enter your details to create a new account
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<fieldset disabled={isPending} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								aria-invalid={!!error}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								minLength={8}
								maxLength={15}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								aria-invalid={!!error}
							/>
							<p className="text-xs text-muted-foreground">
								Must be 8-15 characters with uppercase, lowercase, digit, and special character
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
								minLength={8}
								maxLength={15}
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								aria-invalid={!!error}
							/>
						</div>

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

				<div className="text-center text-sm">
					<span className="text-muted-foreground">Already have an account? </span>
					<Link to="/login" className="font-medium text-primary hover:underline">
						Sign in
					</Link>
				</div>
			</div>
		</AuthLayout>
	);
}
