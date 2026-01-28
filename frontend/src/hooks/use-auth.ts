import { getGetSessionQueryKey, useGetSession, useSignOut } from '@/api/better-auth/better-auth';
import { useQueryClient } from '@tanstack/react-query';

export function useAuth() {
	const queryClient = useQueryClient();
	const { data: session, isPending, isError } = useGetSession();
	const { mutate: signOutMutate } = useSignOut();

	const isAuthenticated = !isPending && !isError && session !== null;

	const logout = () => {
		signOutMutate(
			{ data: {} },
			{
				onSuccess: () => {
					queryClient.setQueryData(getGetSessionQueryKey(), null);
				}
			}
		);
	};

	const invalidateSession = () => {
		return queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey() });
	};

	return {
		isAuthenticated,
		isLoading: isPending,
		user: session?.user ?? null,
		session: session?.session ?? null,
		logout,
		invalidateSession
	};
}
