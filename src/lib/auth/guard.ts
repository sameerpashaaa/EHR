import { NextResponse } from "next/server";
import { SessionUser, UserRole } from "@/types";
import { Permission, hasAnyPermission, hasAllPermissions } from "./roles";

interface GuardOptions {
  requireAll?: boolean;
  ownerId?: string;
  requesterOwnerId?: string;
}

/**
 * Validates if the user has the required permission(s).
 * Returns a NextResponse (403 or 401) if unauthorized, otherwise returns null.
 */
export function guard(
  user: SessionUser | undefined | null,
  permissions: Permission | Permission[],
  options: GuardOptions = {}
): NextResponse | null {
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      { status: 401 }
    );
  }

  // If a PATIENT is accessing, verify they are only accessing their own data (if ownerId is provided)
  if (user.role === "PATIENT" && options.ownerId) {
    const requesterId = options.requesterOwnerId || (user as any).patientId;
    if (!requesterId || requesterId !== options.ownerId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Cannot access another patient's records" } },
        { status: 403 }
      );
    }
  }

  const permsArray = Array.isArray(permissions) ? permissions : [permissions];
  
  if (permsArray.length === 0) {
    return null; // No permissions required
  }

  const hasPerms = options.requireAll
    ? hasAllPermissions(user.role, permsArray)
    : hasAnyPermission(user.role, permsArray);

  if (!hasPerms) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
      { status: 403 }
    );
  }

  return null;
}
