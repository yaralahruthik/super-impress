import { get } from 'svelte/store';
import { authStore, clearTokens, setTokens } from './stores/authStore';

async function refreshAccessToken(): Promise<string | null> {
	const currentAuth = get(authStore);
	if (!currentAuth.refreshToken) {
		clearTokens();
		return null;
	}

	try {
		const response = await fetch('/api/refresh', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ refresh_token: currentAuth.refreshToken })
		});

		if (response.ok) {
			const data = await response.json();
			setTokens(data.access_token, data.refresh_token || currentAuth.refreshToken); // Refresh token might also be updated
			return data.access_token;
		} else if (response.status === 401) {
			clearTokens();
			return null;
		} else {
			console.error('Failed to refresh token:', response.status, response.statusText);
			clearTokens();
			return null;
		}
	} catch (error) {
		console.error('Network error during token refresh:', error);
		clearTokens();
		return null;
	}
}

export async function authenticatedFetch(
	input: RequestInfo,
	init?: RequestInit
): Promise<Response> {
	const currentAuth = get(authStore);
	const headers = new Headers(init?.headers);

	if (currentAuth.accessToken && !headers.has('Authorization')) {
		headers.set('Authorization', `Bearer ${currentAuth.accessToken}`);
	}

	const url = typeof input === 'string' ? input : input.url;

	let response = await fetch(url, { ...init, headers });

	if (response.status === 401) {
		const newAccessToken = await refreshAccessToken();
		if (newAccessToken) {
			headers.set('Authorization', `Bearer ${newAccessToken}`);
			const originalRequest =
				typeof input === 'string' ? new Request(url, { ...init, headers }) : input.clone();
			response = await fetch(originalRequest);
		} else {
			return response;
		}
	}

	return response;
}
