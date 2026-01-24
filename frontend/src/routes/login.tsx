import LoginPage from '@/features/auth/login/login-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
	component: LoginPage
});
