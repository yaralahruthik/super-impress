import { expect, test } from '@playwright/test';

test.describe('Login Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
	});

	test('has login form with all required fields', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Log in', level: 1 })).toBeVisible();

		const form = page.getByRole('form', { name: 'Log in to your account' });
		await expect(form).toBeVisible();

		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();

		await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
	});

	test('successfully logs in with valid credentials', async ({ page }) => {
		const uniqueEmail = `login-test-${Date.now()}@example.com`;
		const password = 'Password@123';

		await page.goto('/register');
		await page.getByLabel('Email').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page.getByRole('button', { name: 'Register' }).click();

		await expect(page).toHaveURL('/login');
		await page.getByLabel('Email').fill(uniqueEmail);
		await page.getByLabel('Password').fill(password);

		await page.getByRole('button', { name: 'Log in' }).click();

		await expect(page).toHaveURL('/');
	});

	test('has link to register page', async ({ page }) => {
		const registerLink = page.getByRole('link', { name: 'Register' });
		await expect(registerLink).toBeVisible();
		await expect(registerLink).toHaveAttribute('href', '/register');
	});
});
