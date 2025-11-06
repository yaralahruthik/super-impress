import { expect, test } from '@playwright/test';

test.describe('Login Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
	});

	test('has login form with all required fields', async ({ page }) => {
		// Check page has heading
		await expect(page.getByRole('heading', { name: 'Log in', level: 1 })).toBeVisible();

		// Check form exists with proper label
		const form = page.getByRole('form', { name: 'Log in to your account' });
		await expect(form).toBeVisible();

		// Check all required fields are present using getByLabel
		await expect(page.getByLabel('Email address')).toBeVisible();
		await expect(page.getByLabel('Password')).toBeVisible();

		// Check submit button exists
		await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
	});

	test('successfully logs in with valid credentials', async ({ page }) => {
		// First, create a user to log in with
		const uniqueEmail = `login-test-${Date.now()}@example.com`;
		const password = 'password123';

		// Navigate to register page and create account
		await page.goto('/register');
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page.getByRole('button', { name: 'Register' }).click();

		// Wait for registration success
		await expect(page.getByRole('status')).toBeVisible({ timeout: 10000 });

		// Now navigate to login page
		await page.goto('/login');

		// Fill in form with valid credentials
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password').fill(password);

		// Submit form
		await page.getByRole('button', { name: 'Log in' }).click();

		// Wait for success message
		const successStatus = page.getByRole('status');
		await expect(successStatus).toBeVisible({ timeout: 10000 });
		await expect(successStatus).toContainText('Login successful!');

		// Verify form is cleared
		await expect(page.getByLabel('Email address')).toHaveValue('');
		await expect(page.getByLabel('Password')).toHaveValue('');
	});

	test('shows error with incorrect password', async ({ page }) => {
		// First, create a user
		const uniqueEmail = `incorrect-pwd-${Date.now()}@example.com`;
		const correctPassword = 'password123';

		// Navigate to register page and create account
		await page.goto('/register');
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill(correctPassword);
		await page.getByLabel('Confirm password').fill(correctPassword);
		await page.getByRole('button', { name: 'Register' }).click();

		// Wait for registration success
		await expect(page.getByRole('status')).toBeVisible({ timeout: 10000 });

		// Now try to login with wrong password
		await page.goto('/login');
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password').fill('wrongpassword');
		await page.getByRole('button', { name: 'Log in' }).click();

		// Check for error message
		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible({ timeout: 10000 });
		await expect(errorAlert).toContainText('Incorrect email or password');
	});

	test('shows error with non-existent email', async ({ page }) => {
		// Try to login with email that doesn't exist
		await page.getByLabel('Email address').fill('nonexistent@example.com');
		await page.getByLabel('Password').fill('password123');

		// Submit form
		await page.getByRole('button', { name: 'Log in' }).click();

		// Check for error message
		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible({ timeout: 10000 });
		await expect(errorAlert).toContainText('Incorrect email or password');
	});

	test('disables form while submitting', async ({ page }) => {
		// Fill in form
		await page.getByLabel('Email address').fill('test@example.com');
		await page.getByLabel('Password').fill('password123');

		// Submit form
		await page.getByRole('button', { name: 'Log in' }).click();

		// Check that button text changes during submission
		await expect(page.getByRole('button', { name: 'Logging in...' })).toBeVisible();
	});

	test('has link to register page', async ({ page }) => {
		// Use getByRole for link
		const registerLink = page.getByRole('link', { name: 'Register' });
		await expect(registerLink).toBeVisible();
		await expect(registerLink).toHaveAttribute('href', '/register');
	});

	test('form inputs have proper semantic HTML attributes', async ({ page }) => {
		// Check email input has proper attributes
		const emailInput = page.getByLabel('Email address');
		await expect(emailInput).toHaveAttribute('type', 'email');
		await expect(emailInput).toHaveAttribute('required');
		await expect(emailInput).toHaveAttribute('autocomplete', 'email');
		await expect(emailInput).toHaveAttribute('aria-required', 'true');

		// Check password input has proper attributes
		const passwordInput = page.getByLabel('Password');
		await expect(passwordInput).toHaveAttribute('type', 'password');
		await expect(passwordInput).toHaveAttribute('required');
		await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
	});

	test('stores access token in localStorage on successful login', async ({ page }) => {
		// First, create a user to log in with
		const uniqueEmail = `token-test-${Date.now()}@example.com`;
		const password = 'password123';

		// Navigate to register page and create account
		await page.goto('/register');
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill(password);
		await page.getByLabel('Confirm password').fill(password);
		await page.getByRole('button', { name: 'Register' }).click();

		// Wait for registration success
		await expect(page.getByRole('status')).toBeVisible({ timeout: 10000 });

		// Now navigate to login page
		await page.goto('/login');

		// Fill in form with valid credentials
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password').fill(password);

		// Submit form
		await page.getByRole('button', { name: 'Log in' }).click();

		// Wait for success message
		await expect(page.getByRole('status')).toBeVisible({ timeout: 10000 });

		// Check that access token is stored in localStorage
		const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
		expect(accessToken).not.toBeNull();
		expect(accessToken).toBeTruthy();
	});
});
