import { expect, test } from '@playwright/test';

test.describe('Registration Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/register');
	});

	test('has registration form with all required fields', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Register', level: 1 })).toBeVisible();

		const form = page.getByRole('form', { name: 'Create your account' });
		await expect(form).toBeVisible();

		await expect(page.getByLabel('Email address')).toBeVisible();
		await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
		await expect(page.getByLabel('Confirm password')).toBeVisible();

		await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
	});

	test('successfully registers a new user', async ({ page }) => {
		const uniqueEmail = `test-${Date.now()}@example.com`;

		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill('password123');
		await page.getByLabel('Confirm password').fill('password123');

		await page.getByRole('button', { name: 'Register' }).click();

		const successStatus = page.getByRole('status');
		await expect(successStatus).toBeVisible({ timeout: 10000 });
		await expect(successStatus).toContainText('Registration successful!');
		await expect(successStatus).toContainText(uniqueEmail);
	});

	test('shows error when email is already registered', async ({ page }) => {
		const duplicateEmail = `duplicate-${Date.now()}@example.com`;

		await page.getByLabel('Email address').fill(duplicateEmail);
		await page.getByLabel('Password', { exact: true }).fill('password123');
		await page.getByLabel('Confirm password').fill('password123');
		await page.getByRole('button', { name: 'Register' }).click();

		await expect(page.getByRole('status')).toBeVisible({ timeout: 10000 });

		await page.getByLabel('Email address').fill(duplicateEmail);
		await page.getByLabel('Password', { exact: true }).fill('password123');
		await page.getByLabel('Confirm password').fill('password123');
		await page.getByRole('button', { name: 'Register' }).click();

		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible({ timeout: 10000 });
		await expect(errorAlert).toContainText('Email already registered');
	});

	test('has link to login page', async ({ page }) => {
		const loginLink = page.getByRole('link', { name: 'Log in' });
		await expect(loginLink).toBeVisible();
		await expect(loginLink).toHaveAttribute('href', '/login');
	});
});
