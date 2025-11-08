import { expect, test } from '@playwright/test';

test.describe('Registration Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/register');
	});

	test('has registration form with all required fields', async ({ page }) => {
		// Check page has heading
		await expect(page.getByRole('heading', { name: 'Register', level: 1 })).toBeVisible();

		// Check form exists with proper label
		const form = page.getByRole('form', { name: 'Create your account' });
		await expect(form).toBeVisible();

		// Check all required fields are present using getByLabel
		await expect(page.getByLabel('Email address')).toBeVisible();
		await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
		await expect(page.getByLabel('Confirm password')).toBeVisible();

		// Check submit button exists
		await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
	});

	test('shows error when passwords do not match', async ({ page }) => {
		// Fill in form with mismatched passwords using getByLabel
		await page.getByLabel('Email address').fill('test@example.com');
		await page.getByLabel('Password', { exact: true }).fill('Password@123');
		await page.getByLabel('Confirm password').fill('password456');

		// Submit form
		await page.getByRole('button', { name: 'Register' }).click();

		// Check for error message
		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible();
		await expect(errorAlert).toContainText('Passwords do not match');
	});

	test('successfully registers a new user', async ({ page }) => {
		// Generate unique email for this test
		const uniqueEmail = `test-${Date.now()}@example.com`;

		// Fill in form with valid data
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill('Password@123');
		await page.getByLabel('Confirm password').fill('Password@123');

		// Submit form
		await page.getByRole('button', { name: 'Register' }).click();

		// Wait for success message using getByRole
		const successStatus = page.getByRole('status');
		await expect(successStatus).toBeVisible({ timeout: 10000 });
		await expect(successStatus).toContainText('Registration successful!');
		await expect(successStatus).toContainText(uniqueEmail);

		// Verify form is cleared
		await expect(page.getByLabel('Email address')).toHaveValue('');
		await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
		await expect(page.getByLabel('Confirm password')).toHaveValue('');
	});

	test('shows error when email is already registered', async ({ page }) => {
		// First registration
		const duplicateEmail = `duplicate-${Date.now()}@example.com`;

		await page.getByLabel('Email address').fill(duplicateEmail);
		await page.getByLabel('Password', { exact: true }).fill('Password@123');
		await page.getByLabel('Confirm password').fill('Password@123');
		await page.getByRole('button', { name: 'Register' }).click();

		// Wait for success
		await expect(page.getByRole('status')).toBeVisible({ timeout: 10000 });

		// Try to register again with same email
		await page.getByLabel('Email address').fill(duplicateEmail);
		await page.getByLabel('Password', { exact: true }).fill('Password@123');
		await page.getByLabel('Confirm password').fill('Password@123');
		await page.getByRole('button', { name: 'Register' }).click();

		// Check for error message about duplicate email
		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible({ timeout: 10000 });
		await expect(errorAlert).toContainText('Email already registered');
	});

	test('shows error for password less than 8 characters', async ({ page }) => {
		// Fill in form with password that is too short
		const uniqueEmail = `short-password-${Date.now()}@example.com`;
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill('Pass@1');
		await page.getByLabel('Confirm password').fill('Pass@1');

		// Submit form
		await page.getByRole('button', { name: 'Register' }).click();

		// Check for error message
		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible();
		await expect(errorAlert).toContainText('Error: Password must be at least 8 characters long');
	});

	test('shows error for password more than 15 characters', async ({ page }) => {
		// Fill in form with password that is too long
		const uniqueEmail = `long-password-${Date.now()}@example.com`;
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill('ThisIsAVeryLongP@ssword');
		await page.getByLabel('Confirm password').fill('ThisIsAVeryLongP@ssword');

		// Submit form
		await page.getByRole('button', { name: 'Register' }).click();

		// Check for error message
		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible();
		await expect(errorAlert).toContainText('String should have at most 15 characters');
	});

	test('shows error for password without uppercase letter', async ({ page }) => {
		// Fill in form with password missing uppercase
		const uniqueEmail = `no-upper-${Date.now()}@example.com`;
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill('password@123');
		await page.getByLabel('Confirm password').fill('password@123');

		// Submit form
		await page.getByRole('button', { name: 'Register' }).click();

		// Check for error message
		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible();
		await expect(errorAlert).toContainText(
			'Password must contain at least one uppercase letter, lowercase letter, digit, and special character'
		);
	});

	test('shows error for password without lowercase letter', async ({ page }) => {
		// Fill in form with password missing lowercase
		const uniqueEmail = `no-lower-${Date.now()}@example.com`;
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill('PASSWORD@123');
		await page.getByLabel('Confirm password').fill('PASSWORD@123');

		// Submit form
		await page.getByRole('button', { name: 'Register' }).click();

		// Check for error message
		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible();
		await expect(errorAlert).toContainText(
			'Password must contain at least one uppercase letter, lowercase letter, digit, and special character'
		);
	});

	test('shows error for password without digit', async ({ page }) => {
		// Fill in form with password missing digit
		const uniqueEmail = `no-digit-${Date.now()}@example.com`;
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill('Password@');
		await page.getByLabel('Confirm password').fill('Password@');

		// Submit form
		await page.getByRole('button', { name: 'Register' }).click();

		// Check for error message
		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible();
		await expect(errorAlert).toContainText(
			'Password must contain at least one uppercase letter, lowercase letter, digit, and special character'
		);
	});

	test('shows error for password without special character', async ({ page }) => {
		// Fill in form with password missing special character
		const uniqueEmail = `no-special-${Date.now()}@example.com`;
		await page.getByLabel('Email address').fill(uniqueEmail);
		await page.getByLabel('Password', { exact: true }).fill('Password123');
		await page.getByLabel('Confirm password').fill('Password123');

		// Submit form
		await page.getByRole('button', { name: 'Register' }).click();

		// Check for error message
		const errorAlert = page.getByRole('alert');
		await expect(errorAlert).toBeVisible();
		await expect(errorAlert).toContainText(
			'Password must contain at least one uppercase letter, lowercase letter, digit, and special character'
		);
	});

	test('disables form while submitting', async ({ page }) => {
		// Fill in form
		await page.getByLabel('Email address').fill(`test-${Date.now()}@example.com`);
		await page.getByLabel('Password', { exact: true }).fill('Password@123');
		await page.getByLabel('Confirm password').fill('Password@123');

		// Submit form
		await page.getByRole('button', { name: 'Register' }).click();

		// Check that button text changes during submission
		await expect(page.getByRole('button', { name: 'Registering...' })).toBeVisible();
	});

	test('has link to login page', async ({ page }) => {
		// Use getByRole for link
		const loginLink = page.getByRole('link', { name: 'Log in' });
		await expect(loginLink).toBeVisible();
		await expect(loginLink).toHaveAttribute('href', '/login');
	});

	test('form inputs have proper semantic HTML attributes', async ({ page }) => {
		// Check email input has proper attributes
		const emailInput = page.getByLabel('Email address');
		await expect(emailInput).toHaveAttribute('type', 'email');
		await expect(emailInput).toHaveAttribute('required');
		await expect(emailInput).toHaveAttribute('autocomplete', 'email');
		await expect(emailInput).toHaveAttribute('aria-required', 'true');

		// Check password input has proper attributes
		const passwordInput = page.getByLabel('Password', { exact: true });
		await expect(passwordInput).toHaveAttribute('type', 'password');
		await expect(passwordInput).toHaveAttribute('required');
		await expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');

		// Check confirm password input
		const confirmPasswordInput = page.getByLabel('Confirm password');
		await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
		await expect(confirmPasswordInput).toHaveAttribute('required');
		await expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
	});
});
