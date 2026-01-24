import AppLayout from '@/layouts/app-layout';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/_app')({
	component: AppLayoutComponent
});

function AppLayoutComponent() {
	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	);
}
