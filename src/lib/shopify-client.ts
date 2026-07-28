// Shopify Admin API client for Axel AI
// Uses REST Admin API with private app token (MVP approach)
// Store URL + admin token stored in env vars or per-user settings

const SHOPIFY_API_VERSION = "2024-04";

export interface ShopifyConfig {
  storeUrl: string;
  adminToken: string;
}

export interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  total_price: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  created_at: string;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  line_items: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  status: string;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    inventory_quantity: number;
  }>;
  images: Array<{ src: string }>;
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  total_spent: string;
  state: string;
  created_at: string;
}

export interface ShopifyAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  recentOrders: ShopifyOrder[];
}

// ─── Helpers ────────────────────────────────────────────────

function getConfig(config?: Partial<ShopifyConfig>): ShopifyConfig {
  const storeUrl = config?.storeUrl || process.env.SHOPIFY_STORE_URL || "";
  const adminToken = config?.adminToken || process.env.SHOPIFY_ADMIN_TOKEN || "";
  return { storeUrl, adminToken };
}

function getBaseUrl(config: ShopifyConfig): string {
  let url = config.storeUrl.replace(/\/+$/, "");
  if (!url.startsWith("http")) url = `https://${url}`;
  if (!url.includes("myshopify.com") && !url.includes("shopify.com")) {
    url = `${url}.myshopify.com`;
  }
  return `${url}/admin/api/${SHOPIFY_API_VERSION}`;
}

async function shopifyFetch(
  path: string,
  config: ShopifyConfig,
  method = "GET",
  body?: unknown
): Promise<any> {
  const baseUrl = getBaseUrl(config);
  const url = `${baseUrl}/${path.replace(/^\//, "")}`;

  const headers: Record<string, string> = {
    "X-Shopify-Access-Token": config.adminToken,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const options: RequestInit = { method, headers };
  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Shopify API error (${response.status}): ${data.errors || JSON.stringify(data)}`
    );
  }

  return data;
}

// ─── Public API ─────────────────────────────────────────────

/** Test connection to Shopify store */
export async function testConnection(config?: Partial<ShopifyConfig>): Promise<{
  connected: boolean;
  storeName?: string;
  error?: string;
}> {
  try {
    const cfg = getConfig(config);
    if (!cfg.storeUrl || !cfg.adminToken) {
      return { connected: false, error: "Shopify store URL and admin token are required" };
    }
    const data = await shopifyFetch("shop.json", cfg);
    return { connected: true, storeName: data.shop?.name };
  } catch (error: any) {
    return { connected: false, error: error.message };
  }
}

/** Fetch orders with optional filters */
export async function getOrders(
  config?: Partial<ShopifyConfig>,
  filter?: {
    status?: "any" | "open" | "closed" | "cancelled";
    financialStatus?: string;
    limit?: number;
    since?: string;
  }
): Promise<{ orders: ShopifyOrder[]; count: number }> {
  const cfg = getConfig(config);
  const params = new URLSearchParams();
  params.set("status", filter?.status || "any");
  if (filter?.financialStatus) params.set("financial_status", filter.financialStatus);
  params.set("limit", String(filter?.limit || 50));
  if (filter?.since) params.set("created_at_min", filter.since);

  const data = await shopifyFetch(`orders.json?${params}`, cfg);
  return {
    orders: (data.orders || []).map((o: any) => ({
      id: o.id,
      name: o.name,
      email: o.email || o.customer?.email,
      total_price: o.total_price,
      currency: o.currency,
      financial_status: o.financial_status,
      fulfillment_status: o.fulfillment_status,
      created_at: o.created_at,
      customer: o.customer,
      line_items: (o.line_items || []).map((li: any) => ({
        title: li.title,
        quantity: li.quantity,
        price: li.price,
      })),
    })),
    count: data.orders?.length || 0,
  };
}

/** Fetch products with optional filters */
export async function getProducts(
  config?: Partial<ShopifyConfig>,
  filter?: {
    status?: string;
    limit?: number;
    vendor?: string;
    collectionId?: string;
  }
): Promise<{ products: ShopifyProduct[]; count: number }> {
  const cfg = getConfig(config);
  const params = new URLSearchParams();
  params.set("status", filter?.status || "active");
  params.set("limit", String(filter?.limit || 50));
  if (filter?.vendor) params.set("vendor", filter.vendor);
  if (filter?.collectionId) params.set("collection_id", filter.collectionId);

  const data = await shopifyFetch(`products.json?${params}`, cfg);
  return {
    products: (data.products || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      body_html: p.body_html,
      vendor: p.vendor,
      product_type: p.product_type,
      status: p.status,
      variants: (p.variants || []).map((v: any) => ({
        id: v.id,
        title: v.title,
        price: v.price,
        inventory_quantity: v.inventory_quantity || 0,
      })),
      images: (p.images || []).map((img: any) => ({ src: img.src })),
    })),
    count: data.products?.length || 0,
  };
}

/** Fetch customers with optional filters */
export async function getCustomers(
  config?: Partial<ShopifyConfig>,
  filter?: { limit?: number; search?: string }
): Promise<{ customers: ShopifyCustomer[]; count: number }> {
  const cfg = getConfig(config);
  const params = new URLSearchParams();
  params.set("limit", String(filter?.limit || 50));
  if (filter?.search) params.set("search", filter.search);

  const data = await shopifyFetch(`customers.json?${params}`, cfg);
  return {
    customers: (data.customers || []).map((c: any) => ({
      id: c.id,
      email: c.email,
      first_name: c.first_name,
      last_name: c.last_name,
      orders_count: c.orders_count,
      total_spent: c.total_spent,
      state: c.state,
      created_at: c.created_at,
    })),
    count: data.customers?.length || 0,
  };
}

/** Create a discount code (price rule + discount code) */
export async function createDiscount(
  config: Partial<ShopifyConfig> | undefined,
  params: {
    code: string;
    valueType?: "percentage" | "fixed_amount" | "free_shipping";
    value: number;
    appliesTo?: string;
    startsAt?: string;
    endsAt?: string;
  }
): Promise<{
  success: boolean;
  priceRuleId?: number;
  discountCode?: string;
  error?: string;
}> {
  try {
    const cfg = getConfig(config);
    const { code, valueType = "percentage", value, startsAt, endsAt } = params;

    // Step 1: Create price rule
    const ruleBody: any = {
      price_rule: {
        title: `Axel AI: ${code}`,
        target_type: "line_item",
        target_selection: "all",
        allocation_method: "across",
        value_type: valueType,
        value: valueType === "percentage" ? -value : -value,
        customer_selection: "all",
        starts_at: startsAt || new Date().toISOString(),
      },
    };

    if (endsAt) {
      ruleBody.price_rule.ends_at = endsAt;
    }

    if (valueType === "free_shipping") {
      ruleBody.price_rule.value = -100;
      ruleBody.price_rule.value_type = "percentage";
    }

    const ruleData = await shopifyFetch("price_rules.json", cfg, "POST", ruleBody);

    // Step 2: Create discount code under the price rule
    const codeData = await shopifyFetch(
      `price_rules/${ruleData.price_rule.id}/discount_codes.json`,
      cfg,
      "POST",
      { discount_code: { code } }
    );

    return {
      success: true,
      priceRuleId: ruleData.price_rule.id,
      discountCode: codeData.discount_code?.code || code,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Get basic analytics summary */
export async function getAnalytics(
  config?: Partial<ShopifyConfig>
): Promise<ShopifyAnalytics> {
  const cfg = getConfig(config);

  // Fetch recent orders
  const { orders } = await getOrders(cfg, { status: "any", limit: 250 });

  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const ordersByStatus: Record<string, number> = {};
  for (const o of orders) {
    const status = o.financial_status || "unknown";
    ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
  }

  return {
    totalOrders: orders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    ordersByStatus,
    recentOrders: orders.slice(0, 10),
  };
}
