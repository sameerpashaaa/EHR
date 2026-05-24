import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  status: "SUCCESS" | "FAILURE" | "WARNING";
  errorMessage?: string;
  metadata?: any;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
  };
  practitioner?: {
    id: string;
    department?: string;
  };
}

export interface SystemHealth {
  id: string;
  serviceName: string;
  serviceType: string;
  status: "OPERATIONAL" | "DEGRADED" | "DOWN" | "MAINTENANCE";
  uptime: number;
  latency: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  requestCount?: number;
  errorCount?: number;
  region?: string;
  version?: string;
  recordedAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalPatients: number;
  totalEncounters: number;
  recentLogins: number;
}

export interface SystemHealthData {
  services: SystemHealth[];
  statistics: SystemStats;
  auditStats: Record<string, number>;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AdminUserFilters {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface CreateAdminUserData {
  email: string;
  name: string;
  role: string;
  department?: string;
  organizationId?: string;
  isActive?: boolean;
  twoFactorEnabled?: boolean;
}

export interface RecordSystemHealthData {
  serviceName: string;
  serviceType: string;
  status: string;
  uptime: number;
  latency: number;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
  requestCount?: number;
  errorCount?: number;
  region?: string;
  version?: string;
}

// Hooks

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.userId) params.append("userId", filters.userId);
      if (filters?.action) params.append("action", filters.action);
      if (filters?.resource) params.append("resource", filters.resource);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.offset) params.append("offset", filters.offset.toString());

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json();
    },
  });
}

export function useCreateAuditLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AuditLog>) => {
      const response = await fetch("/api/admin/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create audit log");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditLogs"] });
    },
  });
}

export function useAdminUsers(filters?: AdminUserFilters) {
  return useQuery({
    queryKey: ["adminUsers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.offset) params.append("offset", filters.offset.toString());

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAdminUserData) => {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
}

export function useSystemHealth() {
  return useQuery<SystemHealthData>({
    queryKey: ["systemHealth"],
    queryFn: async () => {
      const response = await fetch("/api/admin/system-health");
      if (!response.ok) throw new Error("Failed to fetch system health");
      return response.json();
    },
  });
}

export function useRecordSystemHealth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RecordSystemHealthData) => {
      const response = await fetch("/api/admin/system-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to record system health");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemHealth"] });
    },
  });
}

export function useSystemHealthPolling(intervalMs: number = 30000) {
  const query = useQuery<SystemHealthData>({
    queryKey: ["systemHealth", "polling"],
    queryFn: async () => {
      const response = await fetch("/api/admin/system-health");
      if (!response.ok) throw new Error("Failed to fetch system health");
      return response.json();
    },
    refetchInterval: intervalMs,
  });

  return {
    health: query.data,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
  };
}
