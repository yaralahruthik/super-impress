import { getSession } from '@/api/better-auth/better-auth';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected')({
	beforeLoad: async ({ location }) => {
		try {
			const data = await getSession();
			if (!data?.session) {
				throw redirect({
					to: '/login',
					search: {
						redirect: location.href
					}
				});
			}
		} catch (error) {
			if (error instanceof Response) throw error;
			throw redirect({
				to: '/login',
				search: {
					redirect: location.href
				}
			});
		}
	},
	component: () => <Outlet />
});
