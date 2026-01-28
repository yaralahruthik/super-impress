import { getSession } from '@/api/better-auth/better-auth';
import LoginPage from '@/features/auth/login/login-page';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
	beforeLoad: async () => {
		try {
			const data = await getSession();
			if (data?.session) {
				throw redirect({
					to: '/'
				});
			}
		} catch (error) {
			if (error instanceof Response) throw error;
		}
	},
	component: LoginPage
});
