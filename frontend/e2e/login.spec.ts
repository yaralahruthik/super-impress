/// <reference types="node" />

import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
const dashboardUrlPattern = /\/$/;
const loginUrlPattern = /\/login(\?.*)?$/;
const nonEmptyTextPattern = /\S+/;

function createUniqueEmail(): string {
  return `e2e+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

async function disableNativeValidation(page: Page) {
  const form = page.locator("form#login-form");
  await form.waitFor({ state: "visible" });
  await form.evaluate((form) => {
    (form as HTMLFormElement).noValidate = true;
  });
}

async function disableRegisterValidation(page: Page) {
  const form = page.locator("form#register-form");
  await form.waitFor({ state: "visible" });
  await form.evaluate((form) => {
    (form as HTMLFormElement).noValidate = true;
  });
}

test.describe("login", () => {
  test("shows required and format errors", async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await disableNativeValidation(page);

    const emailInput = page.getByLabel("Email");
    const passwordInput = page.getByLabel("Password", { exact: true });

    await emailInput.fill("invalid-email");
    await emailInput.blur();
    await passwordInput.focus();
    await passwordInput.blur();

    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await disableNativeValidation(page);

    await page.getByLabel("Email").fill(createUniqueEmail());
    await page.getByLabel("Password", { exact: true }).fill("WrongPass1!");
    await page.getByRole("button", { name: "Sign In" }).click();

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText(nonEmptyTextPattern);
  });

  test("registers, logs out, and logs in", async ({ page }) => {
    const email = createUniqueEmail();
    const password = "ValidPass1!";

    await page.goto(`${baseURL}/register`);
    await disableRegisterValidation(page);

    await page.getByLabel("Name").fill("Playwright User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm Password", { exact: true }).fill(password);

    await page.getByRole("button", { name: "Create Account" }).click();

    await expect(page).toHaveURL(dashboardUrlPattern);
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(loginUrlPattern);
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL(dashboardUrlPattern);
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  });
});
