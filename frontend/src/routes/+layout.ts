export const prerender = false;
export const ssr = false;

export const load = async ({ data }) => {
	return {
		authenticated: data.authenticated,
		user: data.user
	};
};
