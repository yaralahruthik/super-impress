export async function loginApi({ email, password }: { email: string; password: string }) {
	const formData = new FormData();
	formData.append('username', email);
	formData.append('password', password);

	const response = await fetch('/api/login', {
		method: 'POST',
		body: formData
	});

	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.detail || 'Login failed');
	}

	return data;
}
