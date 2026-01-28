import { useAuth } from '@/hooks/use-auth';
import UserInfoCard, { UserInfoCardError, UserInfoCardLoading } from './user-info-card';

function DashboardDataContainer() {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return <UserInfoCardLoading />;
	}

	if (!user) {
		return <UserInfoCardError />;
	}

	return <UserInfoCard user={user} />;
}

export default function DashboardPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Dashboard</h1>

			<DashboardDataContainer />
		</div>
	);
}
