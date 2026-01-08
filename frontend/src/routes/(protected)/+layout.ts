import { auth } from '$lib/stores/auth';
import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

export function load({ depends }) {
	depends('app:auth');

	const state = get(auth);

	if (!state.isAuthenticated) {
		throw redirect(302, '/login');
	}

	return {};
}
