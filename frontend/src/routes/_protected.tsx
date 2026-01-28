import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected')({
	beforeLoad: ({ context }) => {
		// If still loading auth state, we can't determine auth status yet
		// The route will re-evaluate once loading completes
		if (context.auth.isLoading) {
			return;
		}

		if (!context.auth.isAuthenticated) {
			throw redirect({
				to: '/login'
			});
		}
	},
	component: () => <Outlet />
});
