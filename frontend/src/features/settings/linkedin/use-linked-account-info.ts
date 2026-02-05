import { useQuery } from '@tanstack/react-query';

import { authClient } from '@/utils/auth-client';

export function getLinkedAccountInfoQueryKey(accountId: string | undefined) {
	return ['linked-account-info', accountId ?? null] as const;
}

export function useLinkedAccountInfo(accountId: string | undefined) {
	return useQuery({
		queryKey: getLinkedAccountInfoQueryKey(accountId),
		queryFn: async () => {
			if (!accountId) {
				throw new Error('Missing accountId.');
			}

			const response = await authClient.accountInfo({
				query: {
					accountId: accountId
				}
			});

			if (response.error) {
				throw new Error(response.error.message ?? 'Unable to load account info.');
			}

			return response.data;
		},
		enabled: Boolean(accountId)
	});
}
