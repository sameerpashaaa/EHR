"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Users,
  Building,
  Stethoscope,
  Heart,
  TrendingUp,
  TrendingDown,
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

// --- Subcomponents ---

function TopHeader() {
  return (
    <div className="flex items-center justify-between mb-[16px]">
      <div className="flex items-center gap-[8px] bg-white rounded-[8px] border-[0.5px] border-[rgba(0,0,0,0.08)] p-[8px]">
        <Link href="/" className="flex items-center gap-[8px] px-[12px] py-[8px] rounded-[6px] bg-[#f8fafc] text-[12px] font-[500] text-[#0f172a] hover:bg-[#e2e8f0] transition-colors">
          <Menu className="w-3.5 h-3.5" />
          Dashboard
          <Star className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
        </Link>
      </div>
      <div className="flex items-center gap-[12px]">
        <Link href="/schedule" className="flex items-center gap-[8px] px-[12px] py-[8px] bg-[#1D9E75] text-white text-[12px] font-[500] rounded-[8px] hover:bg-[#168a65] transition-all active:scale-95">
          <Plus className="w-3.5 h-3.5" />
          Add new appointment
        </Link>
        <div className="flex items-center gap-[8px] px-[12px] py-[8px] bg-white border-[0.5px] border-[rgba(0,0,0,0.08)] rounded-[8px] text-[12px] font-[500] text-[#94a3b8]">
          10 Feb, 2025
          <Calendar className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

function KPICards() {
  const kpis = [
    {
      title: "Appointments",
      value: "98",
      icon: Calendar,
      color: { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]" },
      trend: "up",
      sub: "↑ 80% annual · 34 new",
      href: "/schedule"
    },
    {
      title: "Total patients",
      value: "87",
      icon: Users,
      color: { bg: "bg-[#E6F1FB]", text: "text-[#185FA5]" },
      trend: "down",
      sub: "↓ 12% annual · 29 new",
      href: "/patients"
    },
    {
      title: "Overall rooms",
      value: "112",
      icon: Building,
      color: { bg: "bg-[#FAEEDA]", text: "text-[#854F0B]" },
      trend: "flat",
      sub: "— 82 general · 30 private",
      href: "#"
    },
    {
      title: "Doctors on duty",
      value: "76",
      icon: Stethoscope,
      color: { bg: "bg-[#EEEDFE]", text: "text-[#534AB7]" },
      trend: "up",
      sub: "↑ 72 available · 4 leave",
      href: "#"
    },
    {
      title: "Treatments",
      value: "64",
      icon: Heart,
      color: { bg: "bg-[#FBEAF0]", text: "text-[#993556]" },
      trend: "up",
      sub: "↑ 30 ops · 34 general",
      href: "/prescribe"
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-[12px] mb-[16px] items-stretch">
      {kpis.map((kpi, idx) => (
        <Link href={kpi.href || "#"} key={idx} className="bg-white border-[0.5px] border-[rgba(0,0,0,0.08)] rounded-[12px] px-[16px] py-[14px] hover:border-[#1D9E75] hover:shadow-sm transition-all flex flex-col h-full w-full">
          <div className="flex items-start justify-between mb-[12px]">
            <div className="flex items-center gap-[12px]">
              <div className={cn("w-[32px] h-[32px] rounded-[6px] flex items-center justify-center", kpi.color.bg)}>
                <kpi.icon className={cn("w-[16px] h-[16px]", kpi.color.text)} />
              </div>
              <div>
                <p className="text-[14px] font-[500] text-[#0f172a]">{kpi.title}</p>
              </div>
            </div>
            {kpi.trend === "up" && <ArrowUpRight className="w-4 h-4 text-[#1D9E75]" />}
            {kpi.trend === "down" && <ArrowDownRight className="w-4 h-4 text-[#E24B4A]" />}
            {kpi.trend === "flat" && <Minus className="w-4 h-4 text-[#94a3b8]" />}
          </div>
          <div className="flex flex-col gap-[4px] mt-auto pt-[8px]">
            <span className="text-[26px] font-[500] text-[#0f172a] leading-none">{kpi.value}</span>
            <span className="text-[11px] text-[#94a3b8] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{kpi.sub}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function PatientRiskAnalytics() {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  
  // Values: High(12), Moderate(25), Low(78). Total: 115
  const total = 115;
  const highPct = 12 / total;
  const modPct = 25 / total;
  const lowPct = 78 / total;

  const lowOffset = circumference;
  const modOffset = circumference - (lowPct * circumference);
  const highOffset = circumference - ((lowPct + modPct) * circumference);

  return (
    <div className="bg-white rounded-[12px] border-[0.5px] border-[rgba(0,0,0,0.08)] p-[20px] flex flex-col flex-1 w-full h-full">
      <div className="mb-[16px]">
        <h2 className="text-[14px] font-[500] text-[#0f172a]">Patient risk analytics</h2>
        <p className="text-[12px] text-[#94a3b8]">Identifies high-risk patients based on predictive analytics</p>
      </div>

      <div className="flex items-center gap-[20px] mb-[16px] flex-1">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between py-[8px] border-b-[0.5px] border-[rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-[8px]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#E24B4A]" />
              <span className="text-[13px] font-[500] text-[#0f172a]">High risk</span>
              <span className="text-[13px] font-[500] text-[#0f172a]">12</span>
            </div>
            <div className="bg-[#FAECE7] text-[#993C1D] text-[10px] font-[500] px-[8px] py-[2px] rounded-full flex items-center gap-[4px]">
               ↑ 3%
            </div>
          </div>
          <div className="flex items-center justify-between py-[8px] border-b-[0.5px] border-[rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-[8px]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#378ADD]" />
              <span className="text-[13px] font-[500] text-[#0f172a]">Moderate risk</span>
              <span className="text-[13px] font-[500] text-[#0f172a]">25</span>
            </div>
            <div className="bg-[#E1F5EE] text-[#0F6E56] text-[10px] font-[500] px-[8px] py-[2px] rounded-full flex items-center gap-[4px]">
               ↓ 2
            </div>
          </div>
          <div className="flex items-center justify-between py-[8px]">
            <div className="flex items-center gap-[8px]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#1D9E75]" />
              <span className="text-[13px] font-[500] text-[#0f172a]">Low risk</span>
              <span className="text-[13px] font-[500] text-[#0f172a]">78</span>
            </div>
            <div className="bg-[#E1F5EE] text-[#0F6E56] text-[10px] font-[500] px-[8px] py-[2px] rounded-full flex items-center gap-[4px]">
               ↑ 87%
            </div>
          </div>
        </div>

        <div className="relative w-[120px] h-[120px] flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#F5F5F3" strokeWidth="12" />
            <circle
              cx="60" cy="60" r={radius} fill="none" stroke="#1D9E75" strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference)} 
              className="transition-all duration-1000 ease-out"
            />
             <circle
              cx="60" cy="60" r={radius} fill="none" stroke="#378ADD" strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={modOffset}
              className="transition-all duration-1000 ease-out"
            />
             <circle
              cx="60" cy="60" r={radius} fill="none" stroke="#E24B4A" strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={highOffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[9px] text-[#94a3b8] leading-none mb-[2px]">patients</span>
            <span className="text-[14px] font-[700] text-[#0f172a] leading-none">115</span>
          </div>
        </div>
      </div>

      <div className="bg-[#F5F5F5] rounded-[8px] px-[14px] py-[12px] mt-auto">
        <div className="mb-[8px]">
          <span className="inline-block bg-[#E6F1FB] text-[#185FA5] text-[10px] font-[500] px-[8px] py-[2px] rounded-full">
             AI insights
          </span>
        </div>
        <ul className="text-[12px] text-[#475569] space-y-[4px]">
          <li className="flex items-center gap-[8px]"><span className="text-[#1D9E75] font-bold">·</span> Sepsis risk detected in 3 patients</li>
          <li className="flex items-center gap-[8px]"><span className="text-[#1D9E75] font-bold">·</span> Chronic disease alert for 7 patients</li>
          <li className="flex items-center gap-[8px]"><span className="text-[#1D9E75] font-bold">·</span> Model confidence: 92%</li>
        </ul>
      </div>
    </div>
  );
}

function PatientsStatistics() {
  const stats = [
    { label: "Emergency patient", value: 56, color: "#E24B4A" },
    { label: "Routine check-up", value: 45, color: "#534AB7" },
    { label: "Appointment", value: 34, color: "#1D9E75" },
    { label: "Physical therapy", value: 20, color: "#BA7517" },
    { label: "Therapy session", value: 16, color: "#185FA5" },
  ];

  return (
    <div className="bg-white rounded-[12px] border-[0.5px] border-[rgba(0,0,0,0.08)] p-[20px] flex flex-col flex-1 w-full h-full">
      <div className="mb-[20px]">
        <h2 className="text-[14px] font-[500] text-[#0f172a]">Patients statistics</h2>
        <p className="text-[12px] text-[#94a3b8]">Figuring out stats for better health choices</p>
      </div>

      <div className="flex-1 flex items-end gap-[16px] px-[16px] pb-[16px]">
        {stats.map((stat, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-[200px]">
            <span className="text-[12px] font-[500] text-[#0f172a] mb-[8px]">{stat.value}%</span>
            <div 
              className="w-full rounded-t-[4px] transition-all"
              style={{ height: `${stat.value}%`, backgroundColor: stat.color }}
            />
            <div className="w-full h-px bg-[#e2e8f0] mt-[4px]" />
            <div className="mt-[8px] flex flex-col items-center text-center h-[28px] justify-start">
              <span className="w-[8px] h-[8px] rounded-full mb-[4px] flex-shrink-0" style={{backgroundColor: stat.color}}></span>
              <span className="text-[11px] font-[400] text-[#475569] leading-tight truncate w-full px-1">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t-[0.5px] border-[rgba(0,0,0,0.08)] pt-[16px] mt-[16px] flex items-center justify-between px-[16px]">
        <div className="flex flex-col">
          <span className="text-[11px] text-[#94a3b8] mb-[4px]">Total scheduled</span>
          <span className="text-[18px] font-[500] text-[#0f172a]">1,025</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-[#94a3b8] mb-[4px]">Completed</span>
          <span className="text-[18px] font-[500] text-[#1D9E75]">780</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] text-[#94a3b8] mb-[4px]">Missed</span>
          <span className="text-[18px] font-[500] text-[#E24B4A]">245</span>
        </div>
      </div>
    </div>
  );
}

function AppointmentOverview() {
  const appointments = [
    { time: "7:26 AM", name: "Jordan Rivers", type: "Migraine", status: "success", color: "#1D9E75", initial: "J" },
    { time: "1:12 PM", name: "Taylor Green", type: "Throbbing Pain", status: "danger", color: "#E24B4A", initial: "T" },
    { time: "6:11 PM", name: "Casey Blue", type: "Pounding Sensation", status: "info", color: "#185FA5", initial: "C" },
    { time: "2:31 PM", name: "Morgan Sky", type: "Tension Ache", status: "info", color: "#185FA5", initial: "M" },
  ];

  return (
    <div className="bg-white rounded-[12px] border-[0.5px] border-[rgba(0,0,0,0.08)] p-[16px] flex flex-col flex-1 w-full h-full">
      <div className="flex items-center justify-between mb-[16px] flex-shrink-0">
        <div>
          <h2 className="text-[14px] font-[500] text-[#0f172a]">Appointment overview</h2>
          <p className="text-[12px] text-[#94a3b8]">Smart health appointment schedule</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#94a3b8]" />
      </div>

      <div className="space-y-[4px] flex-1">
        {appointments.map((apt, i) => (
          <Link href="/patients/P-2024-001" key={i} className="flex items-center gap-[12px] hover:bg-[#F5F5F3] p-[12px] -mx-[12px] rounded-[8px] transition-colors">
             <span className="text-[11px] font-[500] text-[#94a3b8] w-[50px]">{apt.time}</span>
             <div className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: apt.color }} />
             <div className="w-[32px] h-[32px] rounded-full bg-[#f1f5f9] flex items-center justify-center flex-shrink-0 text-[12px] font-[500] text-[#64748b]">
               {apt.initial}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-[13px] font-[500] text-[#0f172a] truncate">{apt.name}</p>
               <p className="text-[11px] text-[#94a3b8] truncate">{apt.type}</p>
             </div>
             <div className={cn("w-[24px] h-[24px] rounded-[6px] flex items-center justify-center flex-shrink-0", 
                apt.status === 'success' ? 'bg-[#E1F5EE] text-[#0F6E56]' :
                apt.status === 'danger' ? 'bg-[#FAECE7] text-[#993C1D]' : 'bg-[#E6F1FB] text-[#185FA5]'
             )}>
                {apt.status === 'success' ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
             </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AppointmentCalendar() {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const dates = Array.from({ length: 35 }, (_, i) => i - 4);

  return (
    <div className="bg-white rounded-[12px] border-[0.5px] border-[rgba(0,0,0,0.08)] p-[16px] flex flex-col flex-1 w-full h-full">
      <div className="flex items-center justify-between mb-[16px] flex-shrink-0">
        <div>
           <h2 className="text-[14px] font-[500] text-[#0f172a]">Appointment calendar</h2>
           <p className="text-[12px] text-[#94a3b8]">Schedule your health appointments with ease</p>
        </div>
        <button className="p-[4px] rounded-[6px] hover:bg-[#f8fafc] border-[0.5px] border-[rgba(0,0,0,0.08)]">
          <span className="w-4 h-4 flex items-center justify-center text-[#94a3b8]">⤢</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-[16px] mb-[16px]">
        <button className="p-1 text-[#94a3b8] hover:text-[#0f172a]"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-[13px] font-[500] text-[#0f172a]">February 2025</span>
        <button className="p-1 text-[#94a3b8] hover:text-[#0f172a]"><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-7 gap-y-[16px] gap-x-[8px] text-center flex-1">
        {days.map((d) => (
          <div key={d} className="text-[10px] font-[500] text-[#94a3b8] mb-[8px]">{d}</div>
        ))}
        {dates.map((date, i) => {
          const isCurrentMonth = date > 0 && date <= 28;
          const isToday = date === 18;
          const displayDate = date > 0 && date <= 28 ? date : date <= 0 ? 31 + date : date - 28;

          return (
            <div key={i} className={cn("relative flex flex-col items-center justify-start min-h-[40px] pt-[4px] rounded-[6px] hover:bg-[#f8fafc] transition-colors cursor-pointer",
              !isCurrentMonth && "opacity-40"
            )}>
              <span className={cn("w-[24px] h-[24px] flex items-center justify-center rounded-full text-[12px] font-[500]", 
                isToday ? "bg-[#1D9E75] text-white" : "text-[#0f172a]"
              )}>
                {displayDate}
              </span>

              {date === 4 && (
                <div className="mt-[4px] flex gap-[2px]">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#E24B4A]" />
                </div>
              )}
               {date === 11 && (
                <div className="mt-[4px] flex gap-[2px]">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#185FA5]" />
                </div>
              )}
               {date === 13 && (
                <div className="mt-[4px] flex gap-[2px]">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#534AB7]" />
                  <span className="w-[6px] h-[6px] rounded-full bg-[#BA7517]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DateLegends() {
  const legends = [
    { color: "#E24B4A", label: "Emergency patient meet" },
    { color: "#1D9E75", label: "Physical appointment" },
    { color: "#185FA5", label: "Normal health checkups" },
    { color: "#534AB7", label: "Routine vaccination" },
    { color: "#BA7517", label: "Dental cleaning" },
    { color: "#0F6E56", label: "Lab test follow-up" },
    { color: "#993556", label: "Blood pressure monitoring" },
  ];

  return (
    <div className="bg-white rounded-[12px] border-[0.5px] border-[rgba(0,0,0,0.08)] p-[16px] flex flex-col flex-1 w-full h-full">
      <div className="mb-[20px] flex-shrink-0">
        <h2 className="text-[14px] font-[500] text-[#0f172a]">Date legends</h2>
        <p className="text-[12px] text-[#94a3b8]">Effortlessly plan your health check-ups</p>
      </div>

      <div className="flex-1 flex flex-col gap-[12px]">
        {legends.map((item, i) => (
          <div key={i} className="flex items-center gap-[12px]">
            <span className="w-[10px] h-[10px] rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[12px] font-[500] text-[#475569]">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-auto pt-[16px]">
        <Link href="/schedule" className="w-full flex items-center justify-center bg-[#E1F5EE] text-[#0F6E56] rounded-[8px] py-[8px] text-[12px] font-[500] hover:bg-[#1D9E75] hover:text-white transition-colors">
           Add appointment +
        </Link>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="bg-[#F5F5F3] min-h-screen p-[20px]">
      <div className="max-w-[1400px] mx-auto w-full">
        <TopHeader />
        <KPICards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px] mb-[16px] items-stretch">
          <div className="col-span-1 flex flex-col">
             <PatientRiskAnalytics />
          </div>
          <div className="col-span-1 lg:col-span-2 flex flex-col">
             <PatientsStatistics />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr_200px] xl:grid-cols-[280px_1fr_220px] gap-[16px] pb-[32px] items-stretch">
          <div className="flex flex-col">
             <AppointmentOverview />
          </div>
          <div className="flex flex-col">
             <AppointmentCalendar />
          </div>
          <div className="flex flex-col">
             <DateLegends />
          </div>
        </div>
      </div>
    </div>
  );
}
