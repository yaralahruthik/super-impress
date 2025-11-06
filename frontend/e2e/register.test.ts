import { expect, test } from '@playwright/test';

test.describe('Registration Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/register');
	});

	test('has registration form with all required fields', async ({ page }) => {
		// Check page has heading
		await expect(page.locator('h1')).toHaveText('Register');

		// Check form exists
		const form = page.locator('form[aria-label="Registration form"]');
		await expect(form).toBeVisible();

		// Check all required fields are present
		await expect(page.locator('label:has-text("Email address")')).toBeVisible();
		await expect(page.locator('input[type="email"][name="email"]')).toBeVisible();

		await expect(page.locator('label:has-text("Password")')).toBeVisible();
		await expect(page.locator('input[type="password"][name="password"]')).toBeVisible();

		await expect(page.locator('label:has-text("Confirm password")')).toBeVisible();
		await expect(page.locator('input[type="password"][name="confirm-password"]')).toBeVisible();

		// Check submit button exists
		await expect(page.locator('button[type="submit"]')).toHaveText('Register');
	});

	test('shows validation error when fields are empty', async ({ page }) => {
		// Submit empty form
		await page.locator('button[type="submit"]').click();

		// Check for error message
		const errorMessage = page.locator('[role="alert"]');
		await expect(errorMessage).toBeVisible();
		await expect(errorMessage).toContainText('All fields are required');
	});

	test('shows error when passwords do not match', async ({ page }) => {
		// Fill in form with mismatched passwords
		await page.locator('input[name="email"]').fill('test@example.com');
		await page.locator('input[name="password"]').fill('password123');
		await page.locator('input[name="confirm-password"]').fill('password456');

		// Submit form
		await page.locator('button[type="submit"]').click();

		// Check for error message
		const errorMessage = page.locator('[role="alert"]');
		await expect(errorMessage).toBeVisible();
		await expect(errorMessage).toContainText('Passwords do not match');
	});

	test('shows error when password is too short', async ({ page }) => {
		// Fill in form with short password
		await page.locator('input[name="email"]').fill('test@example.com');
		await page.locator('input[name="password"]').fill('pass123');
		await page.locator('input[name="confirm-password"]').fill('pass123');

		// Submit form
		await page.locator('button[type="submit"]').click();

		// Check for error message
		const errorMessage = page.locator('[role="alert"]');
		await expect(errorMessage).toBeVisible();
		await expect(errorMessage).toContainText('Password must be at least 8 characters long');
	});

	test('successfully registers a new user', async ({ page }) => {
		// Generate unique email for this test
		const uniqueEmail = `test-${Date.now()}@example.com`;

		// Fill in form with valid data
		await page.locator('input[name="email"]').fill(uniqueEmail);
		await page.locator('input[name="password"]').fill('password123');
		await page.locator('input[name="confirm-password"]').fill('password123');

		// Submit form
		await page.locator('button[type="submit"]').click();

		// Wait for success message
		const successMessage = page.locator('[role="status"]#success-message');
		await expect(successMessage).toBeVisible({ timeout: 10000 });
		await expect(successMessage).toContainText('Registration successful!');
		await expect(successMessage).toContainText(uniqueEmail);

		// Verify form is cleared
		await expect(page.locator('input[name="email"]')).toHaveValue('');
		await expect(page.locator('input[name="password"]')).toHaveValue('');
		await expect(page.locator('input[name="confirm-password"]')).toHaveValue('');
	});

	test('shows error when email is already registered', async ({ page }) => {
		// First registration
		const duplicateEmail = `duplicate-${Date.now()}@example.com`;

		await page.locator('input[name="email"]').fill(duplicateEmail);
		await page.locator('input[name="password"]').fill('password123');
		await page.locator('input[name="confirm-password"]').fill('password123');
		await page.locator('button[type="submit"]').click();

		// Wait for success
		await expect(page.locator('[role="status"]#success-message')).toBeVisible({ timeout: 10000 });

		// Try to register again with same email
		await page.locator('input[name="email"]').fill(duplicateEmail);
		await page.locator('input[name="password"]').fill('password123');
		await page.locator('input[name="confirm-password"]').fill('password123');
		await page.locator('button[type="submit"]').click();

		// Check for error message about duplicate email
		const errorMessage = page.locator('[role="alert"]');
		await expect(errorMessage).toBeVisible({ timeout: 10000 });
		await expect(errorMessage).toContainText('Email already registered');
	});

	test('disables form while submitting', async ({ page }) => {
		// Fill in form
		await page.locator('input[name="email"]').fill(`test-${Date.now()}@example.com`);
		await page.locator('input[name="password"]').fill('password123');
		await page.locator('input[name="confirm-password"]').fill('password123');

		// Submit form
		await page.locator('button[type="submit"]').click();

		// Check that fieldset is disabled during submission
		const fieldset = page.locator('fieldset');
		await expect(fieldset).toBeDisabled();
	});

	test('has link to login page', async ({ page }) => {
		const loginLink = page.locator('a[href="/login"]');
		await expect(loginLink).toBeVisible();
		await expect(loginLink).toHaveText('Log in');
	});

	test('form has proper semantic HTML attributes', async ({ page }) => {
		// Check form has aria-label
		const form = page.locator('form');
		await expect(form).toHaveAttribute('aria-label', 'Registration form');

		// Check fieldset has legend
		const legend = page.locator('legend');
		await expect(legend).toBeVisible();
		await expect(legend).toHaveText('Create your account');

		// Check email input has proper attributes
		const emailInput = page.locator('input[name="email"]');
		await expect(emailInput).toHaveAttribute('type', 'email');
		await expect(emailInput).toHaveAttribute('required');
		await expect(emailInput).toHaveAttribute('autocomplete', 'email');
		await expect(emailInput).toHaveAttribute('aria-required', 'true');

		// Check password inputs have proper attributes
		const passwordInput = page.locator('input[name="password"]');
		await expect(passwordInput).toHaveAttribute('type', 'password');
		await expect(passwordInput).toHaveAttribute('required');
		await expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
		await expect(passwordInput).toHaveAttribute('minlength', '8');

		const confirmPasswordInput = page.locator('input[name="confirm-password"]');
		await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
		await expect(confirmPasswordInput).toHaveAttribute('required');
		await expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
	});
});
