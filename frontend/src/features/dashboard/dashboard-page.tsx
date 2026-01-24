import { useReadCurrentUser } from '@/api/authentication/authentication';
import UserInfoCard, { UserInfoCardError, UserInfoCardLoading } from './user-info-card';

function DashboardDataContainer() {
	const { data, isPending, isError } = useReadCurrentUser();

	if (isPending) {
		return <UserInfoCardLoading />;
	}

	if (isError) {
		return <UserInfoCardError />;
	}

	return <UserInfoCard user={data} />;
}

export default function DashboardPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Dashboard</h1>

			<DashboardDataContainer />
		</div>
	);
}
