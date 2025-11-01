import { expect, Page, test } from '@playwright/test';

const createUniqueEmail = (prefix = 'user') =>
	`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

async function registerUser(
	page: Page,
	email: string,
	password = 'password123',
	name = 'Test User'
) {
	await page.goto('/register');
	await page.getByLabel('Name').fill(name);
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill(password);
	await page.getByRole('button', { name: /register/i }).click();
	await page.waitForURL('/login');
}

async function loginUser(page: Page, email: string, password = 'password123') {
	await page.goto('/login');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Password').fill(password);
	await page.getByRole('button', { name: /login/i }).click();
	await page.waitForURL('/dashboard');
}

test.describe('Authentication', () => {
	test('should allow a user to register successfully', async ({ page }) => {
		await page.goto('/register');

		const uniqueEmail = createUniqueEmail('newuser');
		await page.getByLabel('Name').fill('Test User');
		await page.getByLabel('Email').fill(uniqueEmail);
		await page.getByLabel('Password').fill('newpassword123');

		await page.getByRole('button', { name: /register/i }).click();

		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Login');
	});

	test('should prevent registration with existing email', async ({ page }) => {
		const existingEmail = createUniqueEmail('existing');
		const password = 'password123';

		await registerUser(page, existingEmail, password);

		await page.goto('/register');
		await page.getByLabel('Name').fill('Test User');
		await page.getByLabel('Email').fill(existingEmail);
		await page.getByLabel('Password').fill(password);
		await page.getByRole('button', { name: /register/i }).click();

		await expect(page).toHaveURL(/\/register/);
		await expect(page.getByText('Email already registered')).toBeVisible();
	});

	test('should allow a user to log in successfully', async ({ page }) => {
		const uniqueEmail = createUniqueEmail('testuser');
		const password = 'password123';

		await registerUser(page, uniqueEmail, password);

		await page.getByLabel('Email').fill(uniqueEmail);
		await page.getByLabel('Password').fill(password);
		await page.getByRole('button', { name: /login/i }).click();

		await expect(page).toHaveURL('/dashboard');
	});

	test('should display validation errors for invalid login', async ({ page }) => {
		await page.goto('/login');

		await page.getByLabel('Email').fill('invalid@example.com');
		await page.getByLabel('Password').fill('wrongpassword');
		await page.getByRole('button', { name: /login/i }).click();

		await expect(page).toHaveURL(/\/login/);
		await expect(page.getByText('Incorrect email or password')).toBeVisible();
	});

	test('should allow a logged-in user to log out', async ({ page }) => {
		const uniqueEmail = createUniqueEmail('testuser');
		const password = 'password123';

		await registerUser(page, uniqueEmail, password);
		await loginUser(page, uniqueEmail, password);

		await page.getByRole('button', { name: /logout/i }).click();

		await expect(page).toHaveURL('/login');
		await expect(page.locator('h1')).toHaveText('Login');
		await expect(page.getByLabel('Email')).toBeVisible();
	});

	test('should redirect authenticated user away from login page', async ({ page }) => {
		const uniqueEmail = createUniqueEmail('testuser');
		const password = 'password123';

		await registerUser(page, uniqueEmail, password);
		await loginUser(page, uniqueEmail, password);

		await page.goto('/login');

		await expect(page).toHaveURL('/dashboard');
	});

	test('should redirect authenticated user away from register page', async ({ page }) => {
		const uniqueEmail = createUniqueEmail('testuser');
		const password = 'password123';

		await registerUser(page, uniqueEmail, password);
		await loginUser(page, uniqueEmail, password);

		await page.goto('/register');

		await expect(page).toHaveURL('/dashboard');
	});

	test('should redirect unauthenticated user to login page when accessing a protected route', async ({
		page
	}) => {
		await page.goto('/dashboard');

		await expect(page).toHaveURL('/login');
		await expect(page.locator('h1')).toHaveText('Login');
	});
});
