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
  getOrderDetailsByEmail,
  refundOrder,
} from "@/lib/shopify-client";
import { getRefundPolicyText, refundsAllowedByPolicy } from "@/lib/store-policies";

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

  // ── shopify_get_order_details ───────────
  registerHandler("shopify_get_order_details", async (params, _userId, onStep) => {
    onStep({
      timestamp: new Date().toISOString(),
      message: "Looking up your order...",
      type: "progress",
    });
    const email = params.email as string;
    const orderId = params.orderId ? (Number(params.orderId) || undefined) : undefined;

    if (!email) {
      return {
        success: false,
        output: null,
        summary: "Please provide the customer email address to look up orders.",
      };
    }

    const result = await getOrderDetailsByEmail(config, email, orderId);

    if (!result.success) {
      onStep({
        timestamp: new Date().toISOString(),
        message: result.error || "Order lookup failed",
        type: "error",
      });
      return { success: false, output: null, summary: result.error || "Could not find matching order." };
    }

    const o = result.order!;
    onStep({
      timestamp: new Date().toISOString(),
      message: `Found order #${o.name}`,
      type: "success",
      data: {
        orderId: o.id,
        total: o.total_price,
        status: o.financial_status,
      },
    });

    return {
      success: true,
      output: o,
      summary:
        `Order #${o.name} for ${o.customer_name} (${o.email}): ` +
        `${o.currency} ${o.total_price} — Status: ${o.financial_status}` +
        (o.fulfillment_status ? `, Fulfillment: ${o.fulfillment_status}` : "") +
        (o.tracking_number ? `, Tracking: ${o.tracking_number}` : ""),
      artifacts: [{ name: "order-details.json", type: "application/json" }],
    };
  });

  // ── shopify_refund_order ─────────────────
  registerHandler("shopify_refund_order", async (params, _userId, onStep) => {
    onStep({
      timestamp: new Date().toISOString(),
      message: "Checking refund eligibility...",
      type: "progress",
    });

    // CRITICAL GUARDRAIL: Check store policies before processing
    const policyText = getRefundPolicyText();
    const allowed = refundsAllowedByPolicy();

    if (!allowed) {
      return {
        success: false,
        output: null,
        summary: `Refund denied by store policy: "${policyText}". Refunds are not permitted under the current store policies.`,
      };
    }

    const orderId = Number(params.orderId);
    const amount = params.amount ? Number(params.amount) : undefined;
    const note = (params.note as string) || undefined;

    if (!orderId || orderId <= 0) {
      return {
        success: false,
        output: null,
        summary: "Refund requires a valid order ID from a verified order lookup.",
      };
    }

    onStep({
      timestamp: new Date().toISOString(),
      message: `Processing refund for order #${orderId}...`,
      type: "progress",
    });

    const result = await refundOrder(config, orderId, amount, note);

    if (!result.success) {
      onStep({
        timestamp: new Date().toISOString(),
        message: result.error || "Refund failed",
        type: "error",
      });
      return { success: false, output: null, summary: result.error || "Refund could not be processed." };
    }

    onStep({
      timestamp: new Date().toISOString(),
      message: `Refund processed successfully (ID: ${result.refundId})`,
      type: "success",
    });

    const summary = amount
      ? `Refund of ${amount} processed for order #${orderId} (refund ID: ${result.refundId}).`
      : `Full refund processed for order #${orderId} (refund ID: ${result.refundId}).`;

    return {
      success: true,
      output: result,
      summary,
      artifacts: [{ name: "refund.json", type: "application/json" }],
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
