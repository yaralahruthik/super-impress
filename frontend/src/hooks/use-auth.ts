import { useAtomValue, useSetAtom } from 'jotai';
import { authStateAtom, loginAtom, logoutAtom } from '@/stores/auth';

export function useAuth() {
	const authState = useAtomValue(authStateAtom);
	const login = useSetAtom(loginAtom);
	const logout = useSetAtom(logoutAtom);

	return {
		...authState,
		login,
		logout
	};
}
