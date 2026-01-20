import Login from '@/features/auth/login/login';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
	component: Login
});
