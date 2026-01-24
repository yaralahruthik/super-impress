import { useReadCurrentUser } from '@/api/authentication/authentication';
import UserInfoCard, { UserInfoCardError, UserInfoCardLoading } from './user-info-card';

export default function DashboardPage() {
	const { data, isPending, isError } = useReadCurrentUser();

	if (isPending) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<UserInfoCardLoading />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<UserInfoCardError />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Dashboard</h1>

			<UserInfoCard user={data} />
		</div>
	);
}
