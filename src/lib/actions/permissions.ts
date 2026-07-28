// Permission Layer — checks and manages user permissions before action execution
// In-memory store (in production, this would be backed by the database)
import type { UserPermissions, PermissionScope, ActionId } from "./types";
import { getActionDefinition } from "./registry";

// ─── In-Memory Store ────────────────────────────────────────

const userPermissions = new Map<string, UserPermissions>();

// ─── Helpers ────────────────────────────────────────────────

function getOrCreate(userId: string): UserPermissions {
  if (!userPermissions.has(userId)) {
    userPermissions.set(userId, {
      userId,
      granted: [],
      revoked: [],
    });
  }
  return userPermissions.get(userId)!;
}

// ─── Public API ─────────────────────────────────────────────

/** Grant a permission scope to a user */
export function grantPermission(userId: string, scope: PermissionScope): void {
  const perms = getOrCreate(userId);
  if (!perms.granted.includes(scope)) {
    perms.granted.push(scope);
  }
  // Remove from revoked list if present
  perms.revoked = perms.revoked.filter((s) => s !== scope);
}

/** Revoke a permission scope from a user */
export function revokePermission(userId: string, scope: PermissionScope): void {
  const perms = getOrCreate(userId);
  perms.granted = perms.granted.filter((s) => s !== scope);
  if (!perms.revoked.includes(scope)) {
    perms.revoked.push(scope);
  }
}

/** Check if a user has a specific permission */
export function hasPermission(userId: string, scope: PermissionScope): boolean {
  const perms = userPermissions.get(userId);
  if (!perms) return false;
  // Admin users have all permissions
  if (perms.granted.includes("*" as PermissionScope)) return true;
  return perms.granted.includes(scope) && !perms.revoked.includes(scope);
}

/** Check if a user can execute a specific action */
export function canExecuteAction(userId: string, actionId: ActionId): {
  allowed: boolean;
  missingPermissions: PermissionScope[];
  reason?: string;
} {
  // noop action is always allowed
  if (actionId === "noop") {
    return { allowed: true, missingPermissions: [] };
  }

  const def = getActionDefinition(actionId);
  if (!def) {
    return { allowed: false, missingPermissions: [], reason: `Unknown action: ${actionId}` };
  }

  // If action requires no permissions, allow it
  if (def.requiredPermissions.length === 0) {
    return { allowed: true, missingPermissions: [] };
  }

  const missingPermissions: PermissionScope[] = [];
  for (const scope of def.requiredPermissions) {
    if (!hasPermission(userId, scope)) {
      missingPermissions.push(scope);
    }
  }

  if (missingPermissions.length > 0) {
    return {
      allowed: false,
      missingPermissions,
      reason: `Missing permissions: ${missingPermissions.join(", ")}. Connect the required service to grant these permissions.`,
    };
  }

  return { allowed: true, missingPermissions: [] };
}

/** Get all permissions for a user */
export function getUserPermissions(userId: string): UserPermissions {
  return getOrCreate(userId);
}

/** Grant all permissions (e.g., for admin users or demo mode) */
export function grantAllPermissions(userId: string): void {
  const perms = getOrCreate(userId);
  perms.granted = ["*" as PermissionScope];
  perms.revoked = [];
}

/** Check what services a user has connected */
export function getConnectedServices(userId: string): { service: string; scopes: PermissionScope[] }[] {
  const perms = userPermissions.get(userId);
  if (!perms) return [];

  const serviceMap: Record<string, PermissionScope[]> = {
    email: ["email:read", "email:send"],
    calendar: ["calendar:read", "calendar:write"],
    shopify: ["shopify:read", "shopify:write"],
    web: ["web:search", "web:scrape"],
    reports: ["report:generate"],
    invoices: ["invoice:generate"],
    onepost: ["onepost:create"],
  };

  return Object.entries(serviceMap)
    .filter(([, scopes]) => scopes.some((s) => perms.granted.includes(s)))
    .map(([service, scopes]) => ({
      service,
      scopes: scopes.filter((s) => perms.granted.includes(s)),
    }));
}

/** Human-readable permission descriptions */
export const PERMISSION_LABELS: Record<PermissionScope, string> = {
  "email:read": "Read your emails",
  "email:send": "Send emails on your behalf",
  "calendar:read": "View your calendar",
  "calendar:write": "Create and modify calendar events",
  "shopify:read": "View your Shopify store data",
  "shopify:write": "Create discounts and modify products",
  "web:search": "Search the web for information",
  "web:scrape": "Visit websites and extract data",
  "report:generate": "Generate business reports",
  "invoice:generate": "Create and send invoices",
  "onepost:create": "Create content via OnePost AI",
};
