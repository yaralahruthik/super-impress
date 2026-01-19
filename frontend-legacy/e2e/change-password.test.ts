import { expect, test } from '@playwright/test';

test.describe('Change Password Page', () => {
	test('redirects to login if user is not authenticated', async ({ page }) => {
		await page.goto('/change-password');

		await expect(page).toHaveURL('/login');
	});

	test('has change password form with all required fields after login', async ({ page }) => {
		const uniqueEmail = `guard-test-${Date.now()}@example.com`;
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

		await page.goto('/change-password');
		await expect(page).toHaveURL('/change-password');

		const form = page.getByRole('form', { name: 'Change your password' });
		await expect(form).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Change Password', level: 1 })).toBeVisible();
		await expect(page.getByLabel('Current password')).toBeVisible();
		await expect(page.getByLabel('New password', { exact: true })).toBeVisible();
		await expect(page.getByLabel('Confirm new password', { exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Change password' })).toBeVisible();
	});

	test('successfully changes password with valid credentials', async ({ page }) => {
		const uniqueEmail = `change-password-test-${Date.now()}@example.com`;
		const oldPassword = 'Password@123';
		const newPassword = 'Password@456';

		await page.goto('/register');
		await page.getByLabel('Email').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill(oldPassword);
		await page.getByLabel('Confirm password').fill(oldPassword);
		await page.getByRole('button', { name: 'Register' }).click();

		await expect(page).toHaveURL('/login');
		await page.getByLabel('Email').fill(uniqueEmail);
		await page.getByLabel('Password').fill(oldPassword);
		await page.getByRole('button', { name: 'Log in' }).click();
		await expect(page).toHaveURL('/');

		await page.goto('/change-password');
		await expect(page).toHaveURL('/change-password');

		await page.getByLabel('Current password').fill(oldPassword);
		await page.getByLabel('New password', { exact: true }).fill(newPassword);
		await page.getByLabel('Confirm new password', { exact: true }).fill(newPassword);
		await page.getByRole('button', { name: 'Change password' }).click();

		await expect(page).toHaveURL('/');
	});
});
