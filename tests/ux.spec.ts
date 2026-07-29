import { test, expect } from "@playwright/test";

test.describe("UX — Theme, Keyboard, Search", () => {
  test("dark theme is applied by default", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    const classAttr = await html.getAttribute("class");
    expect(classAttr).toContain("dark");
  });

  test("page is keyboard navigable — Tab through links", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });

  test("skip-to-content link is available", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator('a[href="#main-content"]');
    const count = await skipLink.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test.describe("Chat keyboard shortcuts (desktop)", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
      await page.locator("input").first().fill("AUREA2026");
      await page.locator('button[type="submit"], button:has-text("Access"), button:has-text("Login")').first().click();
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
    });

    test("Escape does not crash the page", async ({ page }) => {
      await page.keyboard.press("Escape");
      await expect(page.locator("body")).toBeVisible();
    });

    test("Shift+Enter inserts newline in chat", async ({ page }) => {
      const chatInput = page.locator("textarea, [contenteditable]").first();
      if (await chatInput.isVisible()) {
        await chatInput.fill("Line 1");
        await page.keyboard.press("Shift+Enter");
        await chatInput.pressSequentially("Line 2");
        const value = await chatInput.inputValue();
        expect(value).toContain("\n");
      }
    });
  });

  test("mobile viewport renders without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});
