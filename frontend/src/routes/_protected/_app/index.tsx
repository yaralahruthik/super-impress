import DashboardPage from '@/features/dashboard/dashboard-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/_app/')({
	component: DashboardPage
});
