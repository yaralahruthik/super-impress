import Register from '@/features/auth/register/register';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/register')({
	component: Register
});
