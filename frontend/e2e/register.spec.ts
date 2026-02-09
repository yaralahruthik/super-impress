import { expect, test } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const dashboardUrlPattern = /\/$/;

function createUniqueEmail(): string {
	return `e2e+${Date.now()}@example.com`;
}

test.describe('register', () => {
	test('shows required and format errors', async ({ page }) => {
		await page.goto(`${baseURL}/register`);
		await page.locator('form#register-form').evaluate((form) => {
			(form as HTMLFormElement).noValidate = true;
		});

		const nameInput = page.getByLabel('Name');
		const emailInput = page.getByLabel('Email');
		const passwordInput = page.getByLabel('Password', { exact: true });
		await nameInput.focus();
		await nameInput.blur();
		await emailInput.fill('invalid-email');
		await emailInput.blur();
		await passwordInput.fill('short');
		await passwordInput.blur();

		await page.getByRole('button', { name: 'Create Account' }).click();

		await expect(page.getByText('Name is required')).toBeVisible();
		await expect(page.getByText('Invalid email address')).toBeVisible();
		await expect(
			page.getByText('Password must be at least 8 characters')
		).toBeVisible();

	});

	test('shows password mismatch error', async ({ page }) => {
		await page.goto(`${baseURL}/register`);
		await page.locator('form#register-form').evaluate((form) => {
			(form as HTMLFormElement).noValidate = true;
		});

		await page.getByLabel('Name').fill('Playwright User');
		await page.getByLabel('Email').fill(createUniqueEmail());
		await page.getByLabel('Password', { exact: true }).fill('ValidPass1!');
		const confirmPasswordInput = page.getByLabel('Confirm Password', { exact: true });
		await confirmPasswordInput.fill('Mismatch1!');

		await page.getByRole('button', { name: 'Create Account' }).click();

		await expect(page.getByText('Passwords do not match')).toBeVisible();
		await expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');
	});

	test('registers and lands on dashboard', async ({ page }) => {
		await page.goto(`${baseURL}/register`);

		await page.getByLabel('Name').fill('Playwright User');
		await page.getByLabel('Email').fill(createUniqueEmail());
		await page.getByLabel('Password', { exact: true }).fill('ValidPass1!');
		await page.getByLabel('Confirm Password', { exact: true }).fill('ValidPass1!');

		await page.getByRole('button', { name: 'Create Account' }).click();

		await expect(page).toHaveURL(dashboardUrlPattern);
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
	});
});
