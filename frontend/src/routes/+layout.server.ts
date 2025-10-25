export const load = async ({ fetch }) => {
	try {
		let res = await fetch(`/api/me`, {
			credentials: 'include'
		});

		if (res.status === 401) {
			const refreshRes = await fetch(`/api/refresh`, {
				method: 'POST',
				credentials: 'include'
			});

			if (!refreshRes.ok) {
				return { authenticated: false, user: null };
			}

			res = await fetch(`/api/me`, {
				credentials: 'include'
			});
		}

		if (!res.ok) return { authenticated: false, user: null };

		const user = await res.json();
		return { authenticated: true, user };
	} catch (err) {
		console.error('Error checking auth:', err);
		return { authenticated: false, user: null };
	}
};
