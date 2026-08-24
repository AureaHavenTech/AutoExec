// Store Policies Hook — in-memory SQLite-backed policy storage
// Follows the existing db.ts in-memory pattern used by the app
// Allows the AI to reference store policies (returns, shipping, contact, etc.)

interface StorePolicy {
  key: string;
  label: string;
  value: string;
  updated_at: string;
}

const DEFAULT_POLICIES: StorePolicy[] = [
  {
    key: "refund_policy",
    label: "Refund & Returns Policy",
    value: "No store policies configured yet.",
    updated_at: new Date().toISOString(),
  },
  {
    key: "shipping_policy",
    label: "Shipping Policy",
    value: "No store policies configured yet.",
    updated_at: new Date().toISOString(),
  },
  {
    key: "support_policy",
    label: "Customer Support Policy",
    value: "No store policies configured yet.",
    updated_at: new Date().toISOString(),
  },
  {
    key: "general_policy",
    label: "General Store Policy",
    value: "No store policies configured yet.",
    updated_at: new Date().toISOString(),
  },
];

const store = {
  policies: [...DEFAULT_POLICIES],
};

let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;
}

/** Get a single policy by key, or all policies */
export function getStorePolicy(key?: string): StorePolicy | StorePolicy[] | null {
  init();
  if (key) {
    return store.policies.find((p) => p.key === key) || null;
  }
  return [...store.policies];
}

/** Set/update a policy value by key */
export function setStorePolicy(key: string, value: string): StorePolicy {
  init();
  const existing = store.policies.find((p) => p.key === key);
  if (existing) {
    existing.value = value;
    existing.updated_at = new Date().toISOString();
    return existing;
  }
  const newPolicy: StorePolicy = {
    key,
    label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    updated_at: new Date().toISOString(),
  };
  store.policies.push(newPolicy);
  return newPolicy;
}

/**
 * Builds the store-policies text block for injection into the system prompt.
 * When empty or all defaults: returns an honest default message.
 * When policies are configured: returns a formatted block.
 */
export function buildStorePoliciesTextBlock(): string {
  init();
  const configured = store.policies.filter(
    (p) => p.value !== "No store policies configured yet."
  );

  if (configured.length === 0) {
    return "No store policies configured yet.";
  }

  const lines = configured.map((p) => `- **${p.label}**: ${p.value}`);
  return `Current Store Policies:\n${lines.join("\n")}`;
}

/** Get just the refund policy text for guardrail checks */
export function getRefundPolicyText(): string {
  init();
  const policy = store.policies.find((p) => p.key === "refund_policy");
  return policy?.value || "No store policies configured yet.";
}

/** Check if refunds are allowed by store policy */
export function refundsAllowedByPolicy(): boolean {
  const text = getRefundPolicyText().toLowerCase();
  const blocking = ["no refunds", "all sales final", "no returns", "final sale"];
  return !blocking.some((phrase) => text.includes(phrase));
}