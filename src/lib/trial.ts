/**
 * Trial Usage Tracking — 3-Day Free Trial Layer
 *
 * Tracks trial start date and usage counters in localStorage.
 * Pure additive layer — does not modify any existing code paths.
 */

export type TrialFeature = "conversation" | "automation" | "calendar" | "email";

interface TrialState {
  startedAt: string; // ISO date
  usage: Record<TrialFeature, number>;
}

const STORAGE_KEY = "axel_ai_trial";
const TRIAL_DAYS = 3;
const LIMITS: Record<TrialFeature, number> = {
  conversation: 25,
  automation: 10,
  calendar: Infinity,  // Always available
  email: Infinity,     // Always available
};

function getTrial(): TrialState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveTrial(state: TrialState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Start a new trial (called on first signup/login for new users).
 * If trial already exists, no-op.
 */
export function startTrial(): TrialState {
  const existing = getTrial();
  if (existing) return existing;

  const state: TrialState = {
    startedAt: new Date().toISOString(),
    usage: { conversation: 0, automation: 0, calendar: 0, email: 0 },
  };
  saveTrial(state);
  return state;
}

/**
 * Check if the trial has expired (past 3 days).
 */
export function isTrialExpired(): boolean {
  const trial = getTrial();
  if (!trial) return false; // No trial data = not in trial

  const start = new Date(trial.startedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= TRIAL_DAYS;
}

/**
 * Get seconds remaining in the trial period.
 */
export function getTrialSecondsRemaining(): number {
  const trial = getTrial();
  if (!trial) return 0;
  const start = new Date(trial.startedAt);
  const end = new Date(start.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}

/**
 * Format trial time remaining as a human-readable string.
 */
export function getTrialTimeRemaining(): string {
  const seconds = getTrialSecondsRemaining();
  if (seconds <= 0) return "Expired";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

/**
 * Check if a feature can be used (not expired + under limit).
 * calendar and email are always allowed during trial.
 */
export function canUseFeature(feature: TrialFeature): { allowed: boolean; reason?: string } {
  // Calendar and email always allowed during trial
  if (feature === "calendar" || feature === "email") {
    return { allowed: true };
  }

  const trial = getTrial();
  if (!trial) return { allowed: true }; // Not in trial = paid user

  if (isTrialExpired()) {
    return {
      allowed: false,
      reason: "Your 3-day free trial has ended. Upgrade to continue using this feature.",
    };
  }

  const limit = LIMITS[feature];
  const used = trial.usage[feature] || 0;
  if (used >= limit) {
    return {
      allowed: false,
      reason: `You've used all ${limit} free ${feature}s in your trial. Upgrade for unlimited access.`,
    };
  }

  return { allowed: true };
}

/**
 * Increment usage counter for a feature.
 * Silently no-ops if not in trial or if limit is Infinity.
 */
export function incrementUsage(feature: TrialFeature): void {
  if (feature === "calendar" || feature === "email") return; // no tracking needed
  if (LIMITS[feature] === Infinity) return;

  const trial = getTrial();
  if (!trial) return;

  trial.usage[feature] = (trial.usage[feature] || 0) + 1;
  saveTrial(trial);
}

/**
 * Get current usage counts for all features.
 */
export function getUsage(): Record<TrialFeature, number> {
  const trial = getTrial();
  if (!trial) return { conversation: 0, automation: 0, calendar: 0, email: 0 };
  return trial.usage;
}

/**
 * Get trial status summary for UI display.
 */
export function getTrialStatus() {
  const trial = getTrial();
  if (!trial) return { isTrialing: false, isExpired: false, daysRemaining: 0, usage: {} };

  const expired = isTrialExpired();
  const seconds = getTrialSecondsRemaining();
  const daysRemaining = Math.max(0, seconds / 86400);

  return {
    isTrialing: true,
    isExpired: expired,
    daysRemaining,
    timeRemaining: getTrialTimeRemaining(),
    usage: { ...trial.usage },
    limits: { ...LIMITS },
  };
}