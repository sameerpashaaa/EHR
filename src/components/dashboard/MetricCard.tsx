"use client";

import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight,
  Users,
  Brain,
  AlertTriangle,
  FileText,
  Mic,
  Pill,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "neutral";
  status: "live" | "offline" | "warning";
  link: string;
  icon: "patients" | "predictions" | "alerts" | "documents" | "voice" | "prescriptions";
  details?: Record<string, number>;
  isLoading?: boolean;
}

const iconMap = {
  patients: Users,
  predictions: Brain,
  alerts: AlertTriangle,
  documents: FileText,
  voice: Mic,
  prescriptions: Pill,
};

export function MetricCard({
  title,
  value,
  change,
  changePercent,
  trend,
  status,
  link,
  icon,
  details,
  isLoading = false,
}: MetricCardProps) {
  const Icon = iconMap[icon];

  if (isLoading) {
    return (
      <div className="px-[20px] py-[16px] bg-white rounded-[8px] border border-[#e2e8f0] animate-pulse">
        <div className="h-16 bg-[#f8fafc] rounded-[6px]" />
      </div>
    );
  }

  return (
    <Link href={link}>
      <div
        className={cn(
          "flex items-center gap-[14px] px-[20px] py-[16px] bg-white rounded-[8px] border border-[#e2e8f0] transition-all cursor-pointer group",
          "hover:border-[#22c55e]/40 hover:bg-[#fafffe] active:scale-[0.99]"
        )}
      >
        {/* Icon Box */}
        <div className="w-[40px] h-[40px] rounded-[8px] bg-[#f0fdf4] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#22c55e]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Status + Label */}
          <div className="flex items-center gap-2 mb-[2px]">
            <p className="text-[10px] font-[600] text-[#94a3b8] uppercase tracking-[0.05em]">{title}</p>
            {status === "live" && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
                <span className="text-[10px] text-[#16a34a] font-[600]">Live</span>
              </div>
            )}
            {status === "warning" && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#b45309] rounded-full animate-pulse" />
                <span className="text-[10px] text-[#b45309] font-[600]">Warning</span>
              </div>
            )}
          </div>

          {/* Value */}
          <p className="text-[20px] font-[700] text-[#0f172a]">{value.toLocaleString()}</p>

          {/* Trend */}
          <div className="flex items-center gap-2 mt-[2px]">
            <div className={cn(
              "flex items-center gap-1 px-[6px] py-[2px] rounded-[4px] text-[11px] font-[600] border",
              trend === "up"
                ? "bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]"
                : trend === "down"
                ? "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]"
                : "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]"
            )}>
              {trend === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : trend === "down" ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Activity className="w-3 h-3" />
              )}
              <span>{change > 0 ? "+" : ""}{change}</span>
            </div>
            <span className="text-[11px] text-[#94a3b8]">today</span>
          </div>
        </div>

        {/* Details Preview */}
        {details && Object.keys(details).length > 0 && (
          <div className="border-l border-[#e2e8f0] pl-3 flex-shrink-0">
            <div className="space-y-1">
              {Object.entries(details).slice(0, 2).map(([key, val]) => (
                <div key={key} className="text-[11px]">
                  <p className="text-[#94a3b8] capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                  <p className="font-[600] text-[#0f172a]">{val.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View link arrow */}
        <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#22c55e] transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}
