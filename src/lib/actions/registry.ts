// Action Registry — defines every action Axel AI can perform
// When a service module is connected, it registers its handler via registerHandler()
import type {
  ActionDefinition,
  ActionId,
  ActionCategory,
  ExecutionHandler,
  ServiceStatus,
} from "./types";

// ─── Action Catalog ─────────────────────────────────────────

const ACTION_CATALOG: Record<ActionId, ActionDefinition> = {
  // ── Email ────────────────────────────────
  email_draft: {
    id: "email_draft",
    category: "email",
    label: "Draft Email",
    description: "Compose a personalized email draft from a prompt or template",
    requiredPermissions: ["email:read"],
    params: [
      { name: "to", type: "string", required: false, description: "Recipient email address or name" },
      { name: "subject", type: "string", required: true, description: "Email subject line" },
      { name: "body", type: "string", required: true, description: "Email body content" },
      { name: "tone", type: "string", required: false, description: "Tone: professional, casual, friendly, formal", default: "professional" },
      { name: "template", type: "string", required: false, description: "Template name to use" },
    ],
  },
  email_send: {
    id: "email_send",
    category: "email",
    label: "Send Email",
    description: "Send an email via connected Gmail/Outlook account",
    requiredPermissions: ["email:send"],
    params: [
      { name: "to", type: "string", required: true, description: "Recipient email address" },
      { name: "subject", type: "string", required: true, description: "Email subject line" },
      { name: "body", type: "string", required: true, description: "Email body (plain text or HTML)" },
      { name: "cc", type: "array", required: false, description: "CC recipients" },
      { name: "bcc", type: "array", required: false, description: "BCC recipients" },
    ],
  },
  email_search: {
    id: "email_search",
    category: "email",
    label: "Search Emails",
    description: "Search connected email inbox for messages matching criteria",
    requiredPermissions: ["email:read"],
    params: [
      { name: "query", type: "string", required: true, description: "Search query (Gmail-style search syntax)" },
      { name: "maxResults", type: "number", required: false, description: "Maximum results to return", default: 10 },
      { name: "from", type: "string", required: false, description: "Filter by sender" },
      { name: "after", type: "string", required: false, description: "Only emails after this date (ISO format)" },
    ],
  },

  // ── Calendar ─────────────────────────────
  calendar_create_event: {
    id: "calendar_create_event",
    category: "calendar",
    label: "Create Calendar Event",
    description: "Create a new event in Google Calendar",
    requiredPermissions: ["calendar:write"],
    params: [
      { name: "title", type: "string", required: true, description: "Event title" },
      { name: "startTime", type: "string", required: true, description: "Start time (ISO 8601)" },
      { name: "endTime", type: "string", required: true, description: "End time (ISO 8601)" },
      { name: "description", type: "string", required: false, description: "Event description/notes" },
      { name: "attendees", type: "array", required: false, description: "List of attendee emails" },
      { name: "location", type: "string", required: false, description: "Event location or meeting link" },
    ],
  },
  calendar_read_events: {
    id: "calendar_read_events",
    category: "calendar",
    label: "Read Calendar Events",
    description: "Fetch upcoming events from Google Calendar",
    requiredPermissions: ["calendar:read"],
    params: [
      { name: "timeMin", type: "string", required: false, description: "Start of time range (ISO 8601)", default: "now" },
      { name: "timeMax", type: "string", required: false, description: "End of time range (ISO 8601)" },
      { name: "maxResults", type: "number", required: false, description: "Maximum results", default: 10 },
      { name: "query", type: "string", required: false, description: "Text search in event titles" },
    ],
  },

  // ── Shopify ──────────────────────────────
  shopify_get_orders: {
    id: "shopify_get_orders",
    category: "shopify",
    label: "Get Shopify Orders",
    description: "Fetch orders from connected Shopify store",
    requiredPermissions: ["shopify:read"],
    params: [
      { name: "status", type: "string", required: false, description: "Order status: any, open, closed, cancelled", default: "any" },
      { name: "limit", type: "number", required: false, description: "Max orders to return", default: 25 },
      { name: "since", type: "string", required: false, description: "Orders since date (ISO 8601)" },
      { name: "financialStatus", type: "string", required: false, description: "paid, pending, refunded, etc." },
    ],
  },
  shopify_get_products: {
    id: "shopify_get_products",
    category: "shopify",
    label: "Get Shopify Products",
    description: "Fetch products from connected Shopify store",
    requiredPermissions: ["shopify:read"],
    params: [
      { name: "limit", type: "number", required: false, description: "Max products to return", default: 25 },
      { name: "status", type: "string", required: false, description: "active, archived, draft", default: "active" },
      { name: "vendor", type: "string", required: false, description: "Filter by vendor name" },
      { name: "collectionId", type: "string", required: false, description: "Filter by collection ID" },
    ],
  },
  shopify_create_discount: {
    id: "shopify_create_discount",
    category: "shopify",
    label: "Create Shopify Discount",
    description: "Create a discount code in Shopify",
    requiredPermissions: ["shopify:write"],
    params: [
      { name: "code", type: "string", required: true, description: "Discount code (e.g. SAVE20)" },
      { name: "valueType", type: "string", required: true, description: "percentage, fixed_amount, or free_shipping" },
      { name: "value", type: "number", required: true, description: "Discount value (e.g., 20 for 20%)" },
      { name: "appliesTo", type: "string", required: false, description: "all_products, specific_collections, specific_products", default: "all_products" },
      { name: "startsAt", type: "string", required: false, description: "Start date (ISO 8601)" },
      { name: "endsAt", type: "string", required: false, description: "End date (ISO 8601)" },
    ],
  },

  // ── Web ──────────────────────────────────
  web_search: {
    id: "web_search",
    category: "web",
    label: "Web Search",
    description: "Search the web for information, leads, or competitors",
    requiredPermissions: ["web:search"],
    params: [
      { name: "query", type: "string", required: true, description: "Search query" },
      { name: "maxResults", type: "number", required: false, description: "Maximum results", default: 10 },
      { name: "source", type: "string", required: false, description: "Search engine: duckduckgo, google", default: "duckduckgo" },
    ],
  },
  web_scrape: {
    id: "web_scrape",
    category: "web",
    label: "Web Scrape",
    description: "Visit a URL and extract structured data",
    requiredPermissions: ["web:scrape"],
    params: [
      { name: "url", type: "string", required: true, description: "URL to scrape" },
      { name: "selector", type: "string", required: false, description: "CSS selector for targeted extraction" },
      { name: "extract", type: "string", required: false, description: "What to extract: text, links, emails, prices, all", default: "text" },
    ],
  },

  // ── Reports ──────────────────────────────
  create_report: {
    id: "create_report",
    category: "report",
    label: "Create Report",
    description: "Generate a business report from data (sales, marketing, outreach)",
    requiredPermissions: ["report:generate"],
    params: [
      { name: "type", type: "string", required: true, description: "Report type: sales, marketing, outreach, summary" },
      { name: "timeRange", type: "string", required: false, description: "Time range: today, week, month, quarter, year", default: "month" },
      { name: "format", type: "string", required: false, description: "Output format: text, pdf, csv", default: "text" },
      { name: "includeCharts", type: "boolean", required: false, description: "Include chart data", default: false },
    ],
  },
  generate_invoice: {
    id: "generate_invoice",
    category: "report",
    label: "Generate Invoice",
    description: "Generate a PDF invoice from order data",
    requiredPermissions: ["invoice:generate"],
    params: [
      { name: "customer", type: "string", required: true, description: "Customer name or ID" },
      { name: "items", type: "array", required: true, description: "Line items with description, quantity, and price" },
      { name: "dueDate", type: "string", required: false, description: "Invoice due date (ISO 8601)" },
      { name: "notes", type: "string", required: false, description: "Additional notes on the invoice" },
    ],
  },

  // ── Cross-App ────────────────────────────
  one_post_ai_create_content: {
    id: "one_post_ai_create_content",
    category: "content",
    label: "Create Content (OnePost AI)",
    description: "Send a content creation request to OnePost AI",
    requiredPermissions: ["onepost:create"],
    params: [
      { name: "brandName", type: "string", required: true, description: "Brand name for content" },
      { name: "prompt", type: "string", required: true, description: "Content brief or idea" },
      { name: "platforms", type: "array", required: true, description: "Target platforms: tiktok, instagram, youtube, facebook, linkedin" },
      { name: "tone", type: "string", required: false, description: "Content tone", default: "professional" },
      { name: "captionStyle", type: "string", required: false, description: "Caption style: short, long, storytelling, professional, funny, sales, educational", default: "short" },
    ],
  },

  // ── System ───────────────────────────────
  noop: {
    id: "noop",
    category: "system",
    label: "No Action",
    description: "Fallback when no specific action is detected — AI responds conversationally",
    requiredPermissions: [],
    params: [],
  },
};

// ─── Runtime State ──────────────────────────────────────────

const handlerRegistry = new Map<ActionId, ExecutionHandler>();
const serviceStatuses = new Map<string, ServiceStatus>();

// ─── Public API ─────────────────────────────────────────────

/** Get all action definitions */
export function getAllActions(): ActionDefinition[] {
  return Object.values(ACTION_CATALOG);
}

/** Get a single action definition */
export function getActionDefinition(id: ActionId): ActionDefinition | undefined {
  return ACTION_CATALOG[id];
}

/** Get actions by category */
export function getActionsByCategory(category: ActionCategory): ActionDefinition[] {
  return Object.values(ACTION_CATALOG).filter((a) => a.category === category);
}

/** Register an execution handler for an action */
export function registerHandler(actionId: ActionId, handler: ExecutionHandler): void {
  handlerRegistry.set(actionId, handler);
}

/** Get the registered handler for an action */
export function getHandler(actionId: ActionId): ExecutionHandler | undefined {
  return handlerRegistry.get(actionId);
}

/** Check if an action has a registered handler (i.e., service is connected) */
export function isActionAvailable(actionId: ActionId): boolean {
  return handlerRegistry.has(actionId);
}

/** Set service connection status */
export function setServiceStatus(service: string, status: ServiceStatus): void {
  serviceStatuses.set(service, status);
}

/** Get service connection status */
export function getServiceStatus(service: string): ServiceStatus {
  return serviceStatuses.get(service) || "disconnected";
}

/** Get all service statuses */
export function getAllServiceStatuses(): Record<string, ServiceStatus> {
  const result: Record<string, ServiceStatus> = {};
  serviceStatuses.forEach((v, k) => (result[k] = v));
  return result;
}

/** Get the list of actions that have handlers registered */
export function getAvailableActions(): ActionDefinition[] {
  return Object.values(ACTION_CATALOG).filter((a) => handlerRegistry.has(a.id));
}

/** Get the list of actions waiting for service connection */
export function getUnavailableActions(): ActionDefinition[] {
  return Object.values(ACTION_CATALOG).filter(
    (a) => a.id !== "noop" && !handlerRegistry.has(a.id)
  );
}
