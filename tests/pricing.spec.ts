import { test, expect } from "@playwright/test";

test.describe("Pricing & Free Trial", () => {
  test("pricing tiers displayed", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href*="pricing"], button:has-text("Pricing")').first().click();
    await expect(page.locator("text=Starter")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Pro")).toBeVisible();
    await expect(page.locator("text=Unlimited")).toBeVisible();
  });

  test("pricing card shows correct prices", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("text=$39")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=$99")).toBeVisible();
    await expect(page.locator("text=$249")).toBeVisible();
  });

  test("30-day money-back guarantee visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=30-day").or(page.locator("text=money-back"))).toBeVisible({ timeout: 5000 });
  });

  test("free trial tracking in localStorage", async ({ page }) => {
    await page.goto("/");
    const trial = await page.evaluate(() => localStorage.getItem("axelai_trial"));
    if (trial) {
      const parsed = JSON.parse(trial);
      expect(parsed).toHaveProperty("startedAt");
      expect(parsed).toHaveProperty("usage");
    }
  });

  test("credit purchase options visible on pricing page", async ({ page }) => {
    await page.goto("/pricing");
    // Credit packs should be shown
    await expect(page.locator("text=Credits").or(page.locator("text=credit"))).toBeVisible({ timeout: 5000 });
  });
});
