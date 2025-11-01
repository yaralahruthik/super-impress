import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type AuthStore = {
	accessToken: string | null;
	refreshToken: string | null;
};

export const authStore = writable<AuthStore>({
	accessToken: browser ? localStorage.getItem('accessToken') : null,
	refreshToken: browser ? localStorage.getItem('refreshToken') : null
});

if (browser) {
	authStore.subscribe((value) => {
		if (value.accessToken) {
			localStorage.setItem('accessToken', value.accessToken);
		} else {
			localStorage.removeItem('accessToken');
		}
		if (value.refreshToken) {
			localStorage.setItem('refreshToken', value.refreshToken);
		} else {
			localStorage.removeItem('refreshToken');
		}
	});
}

export function setTokens(accessToken: string, refreshToken: string | null = null) {
	authStore.set({ accessToken, refreshToken });
}

export function clearTokens() {
	authStore.set({ accessToken: null, refreshToken: null });
}
