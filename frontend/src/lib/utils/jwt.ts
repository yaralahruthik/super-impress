import { decodeJwt } from 'jose';

export function isTokenExpired(token: string | null): boolean {
	if (!token) return true;

	try {
		const { exp } = decodeJwt(token);

		if (!exp) return false;

		return Date.now() >= exp * 1000;
	} catch {
		return true;
	}
}
