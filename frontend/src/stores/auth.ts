import { isTokenExpired } from '@/utils/jwt';
import { atom, getDefaultStore } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Primitive atom synced with localStorage
export const tokenAtom = atomWithStorage<string | null>('access_token', null);

// Derived atom for authentication status
export const isAuthenticatedAtom = atom((get) => {
	const token = get(tokenAtom);
	return token !== null && !isTokenExpired(token);
});

// Combined state atom
export const authStateAtom = atom((get) => ({
	isAuthenticated: get(isAuthenticatedAtom),
	token: get(tokenAtom)
}));

// Action atoms
export const loginAtom = atom(null, (get, set, token: string) => {
	set(tokenAtom, token);
});

export const logoutAtom = atom(null, (get, set) => {
	set(tokenAtom, null);
});

// Imperative utilities for use outside React
export const authUtils = {
	getToken: () => getDefaultStore().get(tokenAtom),
	isAuthenticated: () => getDefaultStore().get(isAuthenticatedAtom),
	login: (token: string) => getDefaultStore().set(loginAtom, token),
	logout: () => getDefaultStore().set(logoutAtom)
};
