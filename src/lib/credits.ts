/**
 * Credit System — Post-Trial Monetization Layer
 *
 * One-time credit purchasing for premium features after trial ends.
 * Pure additive layer — does not modify any existing code.
 * Stores balances in localStorage.
 */

export type CreditType = "premiumConversations" | "additionalAutomations" | "advancedActions";

interface CreditBalance {
  premiumConversations: number;
  additionalAutomations: number;
  advancedActions: number;
}

interface CreditPack {
  id: CreditType;
  label: string;
  description: string;
  amount: number;
  price: number;
  icon: string;
}

const STORAGE_KEY = "axel_ai_credits";

const DEFAULT_BALANCE: CreditBalance = {
  premiumConversations: 0,
  additionalAutomations: 0,
  advancedActions: 0,
};

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "premiumConversations",
    label: "Premium Conversations",
    description: "50 additional AI conversations with priority processing",
    amount: 50,
    price: 10,
    icon: "💬",
  },
  {
    id: "additionalAutomations",
    label: "Additional Automations",
    description: "20 additional workflow automations",
    amount: 20,
    price: 15,
    icon: "⚡",
  },
  {
    id: "advancedActions",
    label: "Advanced Actions",
    description: "10 advanced actions (research, email, build)",
    amount: 10,
    price: 25,
    icon: "🚀",
  },
];

// Bundle deals
export const CREDIT_BUNDLES: { label: string; packs: Record<CreditType, number>; price: number; discount: string }[] = [
  {
    label: "Starter Bundle",
    packs: { premiumConversations: 1, additionalAutomations: 0, advancedActions: 0 },
    price: 9,
    discount: "10% off",
  },
  {
    label: "Growth Bundle",
    packs: { premiumConversations: 2, additionalAutomations: 1, advancedActions: 0 },
    price: 29,
    discount: "17% off",
  },
  {
    label: "Power Bundle",
    packs: { premiumConversations: 3, additionalAutomations: 2, advancedActions: 1 },
    price: 59,
    discount: "21% off",
  },
];

function getBalance(): CreditBalance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BALANCE };
    return JSON.parse(raw);
  } catch {
    return { ...DEFAULT_BALANCE };
  }
}

function saveBalance(balance: CreditBalance): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(balance));
}

/**
 * Get current credit balance for all credit types.
 */
export function getCreditBalance(): CreditBalance {
  return getBalance();
}

/**
 * Check if user has credits for a specific feature.
 */
export function hasCreditsFor(type: CreditType): boolean {
  const balance = getBalance();
  return balance[type] > 0;
}

/**
 * Check if user has ANY credits remaining.
 */
export function hasAnyCredits(): boolean {
  const balance = getBalance();
  return Object.values(balance).some((count) => count > 0);
}

/**
 * Use one credit of a specific type. Returns true if successful.
 */
export function useCredit(type: CreditType): boolean {
  const balance = getBalance();
  if (balance[type] <= 0) return false;
  balance[type] -= 1;
  saveBalance(balance);
  return true;
}

/**
 * Purchase a credit pack and add to balance.
 */
export function purchaseCreditPack(packId: CreditType): { success: boolean; balance: CreditBalance; pack: CreditPack } {
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) throw new Error(`Unknown credit pack: ${packId}`);

  const balance = getBalance();
  balance[packId] += pack.amount;
  saveBalance(balance);

  return { success: true, balance: { ...balance }, pack };
}

/**
 * Purchase a bundle and add all pack amounts to balance.
 */
export function purchaseBundle(bundleIndex: number): { success: boolean; balance: CreditBalance } {
  const bundle = CREDIT_BUNDLES[bundleIndex];
  if (!bundle) throw new Error(`Unknown bundle: ${bundleIndex}`);

  const balance = getBalance();
  for (const [type, count] of Object.entries(bundle.packs)) {
    if (count > 0) {
      balance[type as CreditType] += CREDIT_PACKS.find((p) => p.id === type)!.amount * count;
    }
  }
  saveBalance(balance);

  return { success: true, balance: { ...balance } };
}

/**
 * Get total credit value in dollars (for display).
 */
export function getCreditValue(balance?: CreditBalance): number {
  const b = balance || getBalance();
  let total = 0;
  for (const pack of CREDIT_PACKS) {
    total += (b[pack.id] / pack.amount) * pack.price;
  }
  return Math.round(total * 100) / 100;
}

/**
 * Get a summary of credits by type for dashboard display.
 */
export function getCreditSummary() {
  const balance = getBalance();
  return CREDIT_PACKS.map((pack) => ({
    ...pack,
    owned: balance[pack.id],
    value: (balance[pack.id] / pack.amount) * pack.price,
  }));
}

/**
 * Reset all credits (admin use).
 */
export function resetCredits(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if user can continue based on trial status + credits.
 * After trial expires, users with credits can still use paid features.
 */
export function canAccessFeature(
  feature: "conversation" | "automation",
  trialCheck: { allowed: boolean; reason?: string }
): { allowed: boolean; reason?: string; source?: "trial" | "credits" | "paid" } {
  // If trial allows it, use trial
  if (trialCheck.allowed) return { allowed: true, source: "trial" };

  // Check if user has credits for this feature
  const creditType: Record<string, CreditType> = {
    conversation: "premiumConversations",
    automation: "additionalAutomations",
  };

  const ct = creditType[feature];
  if (ct && hasCreditsFor(ct)) {
    return { allowed: true, source: "credits" };
  }

  return { allowed: false, reason: trialCheck.reason || "No access" };
}