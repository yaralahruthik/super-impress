import { useLoginUser } from '@/api/authentication/authentication';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { AuthLayout } from '@/layouts/auth-layout';
import { getErrorMessage } from '@/utils/get-error-message';
import { Link, useNavigate } from '@tanstack/react-router';
import type { AxiosError } from 'axios';
import { useState } from 'react';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);

	const navigate = useNavigate();
	const { login } = useAuth();
	const { mutate, isPending } = useLoginUser();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		mutate(
			{
				data: {
					username: email,
					password
				}
			},
			{
				onSuccess: (response) => {
					login(response.access_token);
					navigate({ to: '/' });
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
					<h1 className="text-2xl font-bold">Sign In</h1>
					<p className="text-sm text-muted-foreground">
						Enter your email and password to access your account
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
								autoComplete="current-password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
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
