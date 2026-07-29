import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Axel AI/, { timeout: 10000 });
    await expect(page.locator("text=Tell it what to do").or(page.locator("text=axle"))).toBeVisible({ timeout: 10000 });
  });

  test("login page loads with code input", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input")).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Access"), button:has-text("Login")').first()).toBeVisible();
  });

  test("access code login works (AUREA2026)", async ({ page }) => {
    await page.goto("/login");
    await page.locator("input").first().fill("AUREA2026");
    await page.locator('button[type="submit"], button:has-text("Access"), button:has-text("Login")').first().click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });

  test("access code login works (FAMILY4EVR)", async ({ page }) => {
    await page.goto("/login");
    await page.locator("input").first().fill("FAMILY4EVR");
    await page.locator('button[type="submit"], button:has-text("Access"), button:has-text("Login")').first().click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });

  test("email signup flow", async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill("testpass123");
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });

  test("email login flow with existing user", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("owner@axelai.app");
    await page.locator('input[type="password"]').fill("testpass123");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("text=success,text=error,text=Invalid")).toBeVisible({ timeout: 15000 });
  });
});
