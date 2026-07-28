// Action framework type definitions for Axel AI
// Maps natural language intent → structured action → queued execution

// ─── Permissions ───────────────────────────────────────────

export type PermissionScope =
  | "email:read"
  | "email:send"
  | "calendar:read"
  | "calendar:write"
  | "shopify:read"
  | "shopify:write"
  | "web:search"
  | "web:scrape"
  | "report:generate"
  | "invoice:generate"
  | "onepost:create";

export interface UserPermissions {
  userId: string;
  granted: PermissionScope[];
  revoked: PermissionScope[];
}

// ─── Action Definitions ────────────────────────────────────

export type ActionId =
  | "email_draft"
  | "email_send"
  | "email_search"
  | "calendar_create_event"
  | "calendar_read_events"
  | "shopify_get_orders"
  | "shopify_get_products"
  | "shopify_create_discount"
  | "web_search"
  | "web_scrape"
  | "create_report"
  | "generate_invoice"
  | "one_post_ai_create_content"
  | "noop"; // fallback when no action is detected

export type ActionCategory = "email" | "calendar" | "shopify" | "web" | "report" | "content" | "system";

export interface ActionParam {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  description: string;
  default?: unknown;
}

export interface ActionDefinition {
  id: ActionId;
  category: ActionCategory;
  label: string;
  description: string;
  requiredPermissions: PermissionScope[];
  params: ActionParam[];
  // handler is registered separately at runtime
}

// ─── Parsed Intent ─────────────────────────────────────────

export interface ParsedIntent {
  actionId: ActionId;
  confidence: number; // 0–1
  params: Record<string, unknown>;
  rawInput: string;
  reasoning: string;
  alternativeActions?: { actionId: ActionId; confidence: number }[];
}

// ─── Action Queue ───────────────────────────────────────────

export type QueueStatus = "queued" | "executing" | "completed" | "failed" | "cancelled";

export interface QueueItem {
  id: string;
  actionId: ActionId;
  userId: string;
  params: Record<string, unknown>;
  status: QueueStatus;
  intent: ParsedIntent;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: QueueResult;
  steps: QueueStep[];
  error?: string;
}

export interface QueueStep {
  timestamp: string;
  message: string;
  type: "info" | "progress" | "warning" | "error" | "success";
  data?: Record<string, unknown>;
}

export interface QueueResult {
  success: boolean;
  output: unknown;
  summary: string;
  artifacts?: { name: string; url?: string; type: string }[];
}

// ─── Intent Parser Config ───────────────────────────────────

export interface IntentPattern {
  actionId: ActionId;
  patterns: RegExp[];
  extractParams: (match: RegExpExecArray, input: string) => Partial<Record<string, unknown>>;
  confidence: number;
  examples: string[];
}

// ─── Execution Handler ──────────────────────────────────────

export type ExecutionHandler = (
  params: Record<string, unknown>,
  userId: string,
  onStep: (step: QueueStep) => void
) => Promise<QueueResult>;

export type ServiceStatus = "connected" | "disconnected" | "error" | "configuring";
