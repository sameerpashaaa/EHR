"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Menu,
  Plus,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import CountUp from "react-countup";

// ─── ClientOnly Wrapper ─────────────────────────────────────────────────────
function ClientOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}

// ─── Reduced-motion hook ────────────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [pref, setPref] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPref(mq.matches);
    const handler = () => setPref(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return pref;
}

// ─── Shared card style ─────────────────────────────────────────────────────
const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
};

// ─── Top Header ─────────────────────────────────────────────────────────────
function TopHeader() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const addRipple = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 600);
  };

  return (
    <div className="flex items-center justify-between mb-[16px]">
      <div
        className="flex items-center gap-[8px] p-[8px] rounded-[8px]"
        style={{ background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(0,0,0,0.08)", backdropFilter: "blur(8px)" }}
      >
        <Link href="/" className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[6px] bg-[#f8fafc] text-[12px] font-[500] text-[#0f172a] hover:bg-[#e2e8f0] transition-colors">
          <Menu className="w-3.5 h-3.5" />
          Dashboard
          <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
        </Link>
      </div>
      <div className="flex items-center gap-[12px]">
        <Link
          href="/schedule"
          onMouseDown={addRipple}
          className="relative overflow-hidden flex items-center gap-[8px] px-[12px] py-[8px] text-white text-[12px] font-[500] rounded-[8px] active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(135deg,#1D9E75 0%,#16a34a 100%)",
            boxShadow: "0 4px 12px rgba(29,158,117,0.30)",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(34,197,94,0.4),0 4px 12px rgba(29,158,117,0.30)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(29,158,117,0.30)"; }}
        >
          {ripples.map(r => (
            <span key={r.id} className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
              style={{ left: r.x - 16, top: r.y - 16, width: 32, height: 32, animationDuration: "0.6s" }} />
          ))}
          <Plus className="w-3.5 h-3.5" />
          Add new appointment
        </Link>
        <div
          className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[8px] text-[12px] font-[500] text-[#94a3b8]"
          style={{ background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(0,0,0,0.08)" }}
        >
          10 Feb, 2025
          <Calendar className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

// ─── KPI Cards ──────────────────────────────────────────────────────────────
function KPICards() {
  const kpis = [
    { title: "Appointments",    value: 98,  icon: Calendar,    color: { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]" }, trend: "up",   sub: "↑ 80% annual · 34 new",    href: "/schedule"  },
    { title: "Total patients",  value: 87,  icon: Users,       color: { bg: "bg-[#E6F1FB]", text: "text-[#185FA5]" }, trend: "down", sub: "↓ 12% annual · 29 new",    href: "/patients"  },
    { title: "Overall rooms",   value: 112, icon: Building,    color: { bg: "bg-[#FAEEDA]", text: "text-[#854F0B]" }, trend: "flat", sub: "— 82 general · 30 private", href: "#"          },
    { title: "Doctors on duty", value: 76,  icon: Stethoscope, color: { bg: "bg-[#EEEDFE]", text: "text-[#534AB7]" }, trend: "up",   sub: "↑ 72 available · 4 leave",  href: "#"          },
    { title: "Treatments",      value: 64,  icon: Heart,       color: { bg: "bg-[#FBEAF0]", text: "text-[#993556]" }, trend: "up",   sub: "↑ 30 ops · 34 general",    href: "/prescribe"  },
  ];

  return (
    <div className="grid grid-cols-5 gap-[16px] mb-[16px]">
      {kpis.map((kpi, idx) => (
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
              {kpi.trend === "up"   && <ArrowUpRight   className="w-4 h-4 text-[#1D9E75]" />}
              {kpi.trend === "down" && <ArrowDownRight className="w-4 h-4 text-[#E24B4A]" />}
              {kpi.trend === "flat" && <Minus          className="w-4 h-4 text-[#94a3b8]" />}
            </div>
            <div className="flex flex-col gap-[4px] mt-auto pt-[8px]">
              <span style={{ fontSize: "38px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px", lineHeight: 1 }}>
                <ClientOnly fallback={kpi.value}>
                  <CountUp end={kpi.value} duration={1.8} />
                </ClientOnly>
              </span>
              <span style={{ fontSize: "12px", color: "#94a3b8" }} className="truncate">{kpi.sub}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Animated Donut Chart ────────────────────────────────────────────────────
function AnimatedDonutChart() {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 100); return () => clearTimeout(t); }, []);

  const radius = 45;
  const circ   = 2 * Math.PI * radius;
  const total  = 115;
  const lowPct = 78 / total;
  const modPct = 25 / total;
  const modOffset  = circ - (lowPct * circ);
  const highOffset = circ - ((lowPct + modPct) * circ);
  const dur = "1.5s";

  return (
    <div className="relative w-[120px] h-[120px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="gLow"  x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#4ade80"/></linearGradient>
          <linearGradient id="gHigh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444"/><stop offset="100%" stopColor="#f87171"/></linearGradient>
        </defs>
        {/* Track */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#F0F0EE" strokeWidth="12" />
        {/* Low risk – green */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="url(#gLow)"  strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={drawn ? 0 : circ}
          style={{ transition: `stroke-dashoffset ${dur} ease-out` }} />
        {/* Moderate risk – blue */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#378ADD" strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={drawn ? modOffset : circ}
          style={{ transition: `stroke-dashoffset ${dur} ease-out 0.2s` }} />
        {/* High risk – red with pulse */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke="url(#gHigh)" strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={drawn ? highOffset : circ}
          style={{ transition: `stroke-dashoffset ${dur} ease-out 0.4s` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span style={{ fontSize: "9px", color: "#94a3b8", lineHeight: 1, marginBottom: "2px" }}>patients</span>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>115</span>
      </div>
    </div>
  );
}

// ─── Patient Risk Analytics ──────────────────────────────────────────────────
function PatientRiskAnalytics() {
  const rows = [
    { label: "High risk",     count: 12, color: "#E24B4A", badge: "↑ 3%",  badgeBg: "#FAECE7", badgeText: "#993C1D" },
    { label: "Moderate risk", count: 25, color: "#378ADD", badge: "↓ 2",   badgeBg: "#E1F5EE", badgeText: "#0F6E56" },
    { label: "Low risk",      count: 78, color: "#1D9E75", badge: "↑ 87%", badgeBg: "#E1F5EE", badgeText: "#0F6E56" },
  ];

  const insights = [
    { text: "Sepsis risk detected in 3 patients",  accent: "#ef4444", bg: "rgba(239,68,68,0.06)"  },
    { text: "Chronic disease alert for 7 patients", accent: "#f97316", bg: "rgba(249,115,22,0.06)" },
    { text: "Model confidence: 92%",                accent: "#22c55e", bg: "rgba(34,197,94,0.06)"  },
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
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Identifies high-risk patients based on predictive analytics</p>
      </div>

      <div className="flex items-center gap-[20px] mb-[16px] flex-1">
        <div className="flex-1 flex flex-col">
          {rows.map((row, i) => (
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
        <AnimatedDonutChart />
      </div>

      {/* AI Insights */}
      <div style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "16px", padding: "12px 14px" }}>
        <div className="flex items-center gap-2 mb-[8px]">
          <span className="text-[10px] font-[500] px-[8px] py-[2px] rounded-full"
            style={{ background: "#E6F1FB", color: "#185FA5" }}>
            AI insights
          </span>
          <span className="w-[7px] h-[7px] rounded-full animate-pulse" style={{ background: "#22c55e" }} />
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
          {insights.map((ins, i) => (
            <li
              key={i}
              style={{
                fontSize: "12px",
                color: "#475569",
                background: ins.bg,
                padding: "4px 8px",
                borderRadius: "4px",
                borderLeft: `3px solid ${ins.accent}`,
              }}
            >
              {ins.text}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

// ─── Patients Statistics ─────────────────────────────────────────────────────
function PatientsStatistics() {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGrown(true), 100);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    { label: "Emergency patient", value: 56, from: "#dc2626", to: "#f87171" },
    { label: "Routine check-up",  value: 45, from: "#4338ca", to: "#818cf8" },
    { label: "Appointment",       value: 34, from: "#059669", to: "#34d399" },
    { label: "Physical therapy",  value: 20, from: "#b45309", to: "#fbbf24" },
    { label: "Therapy session",   value: 16, from: "#1e40af", to: "#60a5fa" },
  ];

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
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Figuring out stats for better health choices</p>
      </div>

      <div className="flex-1 flex items-end gap-[16px] px-[16px] pb-[16px]">
        {stats.map((stat, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-[200px] group cursor-pointer">
            <span style={{ fontSize: "12px", fontWeight: 500, color: "#0f172a", marginBottom: "8px" }}>{stat.value}%</span>
            <div
              className="w-full"
              style={{
                height: grown ? `${stat.value}%` : "0%",
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
        <div className="flex flex-col">
          <span style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>Total scheduled</span>
          <span style={{ fontSize: "18px", fontWeight: 500, color: "#0f172a" }}>
            <ClientOnly fallback="1,025">
              <CountUp end={1025} duration={1.8} separator="," />
            </ClientOnly>
          </span>
        </div>
        <div className="flex flex-col">
          <span style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>Completed</span>
          <span style={{ fontSize: "18px", fontWeight: 500, color: "#22c55e" }}>
            <ClientOnly fallback="780">
              <CountUp end={780} duration={1.8} separator="," />
            </ClientOnly>
          </span>
        </div>
        <div className="flex flex-col">
          <span style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>Missed</span>
          <span style={{ fontSize: "18px", fontWeight: 500, color: "#ef4444" }}>
            <ClientOnly fallback="245">
              <CountUp end={245} duration={1.8} separator="," />
            </ClientOnly>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Appointment Overview ───────────────────────────────────────────────────
function AppointmentOverview() {
  const appointments = [
    { time: "7:26 AM",  name: "Jordan Rivers", type: "Migraine",           status: "success", color: "#1D9E75", initial: "J" },
    { time: "1:12 PM",  name: "Taylor Green",  type: "Throbbing Pain",     status: "danger",  color: "#E24B4A", initial: "T" },
    { time: "6:11 PM",  name: "Casey Blue",    type: "Pounding Sensation", status: "info",    color: "#185FA5", initial: "C" },
    { time: "2:31 PM",  name: "Morgan Sky",    type: "Tension Ache",       status: "info",    color: "#185FA5", initial: "M" },
  ];

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
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Smart health appointment schedule</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#94a3b8]" />
      </div>
      <div className="space-y-[4px] flex-1">
        {appointments.map((apt, i) => (
          <Link href="/patients/P-2024-001" key={i}
            className="flex items-center gap-[12px] hover:bg-[#f8fafc] p-[12px] -mx-[12px] rounded-[12px] transition-colors group">
            <span style={{ fontSize: "11px", fontWeight: 500, color: "#94a3b8", width: "50px" }}>{apt.time}</span>
            <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: apt.color }} />
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

// ─── Appointment Calendar ────────────────────────────────────────────────────
function AppointmentCalendar() {
  const days  = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const dates = Array.from({ length: 35 }, (_, i) => i - 4);

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
        <button className="p-[4px] rounded-[6px] hover:bg-[#f8fafc] border-[0.5px] border-[rgba(0,0,0,0.08)]">
          <span className="w-4 h-4 flex items-center justify-center text-[#94a3b8]">⤢</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-[16px] mb-[16px]">
        <button className="p-1 text-[#94a3b8] hover:text-[#0f172a] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
        <span style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a" }}>February 2025</span>
        <button className="p-1 text-[#94a3b8] hover:text-[#0f172a] transition-colors"><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-7 gap-y-[16px] gap-x-[8px] text-center flex-1">
        {days.map(d => (
          <div key={d} style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8", marginBottom: "8px" }}>{d}</div>
        ))}
        {dates.map((date, i) => {
          const isCurrentMonth = date > 0 && date <= 28;
          const isToday        = date === 18;
          const display        = date > 0 && date <= 28 ? date : date <= 0 ? 31 + date : date - 28;
          return (
            <div key={i} className={cn(
              "relative flex flex-col items-center pt-[4px] rounded-[6px] hover:bg-[#f8fafc] transition-colors cursor-pointer min-h-[40px]",
              !isCurrentMonth && "opacity-40"
            )}>
              <span
                className="w-[24px] h-[24px] flex items-center justify-center rounded-full"
                style={{
                  fontSize: "12px", fontWeight: 500,
                  background: isToday ? "linear-gradient(135deg,#1D9E75,#16a34a)" : "transparent",
                  color: isToday ? "#fff" : "#0f172a",
                  boxShadow: isToday ? "0 2px 8px rgba(29,158,117,0.30)" : "none",
                }}
              >{display}</span>
              {date === 4  && <div className="mt-[4px] flex gap-[2px]"><span className="w-[6px] h-[6px] rounded-full bg-[#E24B4A]" /></div>}
              {date === 11 && <div className="mt-[4px] flex gap-[2px]"><span className="w-[6px] h-[6px] rounded-full bg-[#185FA5]" /></div>}
              {date === 13 && <div className="mt-[4px] flex gap-[2px]"><span className="w-[6px] h-[6px] rounded-full bg-[#534AB7]" /><span className="w-[6px] h-[6px] rounded-full bg-[#BA7517]" /></div>}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Date Legends ────────────────────────────────────────────────────────────
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

export default function DashboardPage() {
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
        <TopHeader />
        <KPICards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px] mb-[16px] items-stretch">
          <div className="col-span-1 flex flex-col"><PatientRiskAnalytics /></div>
          <div className="col-span-1 lg:col-span-2 flex flex-col"><PatientsStatistics /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr_200px] xl:grid-cols-[280px_1fr_220px] gap-[16px] pb-[32px] items-stretch">
          <div className="flex flex-col"><AppointmentOverview /></div>
          <div className="flex flex-col"><AppointmentCalendar /></div>
          <div className="flex flex-col"><DateLegends /></div>
        </div>
      </div>
    </div>
  );
}
