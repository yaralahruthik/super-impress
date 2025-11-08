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
		throw new Error(data.detail || 'Registration failed');
	}
	return data;
}
