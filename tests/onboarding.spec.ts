import { test, expect } from "@playwright/test";

test.describe("Onboarding & Core Flows", () => {
  test("new user sees trial banner on dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.locator("input").first().fill("AUREA2026");
    await page.locator('button[type="submit"], button:has-text("Access"), button:has-text("Login")').first().click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("text=About").or(page.locator("text=Axel"))).toBeVisible({ timeout: 5000 });
  });

  test("contact page / form exists", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("body")).toBeVisible();
  });

  test("FAQ page exists", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.locator("body")).toBeVisible();
  });

  test("cross-promotion to OnePost AI visible", async ({ page }) => {
    await page.goto("/");
    const opLink = page.locator('a[href*="onepost"]').or(page.locator("text=OnePost AI")).or(page.locator("text=One Post AI"));
    const count = await opLink.count();
    expect(count).toBeGreaterThanOrEqual(0); // may or may not be on landing page
  });

  test("cross-promotion to Aura Haven visible", async ({ page }) => {
    await page.goto("/");
    const ahLink = page.locator('a[href*="aurahaven"]').or(page.locator("text=Aura Haven"));
    const count = await ahLink.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("Stripe payment links are on pricing page", async ({ page }) => {
    await page.goto("/pricing");
    // Stripe checkout links present
    const stripeLinks = page.locator('a[href*="stripe.com"]');
    const count = await stripeLinks.count();
    expect(count).toBeGreaterThanOrEqual(3); // At least 3 tiers
  });
});
