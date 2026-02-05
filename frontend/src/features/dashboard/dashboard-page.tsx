import { useGetSession } from "@/api/better-auth/better-auth";
import UserInfoCard, {
  UserInfoCardError,
  UserInfoCardLoading,
} from "./user-info-card";

function DashboardDataContainer() {
  const { data, isPending } = useGetSession();

  if (isPending) {
    return <UserInfoCardLoading />;
  }

  if (!data?.user) {
    return <UserInfoCardError />;
  }

  return <UserInfoCard user={data.user} />;
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-bold text-2xl">Dashboard</h1>

      <DashboardDataContainer />
    </div>
  );
}
