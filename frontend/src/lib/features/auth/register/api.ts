export async function registerApi({ email, password }: { email: string; password: string }) {
	const response = await fetch('/api/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ email, password })
	});

	const data = await response.json();
	if (!response.ok) {
		if (Array.isArray(data.detail)) {
			throw new Error(data.detail[0].msg || 'Registration failed');
		} else {
			throw new Error(data.detail || 'Registration failed');
		}
	}
	return data;
}
