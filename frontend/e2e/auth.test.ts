import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
	test('should allow a user to register successfully', async ({ page }) => {
		await page.goto('/register');

		const uniqueEmail = `newuser-${Date.now()}@example.com`;
		await page.fill('input#name', 'Test User');
		await page.fill('input#email', uniqueEmail);
		await page.fill('input#password', 'newpassword123');

		await page.click('button[type="submit"]');

		await page.waitForURL('/login');
		await expect(page.locator('h1')).toHaveText('Login');
	});

	test('should prevent registration with existing email', async ({ page }) => {
		const existingEmail = `existing-${Date.now()}@example.com`;
		const password = 'password123';

		await page.goto('/register');
		await page.fill('input#name', 'Test User');
		await page.fill('input#email', existingEmail);
		await page.fill('input#password', password);
		await page.click('button[type="submit"]');
		await page.waitForURL('/login');

		await page.goto('/register');
		await page.fill('input#name', 'Test User');
		await page.fill('input#email', existingEmail);
		await page.fill('input#password', password);
		await page.click('button[type="submit"]');

		await expect(page.url()).toContain('/register');
		await expect(page.locator('p[style*="color: red"]')).toBeVisible();
	});

	test('should allow a user to log in successfully', async ({ page }) => {
		const uniqueEmail = `testuser-${Date.now()}@example.com`;
		const password = 'password123';

		await page.goto('/register');
		await page.fill('input#name', 'Test User');
		await page.fill('input#email', uniqueEmail);
		await page.fill('input#password', password);
		await page.click('button[type="submit"]');
		await page.waitForURL('/login');

		await page.fill('input#email', uniqueEmail);
		await page.fill('input#password', password);
		await page.click('button[type="submit"]');

		await page.waitForURL('/dashboard');
		await expect(page.url()).toContain('/dashboard');
	});

	test('should display validation errors for invalid login', async ({ page }) => {
		await page.goto('/login');

		await page.fill('input#email', 'invalid@example.com');
		await page.fill('input#password', 'wrongpassword');
		await page.click('button[type="submit"]');

		await expect(page.url()).toContain('/login');
		await expect(page.locator('p[style*="color: red"]')).toBeVisible();
	});

	test('should allow a logged-in user to log out', async ({ page }) => {
		const uniqueEmail = `testuser-${Date.now()}@example.com`;
		const password = 'password123';

		await page.goto('/register');
		await page.fill('input#name', 'Test User');
		await page.fill('input#email', uniqueEmail);
		await page.fill('input#password', password);
		await page.click('button[type="submit"]');
		await page.waitForURL('/login');

		await page.fill('input#email', uniqueEmail);
		await page.fill('input#password', password);
		await page.click('button[type="submit"]');
		await page.waitForURL('/dashboard');

		await page.click('button:has-text("Logout")');

		await page.waitForURL('/login');
		await expect(page.locator('h1')).toHaveText('Login');
		await expect(page.locator('input#email')).toBeVisible();
	});

	test('should redirect authenticated user away from login page', async ({ page }) => {
		const uniqueEmail = `testuser-${Date.now()}@example.com`;
		const password = 'password123';

		await page.goto('/register');
		await page.fill('input#name', 'Test User');
		await page.fill('input#email', uniqueEmail);
		await page.fill('input#password', password);
		await page.click('button[type="submit"]');
		await page.waitForURL('/login');

		await page.fill('input#email', uniqueEmail);
		await page.fill('input#password', password);
		await page.click('button[type="submit"]');
		await page.waitForURL('/dashboard');

		await page.goto('/login');
		await page.waitForURL('/dashboard');
		await expect(page.url()).toContain('/dashboard');
	});

	test('should redirect authenticated user away from register page', async ({ page }) => {
		const uniqueEmail = `testuser-${Date.now()}@example.com`;
		const password = 'password123';

		await page.goto('/register');
		await page.fill('input#name', 'Test User');
		await page.fill('input#email', uniqueEmail);
		await page.fill('input#password', password);
		await page.click('button[type="submit"]');
		await page.waitForURL('/login');

		await page.fill('input#email', uniqueEmail);
		await page.fill('input#password', password);
		await page.click('button[type="submit"]');
		await page.waitForURL('/dashboard');

		await page.goto('/register');
		await page.waitForURL('/dashboard');
		await expect(page.url()).toContain('/dashboard');
	});

	test('should redirect unauthenticated user to login page when accessing a protected route', async ({
		page
	}) => {
		await page.goto('/dashboard');

		await page.waitForURL('/login');
		await expect(page.url()).toContain('/login');
		await expect(page.locator('h1')).toHaveText('Login');
	});
});
