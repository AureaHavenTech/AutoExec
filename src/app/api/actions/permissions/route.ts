// /api/actions/permissions — Check and manage user permissions
import { NextRequest, NextResponse } from "next/server";
import {
  getUserPermissions,
  canExecuteAction,
  getConnectedServices,
  grantPermission,
  revokePermission,
  grantAllPermissions,
  PERMISSION_LABELS,
} from "@/lib/actions";
import { getAllActions, getUnavailableActions, getAvailableActions } from "@/lib/actions";
import type { PermissionScope, ActionId } from "@/lib/actions";

// GET — Get permissions, services, and action availability for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";
    const actionId = searchParams.get("actionId");
    const services = searchParams.get("services");
    const available = searchParams.get("available");
    const unavailable = searchParams.get("unavailable");

    // Check if user can execute a specific action
    if (actionId) {
      const result = canExecuteAction(userId, actionId as ActionId);
      return NextResponse.json({ success: true, ...result });
    }

    // Get connected services
    if (services === "true") {
      const svcs = getConnectedServices(userId);
      return NextResponse.json({ success: true, services: svcs });
    }

    // Get available actions
    if (available === "true") {
      const actions = getAvailableActions().map((a) => ({
        id: a.id,
        label: a.label,
        category: a.category,
        permissions: a.requiredPermissions.map((p) => PERMISSION_LABELS[p] || p),
      }));
      return NextResponse.json({ success: true, actions, count: actions.length });
    }

    // Get unavailable actions
    if (unavailable === "true") {
      const actions = getUnavailableActions().map((a) => ({
        id: a.id,
        label: a.label,
        category: a.category,
        permissions: a.requiredPermissions.map((p) => PERMISSION_LABELS[p] || p),
      }));
      return NextResponse.json({ success: true, actions, count: actions.length });
    }

    // Full permissions dump
    const perms = getUserPermissions(userId);
    const allActions = getAllActions().map((a) => ({
      id: a.id,
      label: a.label,
      category: a.category,
      canExecute: canExecuteAction(userId, a.id).allowed,
      requiredPermissions: a.requiredPermissions.map((p) => ({
        scope: p,
        label: PERMISSION_LABELS[p] || p,
        granted: perms.granted.includes(p),
      })),
    }));

    return NextResponse.json({
      success: true,
      userId,
      permissions: perms.granted.map((p) => ({
        scope: p === ("*" as PermissionScope) ? "*" : p,
        label: p === ("*" as PermissionScope) ? "All permissions (admin)" : PERMISSION_LABELS[p] || p,
      })),
      connectedServices: getConnectedServices(userId),
      actions: allActions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

// POST — Grant or revoke permissions
export async function POST(request: NextRequest) {
  try {
    const { userId, action, scope } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (action === "grant_all") {
      grantAllPermissions(userId);
      return NextResponse.json({
        success: true,
        message: "All permissions granted (admin mode)",
        permissions: getUserPermissions(userId).granted,
      });
    }

    if (!scope) {
      return NextResponse.json(
        { success: false, error: "scope is required for grant/revoke" },
        { status: 400 }
      );
    }

    if (action === "grant") {
      grantPermission(userId, scope as PermissionScope);
      return NextResponse.json({
        success: true,
        message: `Permission '${scope}' granted`,
        permissions: getUserPermissions(userId).granted,
      });
    }

    if (action === "revoke") {
      revokePermission(userId, scope as PermissionScope);
      return NextResponse.json({
        success: true,
        message: `Permission '${scope}' revoked`,
        permissions: getUserPermissions(userId).granted,
      });
    }

    return NextResponse.json(
      { success: false, error: "action must be 'grant', 'revoke', or 'grant_all'" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update permissions" },
      { status: 500 }
    );
  }
}
