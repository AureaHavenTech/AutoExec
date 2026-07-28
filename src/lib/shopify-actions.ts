// Registers Shopify action handlers with the action execution framework
// Import this module in the app to wire Shopify into the action system
import { registerHandler } from "@/lib/actions";
import type { QueueStep, QueueResult } from "@/lib/actions";
import {
  testConnection,
  getOrders,
  getProducts,
  getCustomers,
  createDiscount,
  getAnalytics,
} from "@/lib/shopify-client";

let shopifyInitialized = false;

export function initShopifyActions(config?: { storeUrl?: string; adminToken?: string }) {
  if (shopifyInitialized) return;
  shopifyInitialized = true;

  // ── shopify_get_orders ──────────────────
  registerHandler("shopify_get_orders", async (params, _userId, onStep) => {
    onStep({ timestamp: new Date().toISOString(), message: "Fetching Shopify orders...", type: "progress" });
    const { orders, count } = await getOrders(config, {
      status: (params.status as any) || "any",
      limit: (params.limit as number) || 25,
      since: params.since as string | undefined,
      financialStatus: params.financialStatus as string | undefined,
    });
    onStep({
      timestamp: new Date().toISOString(),
      message: `Found ${count} orders`,
      type: "success",
      data: { count },
    });
    return {
      success: true,
      output: orders,
      summary: `Retrieved ${count} Shopify orders${params.status && params.status !== "any" ? ` (status: ${params.status})` : ""}.`,
      artifacts: [{ name: "orders.json", type: "application/json" }],
    };
  });

  // ── shopify_get_products ────────────────
  registerHandler("shopify_get_products", async (params, _userId, onStep) => {
    onStep({ timestamp: new Date().toISOString(), message: "Fetching Shopify products...", type: "progress" });
    const { products, count } = await getProducts(config, {
      status: (params.status as string) || "active",
      limit: (params.limit as number) || 25,
      vendor: params.vendor as string | undefined,
      collectionId: params.collectionId as string | undefined,
    });
    onStep({
      timestamp: new Date().toISOString(),
      message: `Found ${count} products`,
      type: "success",
      data: { count },
    });
    return {
      success: true,
      output: products,
      summary: `Retrieved ${count} Shopify products.`,
      artifacts: [{ name: "products.json", type: "application/json" }],
    };
  });

  // ── shopify_create_discount ─────────────
  registerHandler("shopify_create_discount", async (params, _userId, onStep) => {
    onStep({ timestamp: new Date().toISOString(), message: "Creating discount code in Shopify...", type: "progress" });
    const result = await createDiscount(config, {
      code: params.code as string,
      valueType: (params.valueType as any) || "percentage",
      value: params.value as number,
      startsAt: params.startsAt as string | undefined,
      endsAt: params.endsAt as string | undefined,
    });
    if (!result.success) {
      onStep({ timestamp: new Date().toISOString(), message: `Failed: ${result.error}`, type: "error" });
      return { success: false, output: null, summary: `Failed to create discount: ${result.error}` };
    }
    onStep({
      timestamp: new Date().toISOString(),
      message: `Discount code ${result.discountCode} created`,
      type: "success",
    });
    return {
      success: true,
      output: result,
      summary: `Discount code "${result.discountCode}" created in Shopify (price rule #${result.priceRuleId}).`,
      artifacts: [{ name: "discount.json", type: "application/json" }],
    };
  });
}

// Auto-initialize on import if env vars are present
if (process.env.SHOPIFY_STORE_URL && process.env.SHOPIFY_ADMIN_TOKEN) {
  initShopifyActions({
    storeUrl: process.env.SHOPIFY_STORE_URL,
    adminToken: process.env.SHOPIFY_ADMIN_TOKEN,
  });
}
