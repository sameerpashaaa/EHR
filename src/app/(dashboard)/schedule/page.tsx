"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MapPin,
  MoreVertical,
  Share2,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  PlayCircle,
  UserCheck,
  UserX,
  Phone,
  Mail,
  FileText,
  Stethoscope,
  Bell,
  MessageSquare,
  Printer,
  Plus,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: string;
  time: string; // "HH:MM" 24h
  duration: number; // minutes
  type: "consultation" | "follow-up" | "procedure" | "telehealth" | "urgent";
  status: "scheduled" | "checked-in" | "in-progress" | "completed" | "cancelled" | "no-show";
  provider: string;
  providerId: string;
  department: string;
  room: string;
  chiefComplaint: string;
  insurance: string;
  phone: string;
  email: string;
  isNewPatient: boolean;
  isRecurring: boolean;
  lastVisit?: string;
  vitals?: { bp?: string; hr?: number; temp?: number; weight?: number };
  // date in YYYY-MM-DD for calendar placement
  date: string;
  // avatar initials background (one of preset colors)
  avatarColor: string;
}

interface Provider {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

// ─────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const fmt = (d: Date) => d.toISOString().split("T")[0];
const dayOffset = (n: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return fmt(d);
};

const providers: Provider[] = [
  { id: "1", name: "Dr. Sarah Chen", role: "Cardiologist", initials: "SC", color: "#4CAF72" },
  { id: "2", name: "Dr. Michael Ross", role: "Primary Care", initials: "MR", color: "#2563eb" },
  { id: "3", name: "Dr. Emily Watson", role: "Pediatrician", initials: "EW", color: "#7c3aed" },
  { id: "4", name: "Dr. James Wilson", role: "Orthopedic Surgeon", initials: "JW", color: "#d97706" },
  { id: "5", name: "Dr. Lisa Park", role: "Dermatologist", initials: "LP", color: "#dc2626" },
];

const appointments: Appointment[] = [
  { id: "A01", patientName: "John Smith", patientId: "PT12345", age: 45, gender: "Male", time: "09:00", duration: 30, type: "follow-up", status: "checked-in", provider: "Dr. Sarah Chen", providerId: "1", department: "Cardiology", room: "Room 201", chiefComplaint: "Hypertension follow-up, medication review", insurance: "Blue Cross", phone: "(555) 123-4567", email: "john.smith@email.com", isNewPatient: false, isRecurring: true, lastVisit: "2024-01-15", date: dayOffset(0), avatarColor: "#4CAF72", vitals: { bp: "138/88", hr: 72, temp: 98.6, weight: 185 } },
  { id: "A02", patientName: "Maria Garcia", patientId: "PT12346", age: 32, gender: "Female", time: "09:30", duration: 45, type: "consultation", status: "in-progress", provider: "Dr. Michael Ross", providerId: "2", department: "Internal Medicine", room: "Room 105", chiefComplaint: "Chest pain, shortness of breath", insurance: "Aetna", phone: "(555) 234-5678", email: "maria.garcia@email.com", isNewPatient: true, isRecurring: false, date: dayOffset(0), avatarColor: "#2563eb" },
  { id: "A03", patientName: "Robert Johnson", patientId: "PT12347", age: 58, gender: "Male", time: "10:00", duration: 60, type: "procedure", status: "scheduled", provider: "Dr. James Wilson", providerId: "4", department: "Orthopedics", room: "Procedure Room 3", chiefComplaint: "Knee arthroscopy pre-op", insurance: "Medicare", phone: "(555) 345-6789", email: "robert.j@email.com", isNewPatient: false, isRecurring: false, date: dayOffset(0), avatarColor: "#d97706" },
  { id: "A04", patientName: "Emma Thompson", patientId: "PT12348", age: 28, gender: "Female", time: "11:00", duration: 30, type: "telehealth", status: "scheduled", provider: "Dr. Lisa Park", providerId: "5", department: "Dermatology", room: "Virtual", chiefComplaint: "Skin rash evaluation", insurance: "United Healthcare", phone: "(555) 456-7890", email: "emma.t@email.com", isNewPatient: false, isRecurring: false, date: dayOffset(0), avatarColor: "#dc2626" },
  { id: "A05", patientName: "David Lee", patientId: "PT12349", age: 6, gender: "Male", time: "11:30", duration: 30, type: "consultation", status: "scheduled", provider: "Dr. Emily Watson", providerId: "3", department: "Pediatrics", room: "Room 302", chiefComplaint: "Annual wellness check", insurance: "Kaiser", phone: "(555) 567-8901", email: "david.lee.parent@email.com", isNewPatient: false, isRecurring: true, lastVisit: "2023-08-20", date: dayOffset(0), avatarColor: "#7c3aed" },
  { id: "A06", patientName: "Sarah Williams", patientId: "PT12350", age: 52, gender: "Female", time: "14:00", duration: 30, type: "urgent", status: "checked-in", provider: "Dr. Michael Ross", providerId: "2", department: "Internal Medicine", room: "Room 106", chiefComplaint: "Severe abdominal pain", insurance: "Cigna", phone: "(555) 678-9012", email: "sarah.w@email.com", isNewPatient: false, isRecurring: false, date: dayOffset(0), avatarColor: "#2563eb" },
  { id: "A07", patientName: "Michael Brown", patientId: "PT12351", age: 67, gender: "Male", time: "15:00", duration: 45, type: "follow-up", status: "scheduled", provider: "Dr. Sarah Chen", providerId: "1", department: "Cardiology", room: "Room 202", chiefComplaint: "Post-MI follow-up", insurance: "Medicare Advantage", phone: "(555) 789-0123", email: "michael.b@email.com", isNewPatient: false, isRecurring: true, lastVisit: "2024-01-01", date: dayOffset(0), avatarColor: "#4CAF72", vitals: { bp: "142/90", hr: 68, temp: 98.4, weight: 195 } },
  // Tomorrow
  { id: "A08", patientName: "Linda Carter", patientId: "PT12352", age: 41, gender: "Female", time: "09:00", duration: 30, type: "consultation", status: "scheduled", provider: "Dr. Sarah Chen", providerId: "1", department: "Cardiology", room: "Room 201", chiefComplaint: "Annual cardiac checkup", insurance: "Blue Cross", phone: "(555) 891-2345", email: "linda.c@email.com", isNewPatient: false, isRecurring: true, date: dayOffset(1), avatarColor: "#4CAF72" },
  { id: "A09", patientName: "Tom Harris", patientId: "PT12353", age: 55, gender: "Male", time: "10:30", duration: 45, type: "follow-up", status: "scheduled", provider: "Dr. Emily Watson", providerId: "3", department: "Pediatrics", room: "Room 305", chiefComplaint: "Asthma follow-up", insurance: "Aetna", phone: "(555) 902-3456", email: "tom.h@email.com", isNewPatient: false, isRecurring: false, date: dayOffset(1), avatarColor: "#7c3aed" },
  { id: "A10", patientName: "Anna White", patientId: "PT12354", age: 29, gender: "Female", time: "13:00", duration: 30, type: "telehealth", status: "scheduled", provider: "Dr. Lisa Park", providerId: "5", department: "Dermatology", room: "Virtual", chiefComplaint: "Acne treatment review", insurance: "Cigna", phone: "(555) 013-4567", email: "anna.w@email.com", isNewPatient: true, isRecurring: false, date: dayOffset(1), avatarColor: "#dc2626" },
  { id: "A11", patientName: "George Evans", patientId: "PT12355", age: 72, gender: "Male", time: "14:30", duration: 60, type: "procedure", status: "scheduled", provider: "Dr. James Wilson", providerId: "4", department: "Orthopedics", room: "Procedure Room 1", chiefComplaint: "Hip replacement post-op evaluation", insurance: "Medicare", phone: "(555) 124-5678", email: "george.e@email.com", isNewPatient: false, isRecurring: true, date: dayOffset(1), avatarColor: "#d97706" },
  // Day +2
  { id: "A12", patientName: "Priya Nair", patientId: "PT12356", age: 35, gender: "Female", time: "08:30", duration: 30, type: "consultation", status: "scheduled", provider: "Dr. Michael Ross", providerId: "2", department: "Internal Medicine", room: "Room 108", chiefComplaint: "Thyroid level review", insurance: "United Healthcare", phone: "(555) 235-6789", email: "priya.n@email.com", isNewPatient: false, isRecurring: false, date: dayOffset(2), avatarColor: "#2563eb" },
  { id: "A13", patientName: "Carlos Mendez", patientId: "PT12357", age: 48, gender: "Male", time: "11:00", duration: 45, type: "urgent", status: "scheduled", provider: "Dr. Sarah Chen", providerId: "1", department: "Cardiology", room: "Room 203", chiefComplaint: "Chest palpitations", insurance: "Aetna", phone: "(555) 346-7890", email: "carlos.m@email.com", isNewPatient: true, isRecurring: false, date: dayOffset(2), avatarColor: "#4CAF72" },
  // Day -1
  { id: "A14", patientName: "Sophie Allen", patientId: "PT12358", age: 23, gender: "Female", time: "10:00", duration: 30, type: "consultation", status: "completed", provider: "Dr. Emily Watson", providerId: "3", department: "Pediatrics", room: "Room 301", chiefComplaint: "Routine checkup", insurance: "Kaiser", phone: "(555) 457-8901", email: "sophie.a@email.com", isNewPatient: false, isRecurring: false, date: dayOffset(-1), avatarColor: "#7c3aed" },
];

// ─────────────────────────────────────────────
// Utility Helpers
// ─────────────────────────────────────────────

function formatTime12(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function addMinutes(time24: string, minutes: number): string {
  const [h, m] = time24.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

function getDayOfMonth(dateStr: string): number {
  return new Date(dateStr + "T00:00:00").getDate();
}

function getMonthYear(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─────────────────────────────────────────────
// Avatar Component
// ─────────────────────────────────────────────

function Avatar({ initials, color, size = 28, ring = true }: { initials: string; color: string; size?: number; ring?: boolean }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: color + "22",
        border: ring ? `2px solid #fff` : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 700, color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const map: Record<string, { cls: string; label: string; Icon: any }> = {
    scheduled:    { cls: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]", label: "Scheduled", Icon: Clock },
    "checked-in": { cls: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]", label: "Checked In", Icon: CheckCircle },
    "in-progress":{ cls: "bg-[#fffbeb] text-[#d97706] border-[#fde68a]", label: "In Progress", Icon: AlertCircle },
    completed:    { cls: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]", label: "Completed", Icon: CheckCircle },
    cancelled:    { cls: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]", label: "Cancelled", Icon: XCircle },
    "no-show":    { cls: "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]", label: "No Show", Icon: AlertCircle },
  };
  const { cls, label, Icon } = map[status] || map.scheduled;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border", cls)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Status Actions (inline dropdown-style)
// ─────────────────────────────────────────────

function StatusActions({ appointment, onStatusChange }: { appointment: Appointment; onStatusChange: (id: string, s: Appointment["status"]) => void }) {
  const actions: { label: string; next: Appointment["status"]; cls: string; Icon: any }[] = [];
  if (appointment.status === "scheduled") {
    actions.push({ label: "Check In", next: "checked-in", cls: "bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe]", Icon: UserCheck });
    actions.push({ label: "No Show", next: "no-show", cls: "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]", Icon: UserX });
    actions.push({ label: "Cancel", next: "cancelled", cls: "border border-[#fecaca] text-[#dc2626] hover:bg-[#fef2f2]", Icon: XCircle });
  } else if (appointment.status === "checked-in") {
    actions.push({ label: "Start Encounter", next: "in-progress", cls: "bg-[#fffbeb] text-[#d97706] hover:bg-[#fef3c7]", Icon: PlayCircle });
  } else if (appointment.status === "in-progress") {
    actions.push({ label: "Complete", next: "completed", cls: "bg-[#f0fdf4] text-[#16a34a] hover:bg-[#dcfce7]", Icon: CheckCircle });
  }
  if (!actions.length) return null;
  return (
    <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-[#E0E0E0]">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={(e) => { e.stopPropagation(); onStatusChange(appointment.id, a.next); }}
          className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all", a.cls)}
        >
          <a.Icon className="w-3.5 h-3.5" />
          {a.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Event Card (left panel)
// ─────────────────────────────────────────────

function EventCard({
  appointment,
  onClick,
  onStatusChange,
  menuOpen,
  onMenuToggle,
}: {
  appointment: Appointment;
  onClick: () => void;
  onStatusChange: (id: string, s: Appointment["status"]) => void;
  menuOpen: boolean;
  onMenuToggle: (id: string | null) => void;
}) {
  const endTime = addMinutes(appointment.time, appointment.duration);
  const timeRange = `${formatTime12(appointment.time)} – ${formatTime12(endTime)}`;
  const provider = providers.find((p) => p.id === appointment.providerId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="relative rounded-xl px-4 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors group"
    >
      {/* Time Row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {/* Green dot indicator */}
          <span className="w-2 h-2 rounded-full bg-[#4CAF72] flex-shrink-0" />
          <span className="text-[12px] font-medium text-[#888888]">{timeRange}</span>
        </div>
        {/* Three-dot menu */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); onMenuToggle(menuOpen ? null : appointment.id); }}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[#E0E0E0] transition-all"
            aria-label="More options"
          >
            <MoreVertical className="w-3.5 h-3.5 text-[#888888]" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); onMenuToggle(null); }} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#E0E0E0] rounded-xl p-1 z-40 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                {appointment.status === "scheduled" && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); onStatusChange(appointment.id, "checked-in"); onMenuToggle(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#111111] hover:bg-[#f0fdf4] hover:text-[#4CAF72] rounded-lg transition-colors">
                      <UserCheck className="w-3.5 h-3.5" /> Check In
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onStatusChange(appointment.id, "cancelled"); onMenuToggle(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#dc2626] hover:bg-[#fef2f2] rounded-lg transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </>
                )}
                {appointment.status === "checked-in" && (
                  <button onClick={(e) => { e.stopPropagation(); onStatusChange(appointment.id, "in-progress"); onMenuToggle(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#d97706] hover:bg-[#fffbeb] rounded-lg transition-colors">
                    <PlayCircle className="w-3.5 h-3.5" /> Start Encounter
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-[#111111] mb-2 leading-snug">
        {appointment.chiefComplaint}
        {appointment.isNewPatient && (
          <span className="ml-2 text-[10px] font-semibold bg-[#f0fdf4] text-[#4CAF72] px-1.5 py-0.5 rounded-full">New</span>
        )}
      </h3>

      {/* Doctor Row */}
      {provider && (
        <div className="flex items-center gap-2 mb-1.5">
          <Avatar initials={provider.initials} color={provider.color} size={24} ring={false} />
          <span className="text-[13px] text-[#111111] font-medium">{provider.name}</span>
          <span className="text-[12px] text-[#888888]">· {provider.role}</span>
        </div>
      )}

      {/* Address / Room Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-[#888888] flex-shrink-0" />
          <span className="text-[12px] text-[#888888]">{appointment.room}</span>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded-md text-[#4CAF72] hover:bg-[#f0fdf4] transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Patient name subtle */}
      <div className="mt-1">
        <span className="text-[11px] text-[#888888]">{appointment.patientName} · {appointment.age}y · {appointment.gender}</span>
      </div>

      {/* Status + inline actions */}
      <div className="mt-2">
        <StatusBadge status={appointment.status} />
      </div>
      <StatusActions appointment={appointment} onStatusChange={onStatusChange} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Month Grid
// ─────────────────────────────────────────────

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MonthGrid({
  year,
  month,
  allAppointments,
  selectedDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  allAppointments: Appointment[];
  selectedDate: string;
  onSelectDate: (d: string) => void;
}) {
  const todayStr = fmt(TODAY);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { dateStr: string; isCurrentMonth: boolean }[] = [];

  // Prev month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrev - i);
    cells.push({ dateStr: fmt(d), isCurrentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ dateStr: fmt(new Date(year, month, d)), isCurrentMonth: true });
  }
  // Next month padding to fill 6 rows
  let nextDay = 1;
  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push({ dateStr: fmt(new Date(year, month + 1, nextDay++)), isCurrentMonth: false });
    if (cells.length >= 42) break;
  }

  const aptsByDate = allAppointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    acc[a.date] = acc[a.date] || [];
    acc[a.date].push(a);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-auto">
      {/* DOW header */}
      <div className="grid grid-cols-7 border-b border-[#E0E0E0]">
        {DOW.map((d) => (
          <div key={d} className="py-2 text-center text-[12px] font-medium text-[#888888]">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map(({ dateStr, isCurrentMonth }) => {
          const apts = aptsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const visible = apts.slice(0, 2);
          const overflow = apts.length - visible.length;

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "min-h-[80px] p-2 border-r border-b border-[#E0E0E0] cursor-pointer transition-colors",
                isToday ? "bg-[#f0fdf4]" : isCurrentMonth ? "bg-white hover:bg-[#F5F5F5]" : "bg-[#F5F5F5] opacity-60",
                isSelected && !isToday && "bg-[#f0fdf4] ring-1 ring-inset ring-[#4CAF72]/40"
              )}
            >
              <p className={cn("text-[12px] font-medium mb-1.5", isToday ? "text-[#4CAF72] font-bold" : isCurrentMonth ? "text-[#111111]" : "text-[#888888]")}>
                {getDayOfMonth(dateStr)}
              </p>

              {/* Avatar stack */}
              {visible.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {visible.map((a) => {
                    const p = providers.find((x) => x.id === a.providerId);
                    return (
                      <div key={a.id} className="flex items-center gap-1">
                        {p && (
                          <div
                            style={{ width: 16, height: 16, borderRadius: "50%", background: p.color + "22", border: "1.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: p.color, flexShrink: 0 }}
                          >
                            {p.initials[0]}
                          </div>
                        )}
                        <span className="text-[10px] text-[#888888] truncate">{formatTime12(a.time)}</span>
                      </div>
                    );
                  })}
                  {overflow > 0 && (
                    <span className="text-[10px] font-semibold text-[#888888] bg-[#E0E0E0] rounded-full px-1.5 w-fit">
                      +{overflow}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Day Timeline
// ─────────────────────────────────────────────

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 – 19:00

function DayTimeline({
  dateStr,
  dayAppointments,
  onSelect,
}: {
  dateStr: string;
  dayAppointments: Appointment[];
  onSelect: (a: Appointment) => void;
}) {
  const CELL_HEIGHT = 64; // px per hour

  function topPx(time: string) {
    const [h, m] = time.split(":").map(Number);
    return (h - 7) * CELL_HEIGHT + (m / 60) * CELL_HEIGHT;
  }

  function heightPx(duration: number) {
    return Math.max((duration / 60) * CELL_HEIGHT - 4, 24);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex">
        {/* Time gutter */}
        <div className="w-20 flex-shrink-0">
          {HOURS.map((h) => (
            <div key={h} className="h-16 flex items-start justify-end pr-3 pt-1">
              <span className="text-[11px] font-medium text-[#888888]">
                {h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`}
              </span>
            </div>
          ))}
        </div>

        {/* Grid + events */}
        <div className="flex-1 relative border-l border-[#E0E0E0]">
          {HOURS.map((h) => (
            <div key={h} className="h-16 border-t border-[#E0E0E0]" />
          ))}

          {dayAppointments.map((apt, idx) => {
            const provider = providers.find((p) => p.id === apt.providerId);
            const top = topPx(apt.time);
            const height = heightPx(apt.duration);

            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.15 }}
                style={{ top, height, left: 4, right: 4 }}
                onClick={() => onSelect(apt)}
                className="absolute bg-[#111111] rounded-xl px-3 py-2 cursor-pointer hover:bg-[#1a1a1a] transition-colors overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF72] flex-shrink-0" />
                      <span className="text-[11px] text-white/70">{formatTime12(apt.time)}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-white truncate leading-snug">{apt.chiefComplaint}</p>
                    {height > 48 && provider && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {provider.initials[0]}
                        </div>
                        <span className="text-[11px] text-white/70 truncate">{provider.name}</span>
                      </div>
                    )}
                    {height > 72 && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-2.5 h-2.5 text-white/50 flex-shrink-0" />
                        <span className="text-[10px] text-white/50 truncate">{apt.room}</span>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Appointment Detail Modal
// ─────────────────────────────────────────────

function AppointmentModal({
  appointment,
  onClose,
  onStatusChange,
}: {
  appointment: Appointment;
  onClose: () => void;
  onStatusChange: (id: string, s: Appointment["status"]) => void;
}) {
  const provider = providers.find((p) => p.id === appointment.providerId);
  const endTime = addMinutes(appointment.time, appointment.duration);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto border border-[#E0E0E0]"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E0E0E0] px-6 py-5 flex items-start justify-between z-10">
          <div className="flex items-center gap-4">
            <div
              style={{ width: 52, height: 52, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #E0E0E0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#4CAF72", flexShrink: 0 }}
            >
              {appointment.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#111111]">{appointment.patientName}</h2>
              <p className="text-[13px] text-[#888888]">{appointment.patientId} · {appointment.age}y · {appointment.gender}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge status={appointment.status} />
                {appointment.isNewPatient && (
                  <span className="text-[11px] font-semibold bg-[#f0fdf4] text-[#4CAF72] px-2 py-0.5 rounded-full">New Patient</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#888888]" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Date & Time", value: `${formatTime12(appointment.time)} – ${formatTime12(endTime)}`, sub: `${appointment.duration} min` },
              { label: "Provider", value: appointment.provider, sub: appointment.department },
              { label: "Location", value: appointment.room, sub: "Main Campus" },
              { label: "Insurance", value: appointment.insurance, sub: "Verified" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="p-4 bg-[#F5F5F5] rounded-xl">
                <p className="text-[12px] text-[#888888] mb-0.5">{label}</p>
                <p className="text-[14px] font-semibold text-[#111111]">{value}</p>
                <p className="text-[12px] text-[#888888]">{sub}</p>
              </div>
            ))}
          </div>

          {/* Chief Complaint */}
          <div>
            <h3 className="font-semibold text-[#111111] mb-2 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#4CAF72]" />
              Chief Complaint
            </h3>
            <p className="p-4 bg-[#F5F5F5] rounded-xl text-[14px] text-[#111111]">{appointment.chiefComplaint}</p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-[#111111] mb-2">Contact Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
                <Phone className="w-4 h-4 text-[#888888]" />
                <div>
                  <p className="text-[11px] text-[#888888]">Phone</p>
                  <p className="text-[13px] font-medium text-[#111111]">{appointment.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] rounded-xl">
                <Mail className="w-4 h-4 text-[#888888]" />
                <div>
                  <p className="text-[11px] text-[#888888]">Email</p>
                  <p className="text-[13px] font-medium text-[#111111] truncate">{appointment.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals */}
          {appointment.vitals && (
            <div>
              <h3 className="font-semibold text-[#111111] mb-2">Pre-Visit Vitals</h3>
              <div className="grid grid-cols-4 gap-3">
                {appointment.vitals.bp && (
                  <div className="p-3 bg-[#eff6ff] rounded-xl text-center">
                    <p className="text-[18px] font-bold text-[#2563eb]">{appointment.vitals.bp}</p>
                    <p className="text-[11px] text-[#888888]">Blood Pressure</p>
                  </div>
                )}
                {appointment.vitals.hr && (
                  <div className="p-3 bg-[#f0fdf4] rounded-xl text-center">
                    <p className="text-[18px] font-bold text-[#16a34a]">{appointment.vitals.hr}</p>
                    <p className="text-[11px] text-[#888888]">Heart Rate</p>
                  </div>
                )}
                {appointment.vitals.temp && (
                  <div className="p-3 bg-[#fffbeb] rounded-xl text-center">
                    <p className="text-[18px] font-bold text-[#d97706]">{appointment.vitals.temp}°F</p>
                    <p className="text-[11px] text-[#888888]">Temperature</p>
                  </div>
                )}
                {appointment.vitals.weight && (
                  <div className="p-3 bg-[#faf5ff] rounded-xl text-center">
                    <p className="text-[18px] font-bold text-[#7c3aed]">{appointment.vitals.weight}</p>
                    <p className="text-[11px] text-[#888888]">Weight (lbs)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {appointment.lastVisit && (
            <p className="text-[13px] text-[#888888]">Last visit: {appointment.lastVisit}</p>
          )}

          {/* Inline Status Actions */}
          <StatusActions appointment={appointment} onStatusChange={(id, s) => { onStatusChange(id, s); onClose(); }} />
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-[#E0E0E0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 text-[13px] h-9 border-[#E0E0E0]">
              <MessageSquare className="w-4 h-4" /> Message
            </Button>
            <Button variant="outline" className="gap-2 text-[13px] h-9 border-[#E0E0E0]">
              <Bell className="w-4 h-4" /> Remind
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 text-[13px] h-9 border-[#E0E0E0]">
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button className="gap-2 text-[13px] h-9 bg-[#111111] text-white hover:bg-[#222222]">
              <FileText className="w-4 h-4" /> Start Encounter
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function SchedulePage() {
  const todayStr = fmt(TODAY);

  // View state
  const [calView, setCalView] = useState<"month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [calYear, setCalYear] = useState(TODAY.getFullYear());
  const [calMonth, setCalMonth] = useState(TODAY.getMonth());

  // Panel state (for responsive mobile toggle)
  const [mobilePanel, setMobilePanel] = useState<"agenda" | "calendar">("agenda");

  // Agenda filter state
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow" | "custom">("today");
  const [customTabDate, setCustomTabDate] = useState(dayOffset(2));

  // UI state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [aptList, setAptList] = useState<Appointment[]>(appointments);
  const [syncSpin, setSyncSpin] = useState(false);

  const handleStatusChange = useCallback((id: string, status: Appointment["status"]) => {
    setAptList((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setSelectedAppointment((prev) => (prev?.id === id ? { ...prev, status } : prev));
  }, []);

  const handleSync = () => {
    setSyncSpin(true);
    setTimeout(() => setSyncSpin(false), 800);
  };

  // Determine which date the agenda tab is showing
  const agendaDate = activeTab === "today" ? todayStr : activeTab === "tomorrow" ? dayOffset(1) : customTabDate;

  // Filter appointments for the agenda panel
  const agendaApts = aptList
    .filter((a) => a.date === agendaDate)
    .filter((a) =>
      search === "" ||
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.chiefComplaint.toLowerCase().includes(search.toLowerCase()) ||
      a.provider.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  // Count for tab pills
  const countFor = (d: string) => aptList.filter((a) => a.date === d).length;

  // Calendar day appointments
  const dayApts = aptList.filter((a) => a.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  // Navigate months
  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  const handleSelectCalDay = (d: string) => {
    setSelectedDate(d);
    setCalView("day");
    // Sync agenda tab
    const diff = Math.round((new Date(d + "T00:00:00").getTime() - TODAY.getTime()) / 86400000);
    if (diff === 0) setActiveTab("today");
    else if (diff === 1) setActiveTab("tomorrow");
    else { setActiveTab("custom"); setCustomTabDate(d); }
  };

  // Tab label for custom date
  const customLabel = new Date(customTabDate + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short" });

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] -m-4 lg:-m-5 overflow-hidden">
      {/* ── Left Panel: Agenda ── */}
      <div className={cn(
        "flex flex-col bg-white border-r border-[#E0E0E0] flex-shrink-0 overflow-hidden",
        "w-full lg:w-[360px] xl:w-[380px]",
        mobilePanel === "calendar" ? "hidden lg:flex" : "flex"
      )}>
        {/* Panel Header */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          {/* Date label */}
          <p className="text-[12px] font-medium text-[#888888] mb-1">{formatDateLabel(agendaDate)}</p>

          {/* Display heading */}
          <h1 className="text-[22px] font-bold text-[#111111] leading-tight mb-4">
            You Have{" "}
            <span className="text-[#4CAF72]">{countFor(agendaDate)}</span>{" "}
            {countFor(agendaDate) === 1 ? "Appointment" : "Appointments"} {activeTab === "today" ? "Today" : activeTab === "tomorrow" ? "Tomorrow" : "This Day"}
          </h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input
              type="text"
              placeholder="Search event, meetings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-[#F5F5F5] border border-[#E0E0E0] rounded-lg text-[13px] text-[#111111] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#4CAF72]/20 focus:border-[#4CAF72] transition-colors"
            />
          </div>

          {/* Date Tab Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(["today", "tomorrow", "custom"] as const).map((tab) => {
              const label = tab === "today" ? "Today" : tab === "tomorrow" ? "Tomorrow" : customLabel;
              const count = countFor(tab === "today" ? todayStr : tab === "tomorrow" ? dayOffset(1) : customTabDate);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-shrink-0 h-8 px-3.5 rounded-full text-[12px] font-semibold transition-all",
                    activeTab === tab
                      ? "bg-[#111111] text-white"
                      : "bg-transparent text-[#888888] hover:bg-[#F5F5F5]"
                  )}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile toggle to calendar */}
        <div className="lg:hidden px-6 pb-3 flex-shrink-0">
          <button
            onClick={() => setMobilePanel("calendar")}
            className="flex items-center gap-2 text-[13px] text-[#4CAF72] font-medium"
          >
            <Calendar className="w-4 h-4" />
            View Calendar
          </button>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto px-2 pb-6">
          <AnimatePresence mode="popLayout">
            {agendaApts.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-3">
                  <Calendar className="w-7 h-7 text-[#888888]" />
                </div>
                <p className="text-[15px] font-semibold text-[#111111]">No appointments</p>
                <p className="text-[13px] text-[#888888] mt-1">No appointments found for this day</p>
              </motion.div>
            ) : (
              agendaApts.map((apt) => (
                <EventCard
                  key={apt.id}
                  appointment={apt}
                  onClick={() => setSelectedAppointment(apt)}
                  onStatusChange={handleStatusChange}
                  menuOpen={openMenuId === apt.id}
                  onMenuToggle={setOpenMenuId}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* New Appointment Button */}
        <div className="px-6 py-4 border-t border-[#E0E0E0] flex-shrink-0">
          <Button className="w-full gap-2 bg-[#111111] text-white hover:bg-[#222222] text-[13px] h-10">
            <Plus className="w-4 h-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* ── Right Panel: Calendar ── */}
      <div className={cn(
        "flex flex-col flex-1 bg-[#F5F5F5] overflow-hidden",
        mobilePanel === "agenda" ? "hidden lg:flex" : "flex"
      )}>
        {/* Calendar Topbar */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-[#E0E0E0]">
          {/* Mobile back to agenda */}
          <button
            onClick={() => setMobilePanel("agenda")}
            className="lg:hidden flex items-center gap-1 text-[13px] text-[#4CAF72] font-medium mr-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Agenda
          </button>

          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors" aria-label="Previous month">
              <ChevronLeft className="w-4 h-4 text-[#888888]" />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors" aria-label="Next month">
              <ChevronRight className="w-4 h-4 text-[#888888]" />
            </button>
            <span className="text-[15px] font-semibold text-[#111111] mx-1">
              {getMonthYear(calYear, calMonth)}
            </span>
            <button onClick={handleSync} className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors" aria-label="Sync calendar">
              <RefreshCw className={cn("w-4 h-4 text-[#888888] transition-transform", syncSpin && "animate-spin")} />
            </button>
          </div>

          {/* Day / Month toggle */}
          <div className="flex items-center bg-[#E0E0E0] rounded-lg p-0.5">
            {(["day", "month"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setCalView(v)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all capitalize",
                  calView === v ? "bg-white text-[#111111] border border-[#E0E0E0]" : "text-[#888888] hover:text-[#111111]"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Day header (when in Day view) */}
        {calView === "day" && (
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white border-b border-[#E0E0E0]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const prev = new Date(selectedDate + "T00:00:00");
                  prev.setDate(prev.getDate() - 1);
                  setSelectedDate(fmt(prev));
                }}
                className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-[#888888]" />
              </button>
              <p className="text-[14px] font-semibold text-[#111111]">{formatDateLabel(selectedDate)}</p>
              <button
                onClick={() => {
                  const next = new Date(selectedDate + "T00:00:00");
                  next.setDate(next.getDate() + 1);
                  setSelectedDate(fmt(next));
                }}
                className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-[#888888]" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#888888]">{dayApts.length} appointment{dayApts.length !== 1 ? "s" : ""}</span>
              <button
                onClick={() => { setSelectedDate(todayStr); setCalMonth(TODAY.getMonth()); setCalYear(TODAY.getFullYear()); }}
                className="text-[12px] font-medium text-[#4CAF72] hover:underline"
              >
                Today
              </button>
            </div>
          </div>
        )}

        {/* Calendar Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white mx-0">
          <AnimatePresence mode="wait">
            {calView === "month" ? (
              <motion.div key="month" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="flex-1 flex flex-col overflow-hidden">
                <MonthGrid
                  year={calYear}
                  month={calMonth}
                  allAppointments={aptList}
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectCalDay}
                />
              </motion.div>
            ) : (
              <motion.div key="day" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="flex-1 flex flex-col overflow-hidden">
                <DayTimeline
                  dateStr={selectedDate}
                  dayAppointments={dayApts}
                  onSelect={setSelectedAppointment}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <AppointmentModal
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
