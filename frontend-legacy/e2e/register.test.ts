import { expect, test } from '@playwright/test';

test.describe('Registration Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/register');
	});

	test('has registration form with all required fields', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Register', level: 1 })).toBeVisible();

		const form = page.getByRole('form', { name: 'Create your account' });
		await expect(form).toBeVisible();

		await expect(page.getByLabel('Email')).toBeVisible();
		await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
		await expect(page.getByLabel('Confirm password')).toBeVisible();

		await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
	});

	test('successfully registers a new user', async ({ page }) => {
		const uniqueEmail = `test-${Date.now()}@example.com`;
		const password = 'Password@123';

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

	test('shows error when email is already registered', async ({ page }) => {
		const duplicateEmail = `duplicate-${Date.now()}@example.com`;
		const password = 'Password@123';

		await page.getByLabel('Email').fill(duplicateEmail);
		await page.getByLabel('Password', { exact: true }).fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page.getByRole('button', { name: 'Register' }).click();

		await expect(page).toHaveURL('/login');

		await page.goto('/register');

		await page.getByLabel('Email').fill(duplicateEmail);
		await page.getByLabel('Password', { exact: true }).fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page.getByRole('button', { name: 'Register' }).click();

		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toContainText('Email already registered');
	});

	test('has link to login page', async ({ page }) => {
		const loginLink = page.getByRole('link', { name: 'Log in' });
		await expect(loginLink).toBeVisible();
		await expect(loginLink).toHaveAttribute('href', '/login');
	});

	test.describe('Password validation', () => {
		test('shows error when password does not have an uppercase letter', async ({ page }) => {
			await page.getByLabel('Email').fill('test-invalid-password@example.com');
			await page.getByLabel('Password', { exact: true }).fill('password@123');
			await page.getByLabel('Confirm password').fill('password@123');
			await page.getByRole('button', { name: 'Register' }).click();

			const errorAlert = page.getByRole('alert');
			await expect(errorAlert).toContainText(
				'Password must contain at least one uppercase letter, lowercase letter, digit, and special character'
			);
		});

		test('shows error when password does not have a lowercase letter', async ({ page }) => {
			await page.getByLabel('Email').fill('test-invalid-password@example.com');
			await page.getByLabel('Password', { exact: true }).fill('PASSWORD@123');
			await page.getByLabel('Confirm password').fill('PASSWORD@123');
			await page.getByRole('button', { name: 'Register' }).click();

			const errorAlert = page.getByRole('alert');
			await expect(errorAlert).toContainText(
				'Password must contain at least one uppercase letter, lowercase letter, digit, and special character'
			);
		});

		test('shows error when password does not have a digit', async ({ page }) => {
			await page.getByLabel('Email').fill('test-invalid-password@example.com');
			await page.getByLabel('Password', { exact: true }).fill('Password@');
			await page.getByLabel('Confirm password').fill('Password@');
			await page.getByRole('button', { name: 'Register' }).click();

			const errorAlert = page.getByRole('alert');
			await expect(errorAlert).toContainText(
				'Password must contain at least one uppercase letter, lowercase letter, digit, and special character'
			);
		});

		test('shows error when password does not have a special character', async ({ page }) => {
			await page.getByLabel('Email').fill('test-invalid-password@example.com');
			await page.getByLabel('Password', { exact: true }).fill('Password123');
			await page.getByLabel('Confirm password').fill('Password123');
			await page.getByRole('button', { name: 'Register' }).click();

			const errorAlert = page.getByRole('alert');
			await expect(errorAlert).toContainText(
				'Password must contain at least one uppercase letter, lowercase letter, digit, and special character'
			);
		});
	});
});
