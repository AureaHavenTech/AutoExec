// /api/shopify — Proxy all Shopify Admin API operations
// Supports ?action=<name> to route to the right client function
import { NextRequest, NextResponse } from "next/server";
import {
  testConnection,
  getOrders,
  getProducts,
  getCustomers,
  createDiscount,
  getAnalytics,
} from "@/lib/shopify-client";
import { setServiceStatus } from "@/lib/actions";
import type { ShopifyConfig } from "@/lib/shopify-client";

function getConfigFromRequest(request: NextRequest): ShopifyConfig | undefined {
  const storeUrl = request.headers.get("x-shopify-store-url") || process.env.SHOPIFY_STORE_URL || "";
  const adminToken = request.headers.get("x-shopify-admin-token") || process.env.SHOPIFY_ADMIN_TOKEN || "";
  if (!storeUrl || !adminToken) return undefined;
  return { storeUrl, adminToken };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "test";

    const config = getConfigFromRequest(request);
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: "Shopify not configured. Set SHOPIFY_STORE_URL and SHOPIFY_ADMIN_TOKEN env vars, or pass x-shopify-store-url and x-shopify-admin-token headers.",
          action: "configure",
        },
        { status: 401 }
      );
    }

    switch (action) {
      case "test": {
        const result = await testConnection(config);
        if (result.connected) {
          setServiceStatus("shopify", "connected");
        }
        return NextResponse.json({ success: true, ...result });
      }

      case "orders": {
        const status = searchParams.get("status") as any || "any";
        const limit = parseInt(searchParams.get("limit") || "50");
        const since = searchParams.get("since") || undefined;
        const financialStatus = searchParams.get("financialStatus") || undefined;
        const result = await getOrders(config, { status, limit, since, financialStatus });
        return NextResponse.json({ success: true, ...result });
      }

      case "products": {
        const status = searchParams.get("status") || "active";
        const limit = parseInt(searchParams.get("limit") || "50");
        const vendor = searchParams.get("vendor") || undefined;
        const collectionId = searchParams.get("collectionId") || undefined;
        const result = await getProducts(config, { status, limit, vendor, collectionId });
        return NextResponse.json({ success: true, ...result });
      }

      case "customers": {
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = searchParams.get("search") || undefined;
        const result = await getCustomers(config, { limit, search });
        return NextResponse.json({ success: true, ...result });
      }

      case "analytics": {
        const result = await getAnalytics(config);
        return NextResponse.json({ success: true, ...result });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}. Valid: test, orders, products, customers, analytics` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    setServiceStatus("shopify", "error");
    return NextResponse.json(
      { success: false, error: error.message || "Shopify API request failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const config = getConfigFromRequest(request);
    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: "Shopify not configured.",
          action: "configure",
        },
        { status: 401 }
      );
    }

    if (action === "discount" || action === "create_discount") {
      const result = await createDiscount(config, params);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: `Unknown POST action: ${action}. Valid: discount` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
