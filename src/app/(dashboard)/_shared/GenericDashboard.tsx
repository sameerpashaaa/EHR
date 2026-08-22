"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Building,
  Stethoscope,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import PermissionGate from "@/components/ui/PermissionGate";

// ─── Types ───────────────────────────────────────────────────────────────────
interface DashboardData {
  kpi: {
    appointments:   { value: number; sub: string; trend: string };
    totalPatients:  { value: number; sub: string; trend: string };
    overallRooms:   { value: number | null; sub: string; trend: string };
    doctorsOnDuty:  { value: number; sub: string; trend: string };
    treatments:     { value: number; sub: string; trend: string };
  };
  riskAnalytics: { high: number; moderate: number; low: number; total: number };
  encounterStats: { label: string; value: number; from: string; to: string }[];
  summary: { totalScheduled: number; completed: number; missed: number };
  recentAppointments: {
    time: string; name: string; type: string;
    status: "success" | "danger" | "info";
    patientId: string; initial: string;
  }[];
  calendarDotMap: Record<string, number>;
}

// ─── Data fetching hook ──────────────────────────────────────────────────────
function useDashboard() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetch_ = useCallback(async (bg = false) => {
    try {
      if (!bg) setLoading(true);
      const res  = await fetch("/api/dashboard/metrics");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed");
      setData(json.data as DashboardData);
      setLastUpdated(new Date());
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      if (!bg) setLoading(false);
    }
  }, []);

  useEffect(() => { fetch_(false); }, [fetch_]);
  useEffect(() => {
    const id = setInterval(() => fetch_(true), 60_000);
    return () => clearInterval(id);
  }, [fetch_]);

  return { data, loading, error, lastUpdated, refresh: () => fetch_(false) };
}

// ─── ClientOnly Wrapper ──────────────────────────────────────────────────────
function ClientOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}

// ─── Shared card style ────────────────────────────────────────────────────────
const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = "16px" }: { w?: string; h?: string }) {
  return (
    <span
      className="animate-pulse rounded-md bg-slate-100 block"
      style={{ width: w, height: h }}
    />
  );
}

// ─── Top Header ──────────────────────────────────────────────────────────────
function TopHeader({ loading, lastUpdated, onRefresh }: {
  loading: boolean; lastUpdated: Date | null; onRefresh: () => void;
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div className="flex items-center justify-end gap-[8px] mb-[16px]">
      {lastUpdated && (
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
          Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </span>
      )}
      <button
        onClick={onRefresh}
        className="p-[6px] rounded-[6px] hover:bg-white/80 transition-colors"
        style={{ border: "0.5px solid rgba(0,0,0,0.08)" }}
        title="Refresh dashboard"
      >
        <RefreshCw className={cn("w-3.5 h-3.5 text-[#94a3b8]", loading && "animate-spin")} />
      </button>
      <div
        className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] text-[12px] font-[500] text-[#94a3b8]"
        style={{ background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(0,0,0,0.08)" }}
      >
        {dateStr}
        <Calendar className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────
function KPICards({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  const kpiDefs = [
    {
      key:   "appointments" as const,
      title: "Appointments",
      icon:  Calendar,
      color: { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]" },
      href:  "/schedule",
    },
    {
      key:   "totalPatients" as const,
      title: "Total patients",
      icon:  Users,
      color: { bg: "bg-[#E6F1FB]", text: "text-[#185FA5]" },
      href:  "/patients",
    },
    {
      key:   "overallRooms" as const,
      title: "Overall rooms",
      icon:  Building,
      color: { bg: "bg-[#FAEEDA]", text: "text-[#854F0B]" },
      href:  "#",
    },
    {
      key:   "doctorsOnDuty" as const,
      title: "Doctors on duty",
      icon:  Stethoscope,
      color: { bg: "bg-[#EEEDFE]", text: "text-[#534AB7]" },
      href:  "#",
    },
    {
      key:   "treatments" as const,
      title: "Treatments",
      icon:  Heart,
      color: { bg: "bg-[#FBEAF0]", text: "text-[#993556]" },
      href:  "/prescribe",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-[16px] mb-[16px]">
      {kpiDefs.map((kpi, idx) => {
        const metric = data?.kpi[kpi.key];
        const value  = metric?.value ?? null;
        const sub    = metric?.sub ?? "";
        const trend  = metric?.trend ?? "flat";

        return (
          <motion.div
            key={idx}
            className="group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
          >
            <Link
              href={kpi.href}
              className="flex flex-col h-full"
              style={{
                ...CARD_STYLE,
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                transition: "box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.3s, transform 0.3s cubic-bezier(0.4,0,0.2,1)",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 14px 40px rgba(0,0,0,0.10)";
                el.style.borderColor = "rgba(34,197,94,0.25)";
                el.style.transform = "translateY(-6px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = CARD_STYLE.boxShadow as string;
                el.style.borderColor = "rgba(255,255,255,0.60)";
                el.style.transform = "translateY(0)";
              }}
            >
              <div className="flex items-start justify-between mb-[12px]">
                <div className="flex items-center gap-[12px]">
                  <div className={cn(
                    "w-[32px] h-[32px] rounded-[6px] flex items-center justify-center",
                    "group-hover:scale-[1.12] transition-transform duration-300",
                    kpi.color.bg
                  )}>
                    <kpi.icon className={cn("w-[16px] h-[16px]", kpi.color.text)} />
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#475569" }}>{kpi.title}</p>
                </div>
                {trend === "up"   && <ArrowUpRight   className="w-4 h-4 text-[#1D9E75]" />}
                {trend === "down" && <ArrowDownRight className="w-4 h-4 text-[#E24B4A]" />}
                {trend === "flat" && <Minus          className="w-4 h-4 text-[#94a3b8]" />}
              </div>

              <div className="flex flex-col gap-[4px] mt-auto pt-[8px]">
                {loading ? (
                  <Skeleton h="38px" w="60px" />
                ) : value === null ? (
                  <span style={{ fontSize: "28px", fontWeight: 700, color: "#cbd5e1", lineHeight: 1 }}>—</span>
                ) : (
                  <span style={{ fontSize: "38px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px", lineHeight: 1 }}>
                    <ClientOnly fallback={value}>
                      <CountUp end={value} duration={1.8} />
                    </ClientOnly>
                  </span>
                )}
                {loading ? (
                  <Skeleton h="12px" w="80%" />
                ) : (
                  <span style={{ fontSize: "12px", color: "#94a3b8" }} className="truncate">{sub}</span>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Animated Donut Chart ─────────────────────────────────────────────────────
function AnimatedDonutChart({ high, moderate, low, total }: {
  high: number; moderate: number; low: number; total: number;
}) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 100); return () => clearTimeout(t); }, []);

  const radius = 45;
  const circ   = 2 * Math.PI * radius;
  const safeTotal = total || 1;
  const lowPct = low      / safeTotal;
  const modPct = moderate / safeTotal;
  const modOffset  = circ - (lowPct * circ);
  const highOffset = circ - ((lowPct + modPct) * circ);

  return (
    <div className="relative w-[120px] h-[120px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="gLow"  x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#4ade80"/></linearGradient>
          <linearGradient id="gHigh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444"/><stop offset="100%" stopColor="#f87171"/></linearGradient>
        </defs>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#F0F0EE" strokeWidth="12" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="url(#gLow)" strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={drawn ? 0 : circ}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }} />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#378ADD" strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={drawn ? modOffset : circ}
          style={{ transition: "stroke-dashoffset 1.5s ease-out 0.2s" }} />
        <circle cx="60" cy="60" r={radius} fill="none" stroke="url(#gHigh)" strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={drawn ? highOffset : circ}
          style={{ transition: "stroke-dashoffset 1.5s ease-out 0.4s" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span style={{ fontSize: "9px", color: "#94a3b8", lineHeight: 1, marginBottom: "2px" }}>patients</span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{total}</span>
      </div>
    </div>
  );
}

// ─── Patient Risk Analytics ────────────────────────────────────────────────────
function PatientRiskAnalytics({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  const risk = data?.riskAnalytics ?? { high: 0, moderate: 0, low: 0, total: 0 };

  const rows = [
    { label: "High risk",     count: risk.high,     color: "#E24B4A", badge: "Predictive", badgeBg: "#FAECE7", badgeText: "#993C1D" },
    { label: "Moderate risk", count: risk.moderate, color: "#378ADD", badge: "Predictive", badgeBg: "#E1F5EE", badgeText: "#0F6E56" },
    { label: "Low risk",      count: risk.low,      color: "#1D9E75", badge: "Predictive", badgeBg: "#E1F5EE", badgeText: "#0F6E56" },
  ];

  const insights = [
    { text: `${risk.high} patient${risk.high !== 1 ? "s" : ""} flagged high risk`,     accent: "#ef4444", bg: "rgba(239,68,68,0.06)"  },
    { text: `${risk.moderate} patient${risk.moderate !== 1 ? "s" : ""} moderate risk`, accent: "#f97316", bg: "rgba(249,115,22,0.06)" },
    { text: `${risk.low} patient${risk.low !== 1 ? "s" : ""} low risk`,               accent: "#22c55e", bg: "rgba(34,197,94,0.06)"  },
  ];

  return (
    <motion.div
      className="flex flex-col flex-1 w-full h-full"
      style={{ ...CARD_STYLE, padding: "20px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mb-[16px]">
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Patient risk analytics</h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Derived from active clinical conditions</p>
      </div>

      <div className="flex items-center gap-[20px] mb-[16px] flex-1">
        <div className="flex-1 flex flex-col">
          {loading
            ? [0,1,2].map(i => <div key={i} className="py-[8px]"><Skeleton h="24px" /></div>)
            : rows.map((row, i) => (
            <div key={i} className="flex items-center justify-between py-[8px]"
              style={{ borderBottom: i < 2 ? "0.5px solid rgba(0,0,0,0.08)" : "none" }}>
              <div className="flex items-center gap-[8px]">
                <span className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: row.color }} />
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{row.label}</span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{row.count}</span>
              </div>
              <div className="text-[10px] font-[500] px-[8px] py-[2px] rounded-full"
                style={{ background: row.badgeBg, color: row.badgeText }}>
                {row.badge}
              </div>
            </div>
          ))}
        </div>
        {!loading && (
          <AnimatedDonutChart
            high={risk.high}
            moderate={risk.moderate}
            low={risk.low}
            total={risk.total}
          />
        )}
      </div>

      <div style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "16px", padding: "12px 14px" }}>
        <div className="flex items-center gap-2 mb-[8px]">
          <span className="text-[10px] font-[500] px-[8px] py-[2px] rounded-full"
            style={{ background: "#E6F1FB", color: "#185FA5" }}>
            Risk summary
          </span>
          <span className="w-[7px] h-[7px] rounded-full animate-pulse" style={{ background: "#22c55e" }} />
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
          {loading
            ? [0,1,2].map(i => <li key={i}><Skeleton h="22px" /></li>)
            : insights.map((ins, i) => (
            <li key={i} style={{
              fontSize: "12px", color: "#475569",
              background: ins.bg, padding: "4px 8px",
              borderRadius: "4px", borderLeft: `3px solid ${ins.accent}`,
            }}>
              {ins.text}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// ─── Patients Statistics ──────────────────────────────────────────────────────
function PatientsStatistics({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  const [grown, setGrown] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGrown(true), 100); return () => clearTimeout(t); }, []);

  const stats = data?.encounterStats ?? [];
  const summary = data?.summary ?? { totalScheduled: 0, completed: 0, missed: 0 };

  return (
    <motion.div
      className="flex flex-col flex-1 w-full h-full"
      style={{ ...CARD_STYLE, padding: "20px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="mb-[20px]">
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Patients statistics</h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Encounter type distribution from database</p>
      </div>

      <div className="flex-1 flex items-end gap-[16px] px-[16px] pb-[16px]">
        {loading
          ? [0,1,2,3,4].map(i => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-[200px]">
              <Skeleton h="60%" w="100%" />
            </div>
          ))
          : stats.map((stat, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-[200px] group cursor-pointer">
            <span style={{ fontSize: "12px", fontWeight: 500, color: "#0f172a", marginBottom: "8px" }}>{stat.value}%</span>
            <div
              className="w-full"
              style={{
                height: grown ? `${Math.max(stat.value, 4)}%` : "0%",
                background: `linear-gradient(to top, ${stat.from}, ${stat.to})`,
                borderRadius: "10px 10px 0 0",
                transition: `height 1s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`,
                boxShadow: "0 -2px 8px rgba(0,0,0,0.08)",
              }}
            />
            <div className="w-full h-px bg-[#e2e8f0] mt-[4px]" />
            <div className="mt-[8px] flex flex-col items-center text-center">
              <span className="w-[8px] h-[8px] rounded-full mb-[4px]"
                style={{ background: `linear-gradient(135deg,${stat.from},${stat.to})` }} />
              <span style={{ fontSize: "11px", color: "#475569" }} className="truncate w-full px-1 text-center">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-[16px] pt-[16px] mt-[16px]"
        style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)" }}>
        {loading ? (
          <>
            <Skeleton w="80px" h="32px" />
            <Skeleton w="80px" h="32px" />
            <Skeleton w="80px" h="32px" />
          </>
        ) : (
          <>
            <div className="flex flex-col">
              <span style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>Total scheduled</span>
              <span style={{ fontSize: "18px", fontWeight: 500, color: "#0f172a" }}>
                <ClientOnly fallback={summary.totalScheduled}>
                  <CountUp end={summary.totalScheduled} duration={1.8} separator="," />
                </ClientOnly>
              </span>
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>Completed</span>
              <span style={{ fontSize: "18px", fontWeight: 500, color: "#22c55e" }}>
                <ClientOnly fallback={summary.completed}>
                  <CountUp end={summary.completed} duration={1.8} separator="," />
                </ClientOnly>
              </span>
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>Missed</span>
              <span style={{ fontSize: "18px", fontWeight: 500, color: "#ef4444" }}>
                <ClientOnly fallback={summary.missed}>
                  <CountUp end={summary.missed} duration={1.8} separator="," />
                </ClientOnly>
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Appointment Overview ─────────────────────────────────────────────────────
function AppointmentOverview({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  const appointments = data?.recentAppointments ?? [];

  return (
    <motion.div
      className="flex flex-col flex-1 w-full h-full"
      style={{ ...CARD_STYLE, padding: "16px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-[16px]">
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Appointment overview</h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Recent encounters from database</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#94a3b8]" />
      </div>

      <div className="space-y-[4px] flex-1">
        {loading
          ? [0,1,2,3].map(i => <div key={i} className="p-[12px]"><Skeleton h="40px" /></div>)
          : appointments.length === 0
            ? <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>No recent encounters</p>
            : appointments.map((apt, i) => (
          <Link
            href={`/patients/${apt.patientId}`}
            key={i}
            className="flex items-center gap-[12px] hover:bg-[#f8fafc] p-[12px] -mx-[12px] rounded-[12px] transition-colors group"
          >
            <span style={{ fontSize: "11px", fontWeight: 500, color: "#94a3b8", width: "50px" }}>{apt.time}</span>
            <div className="w-[8px] h-[8px] rounded-full" style={{
              backgroundColor: apt.status === "success" ? "#1D9E75" : apt.status === "danger" ? "#E24B4A" : "#185FA5"
            }} />
            <div className="w-[32px] h-[32px] rounded-full bg-[#f1f5f9] flex items-center justify-center flex-shrink-0"
              style={{ fontSize: "12px", fontWeight: 500, color: "#64748b" }}>
              {apt.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }} className="truncate">{apt.name}</p>
              <p style={{ fontSize: "11px", color: "#94a3b8" }} className="truncate">{apt.type}</p>
            </div>
            <div className={cn(
              "w-[24px] h-[24px] rounded-[6px] flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
              apt.status === "success" ? "bg-[#E1F5EE] text-[#0F6E56]" :
              apt.status === "danger"  ? "bg-[#FAECE7] text-[#993C1D]" : "bg-[#E6F1FB] text-[#185FA5]"
            )}>
              {apt.status === "success" ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Appointment Calendar ─────────────────────────────────────────────────────
function AppointmentCalendar({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year    = viewDate.getFullYear();
  const month   = viewDate.getMonth();
  const today   = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const offset   = firstDay === 0 ? 6 : firstDay - 1; // Mon-based offset
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const cells = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - offset + 1;
    if (dayNum < 1)              return { day: daysInPrev + dayNum,    current: false };
    if (dayNum > daysInMonth)    return { day: dayNum - daysInMonth,   current: false };
    return { day: dayNum, current: true };
  });

  const dotMap = data?.calendarDotMap ?? {};
  function hasDot(day: number): boolean {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return !!dotMap[key];
  }

  const DOT_COLORS = ["#E24B4A", "#185FA5", "#534AB7", "#BA7517"];

  return (
    <motion.div
      className="flex flex-col flex-1 w-full h-full"
      style={{ ...CARD_STYLE, padding: "16px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-[16px]">
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Appointment calendar</h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Schedule your health appointments with ease</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-[16px] mb-[16px]">
        <button
          className="p-1 text-[#94a3b8] hover:text-[#0f172a] transition-colors"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>{monthLabel}</span>
        <button
          className="p-1 text-[#94a3b8] hover:text-[#0f172a] transition-colors"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-[16px] gap-x-[8px] text-center flex-1">
        {days.map(d => (
          <div key={d} style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8", marginBottom: "8px" }}>{d}</div>
        ))}
        {cells.map((cell, i) => {
          const isToday = cell.current && isCurrentMonth && cell.day === today.getDate();
          const dot     = cell.current && hasDot(cell.day);
          return (
            <div key={i} className={cn(
              "relative flex flex-col items-center pt-[4px] rounded-[6px] hover:bg-[#f8fafc] transition-colors cursor-pointer min-h-[40px]",
              !cell.current && "opacity-40"
            )}>
              <span
                className="w-[24px] h-[24px] flex items-center justify-center rounded-full"
                style={{
                  fontSize: "12px", fontWeight: 500,
                  background: isToday ? "linear-gradient(135deg,#1D9E75,#16a34a)" : "transparent",
                  color: isToday ? "#fff" : "#0f172a",
                  boxShadow: isToday ? "0 2px 8px rgba(29,158,117,0.30)" : "none",
                }}
              >{cell.day}</span>
              {dot && (
                <div className="mt-[4px] flex gap-[2px]">
                  <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: DOT_COLORS[i % DOT_COLORS.length] }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Date Legends ─────────────────────────────────────────────────────────────
function DateLegends() {
  const legends = [
    { color: "#E24B4A", label: "Emergency patient meet"    },
    { color: "#1D9E75", label: "Physical appointment"      },
    { color: "#185FA5", label: "Normal health checkups"    },
    { color: "#534AB7", label: "Routine vaccination"       },
    { color: "#BA7517", label: "Dental cleaning"           },
    { color: "#0F6E56", label: "Lab test follow-up"        },
    { color: "#993556", label: "Blood pressure monitoring" },
  ];

  return (
    <motion.div
      className="flex flex-col flex-1 w-full h-full"
      style={{ ...CARD_STYLE, padding: "16px" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="mb-[20px]">
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Date legends</h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Effortlessly plan your health check-ups</p>
      </div>
      <div className="flex-1 flex flex-col gap-[12px]">
        {legends.map((item, i) => (
          <div key={i} className="flex items-center gap-[12px]">
            <span className="w-[10px] h-[10px] rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span style={{ fontSize: "12px", fontWeight: 500, color: "#475569" }}>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-[16px]">
        <Link
          href="/schedule"
          className="w-full flex items-center justify-center rounded-[10px] py-[8px] transition-all"
          style={{ background: "#E1F5EE", color: "#0F6E56", fontSize: "12px", fontWeight: 500 }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "linear-gradient(135deg,#1D9E75,#16a34a)";
            el.style.color = "#fff";
            el.style.boxShadow = "0 4px 12px rgba(29,158,117,0.25)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "#E1F5EE";
            el.style.color = "#0F6E56";
            el.style.boxShadow = "none";
          }}
        >
          Add appointment +
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function GenericDashboard() {
  const { data, loading, error, lastUpdated, refresh } = useDashboard();

  return (
    <div
      className="min-h-screen p-[20px] relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(34,197,94,0.06), transparent 30%),
          radial-gradient(circle at bottom right, rgba(59,130,246,0.06), transparent 30%),
          #f5f7fb
        `,
      }}
    >
      {/* Decorative Orbs */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(34,197,94,0.15)", zIndex: 0 }}
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "rgba(59,130,246,0.12)", zIndex: 0 }}
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        <TopHeader loading={loading} lastUpdated={lastUpdated} onRefresh={refresh} />

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">
            ⚠️ Dashboard data unavailable: {error}
          </div>
        )}

        <KPICards data={data} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px] mb-[16px] items-stretch">
          <PermissionGate permission="patients:read">
            <div className="col-span-1 flex flex-col"><PatientRiskAnalytics data={data} loading={loading} /></div>
            <div className="col-span-1 lg:col-span-2 flex flex-col"><PatientsStatistics data={data} loading={loading} /></div>
          </PermissionGate>
        </div>

        <PermissionGate permission="encounters:read">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr_200px] xl:grid-cols-[280px_1fr_220px] gap-[16px] pb-[32px] items-stretch">
            <div className="flex flex-col"><AppointmentOverview data={data} loading={loading} /></div>
            <div className="flex flex-col"><AppointmentCalendar data={data} loading={loading} /></div>
            <div className="flex flex-col"><DateLegends /></div>
          </div>
        </PermissionGate>
      </div>
    </div>
  );
}
