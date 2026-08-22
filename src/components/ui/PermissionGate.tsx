"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Permission, hasPermission } from "@/lib/auth/roles";

interface PermissionGateProps {
  permission?: Permission | Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissionGate({
  permission,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    // Optionally return a skeleton or null during loading
    return null;
  }

  if (!session?.user) {
    return <>{fallback}</>;
  }

  const userRole = (session.user as any).role;

  if (!permission) {
    return <>{children}</>;
  }

  const permissionsToCheck = Array.isArray(permission) ? permission : [permission];

  const hasAccess = requireAll
    ? permissionsToCheck.every((p) => hasPermission(userRole, p))
    : permissionsToCheck.some((p) => hasPermission(userRole, p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
