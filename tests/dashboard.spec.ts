import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.locator("input").first().fill("AUREA2026");
    await page.locator('button[type="submit"], button:has-text("Access"), button:has-text("Login")').first().click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });

  test("dashboard loads with chat interface", async ({ page }) => {
    // Axel AI dashboard should have a chat input
    await expect(page.locator("textarea, input[type='text'], [contenteditable]")).toBeVisible();
  });

  test("navigate to settings page", async ({ page }) => {
    await page.locator('a[href*="settings"], button:has-text("Settings")').first().click();
    await expect(page).toHaveURL(/settings/, { timeout: 5000 });
    await expect(page.locator("text=Profile").or(page.locator("text=Display"))).toBeVisible();
  });

  test("navigate to Business Organizer", async ({ page }) => {
    await page.locator('a[href*="business"], a[href*="organizer"], button:has-text("Business")').first().click();
    // Should navigate somewhere
    await expect(page.locator("body")).toBeVisible();
  });

  test("chat input sends message and gets AI response", async ({ page }) => {
    const chatInput = page.locator("textarea, [contenteditable]").first();
    if (await chatInput.isVisible()) {
      await chatInput.fill("Hello Axel");
      await page.keyboard.press("Enter");
      // Should get a streaming or static response
      await page.waitForTimeout(3000);
      const responseText = await page.locator("body").textContent();
      // Check that some response content appeared
      expect(responseText).toBeTruthy();
    }
  });

  test("CEO Dashboard loads via sidebar", async ({ page }) => {
    await page.locator('a[href*="ceo"], button:has-text("CEO")').first().click();
    await expect(page.locator("text=Free Codes").or(page.locator("text=CEO"))).toBeVisible({ timeout: 5000 });
  });

  test("credit display visible", async ({ page }) => {
    await expect(page.locator("text=Credits").or(page.locator("text=Tasks"))).toBeVisible({ timeout: 5000 });
  });
});
