"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Phone, Video, MessageSquare, MoreVertical, Bell, Plus,
  Cake, User, Languages, MapPin, AlertCircle, MoreHorizontal,
  Activity, Pill, FlaskConical, FileText, Calendar,
  Stethoscope, BrainCircuit, CheckCircle, TrendingUp, TrendingDown,
  Minus, Eye, UploadCloud, Waves, Sparkles, AlertTriangle,
} from "lucide-react";
import { MOCK_PATIENTS, MOCK_VITALS, MOCK_LABS, MOCK_MEDICATIONS, MOCK_PROBLEMS, MOCK_ENCOUNTERS } from "@/data/mockPatients";
import { usePatient } from "@/hooks/usePatients";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { hasPermission, Permission } from "@/lib/auth/roles";
import PermissionGate from "@/components/ui/PermissionGate";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDob(dob: string): string {
  const d = new Date(dob);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

const ALLERGY_COLORS: Record<string, { bg: string; color: string }> = {
  "🥜": { bg: "#FEF3C7", color: "#92400E" },
  "💊": { bg: "#EEF2FF", color: "#3730A3" },
  "🌾": { bg: "#FEF9C3", color: "#713F12" },
  "🌺": { bg: "#FDF2F8", color: "#831843" },
  "🐟": { bg: "#F0F9FF", color: "#0C4A6E" },
  "🌿": { bg: "#F0FDF4", color: "#14532D" },
};

const ALL_TABS: Array<{ id: string; label: string; permission?: Permission }> = [
  { id: "details",         label: "Details" },
  { id: "schedule",        label: "Schedule", permission: "encounters:read" },
  { id: "medical-summary", label: "Medical Summary", permission: "conditions:read" },
  { id: "medications",     label: "Medications", permission: "medications:read" },
  { id: "reports",         label: "Reports", permission: "documents:read" },
  { id: "documents",       label: "Documents", permission: "documents:read" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function LabStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    normal:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    abnormal: "bg-amber-50 text-amber-700 border-amber-200",
    high:     "bg-rose-50 text-rose-700 border-rose-200",
    critical: "bg-red-100 text-red-800 border-red-300",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", map[status] ?? map.normal)}>
      {status}
    </span>
  );
}

// ─── Tab Content: Details ─────────────────────────────────────────────────────
function DetailsTab({ patient }: { patient: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* Column 1 — Basic Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-sora font-semibold text-sm mb-5" style={{ color: "var(--text-primary)" }}>
          Basic Information
        </h3>
        <div className="space-y-4">
          {/* Birthday */}
          <div className="flex items-start gap-3">
            <Cake className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Birthday</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                {formatDob(patient.dateOfBirth)}
              </p>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Gender</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                {patient.gender}
              </p>
            </div>
          </div>

          {/* Language */}
          <div className="flex items-start gap-3">
            <Languages className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Language</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                {patient.language}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Phone</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                {patient.phone}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Address</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                {patient.address}
              </p>
            </div>
          </div>

          {/* Allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Allergies</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {patient.allergies.map((a: any) => {
                    const style = ALLERGY_COLORS[a.emoji || "💊"] || { bg: "#F1F5F9", color: "#475569" };
                    return (
                      <span
                        key={a.allergen}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{ background: style.bg, color: style.color }}
                      >
                        {a.emoji} {a.allergen}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Column 2 — Emergency Contacts */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-sora font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Emergency Contacts
          </h3>
          <button className="w-6 h-6 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 transition-colors">
            <Plus className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="space-y-3">
          {(patient.emergencyContacts || []).map((contact: any) => (
            <div key={contact.id} className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: contact.bg, color: contact.color }}
              >
                {contact.isService ? contact.initials : contact.initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight truncate" style={{ color: "var(--text-primary)" }}>
                  {contact.isService ? contact.name : `${contact.name} (${contact.relationship})`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {contact.phone}
                </p>
              </div>

              {/* More */}
              <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-50 transition-colors flex-shrink-0">
                <MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
          ))}

          {(!patient.emergencyContacts || patient.emergencyContacts.length === 0) && (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
              No emergency contacts on file
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab Content: Medical Summary (AI features preserved) ─────────────────────
function MedicalSummaryTab() {
  return (
    <div className="space-y-5">
      {/* Temporal Health Matrix */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl -ml-20 -mb-20" />
        <div className="relative bg-slate-950/50 backdrop-blur-xl rounded-[15px] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-xl">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Metta AI — Temporal Health Matrix Forecast</h3>
              <p className="text-slate-400 text-xs mt-0.5">12,000+ data points analyzed in real-time</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">10-Year ASCVD Risk</p>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-rose-500">18.4<span className="text-2xl">%</span></span>
                <span className="text-xs font-bold text-rose-400 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-full mb-1">ELEVATED</span>
              </div>
              <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 w-[70%]" />
              </div>
              <p className="text-slate-500 text-xs mt-3 leading-relaxed">Trajectory mapped from rising HbA1c and Lipids over 24 months.</p>
            </div>
            <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">AI Intervention Recommendations</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-200 text-sm font-medium">Initiate High-Intensity Statin Therapy</p>
                    <p className="text-slate-500 text-xs mt-0.5">Reduces calculated 10-year risk to 11.2%</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-200 text-sm font-medium">Schedule Cardiology Baseline Echo</p>
                    <p className="text-slate-500 text-xs mt-0.5">Patient turning 78 y.o with 2 concurrent risk flags</p>
                  </div>
                </li>
              </ul>
              <button className="mt-4 w-full py-2 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> One-Click Apply Interventions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Latest Vitals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Blood Pressure", value: "128/82", unit: "mmHg", trend: "down",   delta: "-4 pts",  color: "cyan"    },
            { label: "Heart Rate",     value: "74",     unit: "bpm",  trend: "stable", delta: "→",       color: "violet"  },
            { label: "SpO₂",           value: "98",     unit: "%",    trend: "up",     delta: "+1%",     color: "emerald" },
            { label: "Weight",         value: "185",    unit: "lbs",  trend: "down",   delta: "-2 lbs",  color: "amber"   },
          ].map(v => (
            <div key={v.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{v.label}</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{v.value}</span>
                <span className="text-sm mb-0.5" style={{ color: "var(--text-muted)" }}>{v.unit}</span>
              </div>
              <div className={cn("flex items-center gap-1 text-xs mt-1 font-medium",
                v.trend === "up" ? "text-emerald-600" : v.trend === "down" ? "text-rose-500" : "text-slate-500")}>
                {v.trend === "up" ? <TrendingUp className="w-3 h-3" /> : v.trend === "down" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {v.delta}
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Date", "BP", "HR", "RR", "Temp", "SpO₂", "Weight", "BMI"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold px-4 py-2.5" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_VITALS.map((v, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{v.date}</td>
                  <td className="px-4 py-3 font-medium text-sm" style={{ color: "var(--text-primary)" }}>{v.bp}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{v.hr}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{v.rr}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{v.temp}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{v.spo2}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{v.weight}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>{v.bmi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Problems */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Problem List</h3>
        <div className="space-y-2">
          {MOCK_PROBLEMS.map((p, i) => (
            <div key={i} className={cn("flex items-center gap-4 p-3 rounded-xl border transition-colors",
              p.status === "active" ? "border-slate-200 bg-white hover:border-[#12B76A]/30" : "border-slate-100 bg-slate-50/50")}>
              <code className="text-xs bg-slate-100 border border-slate-200 px-2 py-1 rounded font-mono" style={{ color: "var(--text-secondary)" }}>
                {p.code}
              </code>
              <div className="flex-1">
                <p className={cn("font-medium text-sm", p.status === "resolved" ? "line-through text-slate-400" : "")} style={p.status !== "resolved" ? { color: "var(--text-primary)" } : {}}>
                  {p.name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Onset: {p.onset}</p>
              </div>
              <div className="flex gap-2">
                {p.severity && (
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border",
                    p.severity === "severe" ? "bg-rose-50 text-rose-700 border-rose-200" :
                    p.severity === "moderate" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-blue-50 text-blue-700 border-blue-200")}>
                    {p.severity}
                  </span>
                )}
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold",
                  p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab Content: Medications ─────────────────────────────────────────────────
function MedicationsTab() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Medication List</h3>
          <Link href="/prescribe">
            <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white rounded-lg" style={{ background: "var(--accent-green)" }}>
              <Plus className="w-3.5 h-3.5" /> New Rx
            </button>
          </Link>
        </div>
        <div className="space-y-2">
          {MOCK_MEDICATIONS.map((med, i) => (
            <div key={i} className={cn("flex items-center gap-4 p-4 rounded-xl border transition-colors",
              med.status === "active" ? "border-slate-200 bg-white hover:border-[#12B76A]/30" : "border-slate-100 bg-slate-50/50")}>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                med.status === "active" ? "bg-violet-100" : "bg-slate-100")}>
                <Pill className={cn("w-4 h-4", med.status === "active" ? "text-violet-600" : "text-slate-400")} />
              </div>
              <div className="flex-1">
                <p className={cn("font-semibold text-sm", med.status === "completed" ? "text-slate-400 line-through" : "")}
                  style={med.status !== "completed" ? { color: "var(--text-primary)" } : {}}>
                  {med.name} {med.dose}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {med.frequency} · {med.route} · <em>{med.indication}</em>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{med.prescribedBy}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{med.refills} refills</p>
              </div>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold",
                med.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                {med.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab Content: Reports (Labs) ──────────────────────────────────────────────
function ReportsTab() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Lab Results</h3>
        <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white rounded-lg" style={{ background: "var(--accent-green)" }}>
          <Plus className="w-3.5 h-3.5" /> Order Lab
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Date", "Test", "Result", "Status", "Ordered By", ""].map(h => (
                <th key={h} className="text-left text-xs font-semibold px-4 py-2.5" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_LABS.map((lab, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{lab.date}</td>
                <td className="px-4 py-3 font-medium text-sm" style={{ color: "var(--text-primary)" }}>{lab.name}</td>
                <td className="px-4 py-3 text-sm max-w-[200px] truncate" style={{ color: "var(--text-secondary)" }}>{lab.result}</td>
                <td className="px-4 py-3"><LabStatusBadge status={lab.status} /></td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{lab.orderedBy}</td>
                <td className="px-4 py-3">
                  <button className="flex items-center gap-1 text-xs font-medium hover:text-[#12B76A] transition-colors" style={{ color: "var(--text-muted)" }}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab Content: Documents (Vision AI) ──────────────────────────────────────
function DocumentsTab() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Vision AI Document Pipeline</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Upload unstructured PDFs. Vision AI extracts biomarkers automatically.
          </p>
        </div>
        <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white rounded-lg" style={{ background: "var(--accent-green)" }}>
          <Plus className="w-3.5 h-3.5" /> Upload
        </button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          setIsProcessing(true);
          setTimeout(() => { setIsProcessing(false); setProcessed(true); }, 4000);
        }}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
          isDragging ? "border-[#12B76A] bg-[#D1FAE5]/30" : "border-slate-200 hover:border-slate-300 bg-slate-50"
        )}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-fuchsia-100 flex items-center justify-center mb-4 relative">
              <Waves className="w-8 h-8 text-fuchsia-500 relative z-10" />
              <div className="absolute inset-0 rounded-2xl border-4 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
            </div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Vision AI Actively Reading Document...</h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Extracting FHIR elements and plotting biomarkers to registry.</p>
            <div className="w-64 h-2 bg-slate-200 rounded-full mt-6 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-pulse" />
            </div>
          </div>
        ) : processed ? (
          <div className="flex flex-col items-center py-6 text-emerald-600">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>15-Page Legacy Report Parsed!</h3>
            <p className="text-sm mt-1 text-emerald-700">Successfully extracted 42 discrete lab values including historical HbA1c and Lipids.</p>
            <button onClick={() => setProcessed(false)} className="mt-6 px-4 py-2 text-sm font-semibold rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors">
              View Parsed Data Table
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8 text-cyan-500" />
            </div>
            <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Drag & Drop Legacy Medical Records</h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Support for dense PDFs, unstructured notes, and lab photos.</p>
            <div className="flex gap-2 mt-4">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200/70 text-slate-600">Max 50 pages</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">Auto-OCR Enabled</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab Content: Schedule ────────────────────────────────────────────────────
function ScheduleTab({ patient }: { patient: any }) {
  const encounters = MOCK_ENCOUNTERS;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Encounter History</h3>
        <Link href="/transcript">
          <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
            <Sparkles className="w-3.5 h-3.5" /> New Encounter
          </button>
        </Link>
      </div>
      <div className="space-y-2">
        {encounters.map((enc, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-[#12B76A]/20 transition-colors">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
              enc.status === "in-progress" ? "bg-cyan-100" : "bg-slate-100")}>
              <Stethoscope className={cn("w-4 h-4", enc.status === "in-progress" ? "text-cyan-600" : "text-slate-400")} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{enc.type}</span>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                  enc.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                  enc.status === "in-progress" ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-600")}>
                  {enc.status}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{enc.reason} · {enc.provider}</p>
            </div>
            <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>{enc.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  const [activeTab, setActiveTab] = useState("details");
  const [moreOpen, setMoreOpen] = useState(false);
  const { data: session } = useSession();

  const { data: response, isLoading, error } = usePatient(patientId);

  const isMockId = patientId.startsWith("P");
  const mockPatient = MOCK_PATIENTS.find((p) => p.id === patientId);
  
  let patient: any = MOCK_PATIENTS[0];
  if (isMockId && mockPatient) {
    patient = mockPatient;
  } else if (response?.data) {
    const p = response.data;
    patient = {
      ...p,
      fullName: `${p.firstName} ${p.lastName}`,
      initials: `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase(),
      bg: "#F0FDF4",
      color: "#15803D",
      language: "English",
      allergies: [],
      emergencyContacts: p.emergencyContacts?.map((ec: any) => ({
        id: ec.id,
        name: ec.name,
        relationship: ec.relationship,
        phone: ec.phone,
        initials: ec.name.substring(0, 2).toUpperCase(),
        bg: "#F3E8FF",
        color: "#7E22CE",
        isService: false,
      })) || [],
    };
  }

  if (error && !isMockId) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ background: "var(--bg-base)" }}>
        <p className="text-sm font-medium text-red-500">Error loading patient details</p>
        <pre className="text-xs bg-slate-100 p-4 rounded-md">{error.message}</pre>
      </div>
    );
  }

  if (isLoading && !isMockId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Loading patient details...</p>
      </div>
    );
  }

  const age = calculateAge(patient.dateOfBirth);

  return (
    <div className="min-h-screen pb-12" style={{ background: "var(--bg-base)" }}>
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <Link href="/patients" className="hover:text-[#12B76A] transition-colors">
            Patients
          </Link>
          <span>/</span>
          <span className="font-medium" style={{ color: "var(--text-primary)" }}>{patient.fullName}</span>
        </div>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white transition-colors">
          <Bell className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>
      </div>

      {/* ── Patient Header Panel ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-5">
        <div className="flex items-start justify-between">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 border-4 border-white shadow-md"
              style={{ background: patient.bg, color: patient.color }}
            >
              {patient.initials}
            </div>
            <div>
              <h1 className="font-sora text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {patient.fullName}
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {patient.gender} · {age} Years
              </p>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2">
            <button
              title="Call"
              onClick={() => window.location.href = `tel:${patient.phone}`}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 hover:border-[#12B76A]/30 transition-all"
              style={{ color: "var(--text-secondary)" }}
            >
              <Phone className="w-4 h-4" /> Call
            </button>
            <button
              title="Video"
              onClick={() => router.push("/video")}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 hover:border-[#12B76A]/30 transition-all"
              style={{ color: "var(--text-secondary)" }}
            >
              <Video className="w-4 h-4" /> Video
            </button>
            <button
              title="Message"
              onClick={() => router.push("/transcript")}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 hover:border-[#12B76A]/30 transition-all"
              style={{ color: "var(--text-secondary)" }}
            >
              <MessageSquare className="w-4 h-4" /> Message
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              style={{ color: "var(--text-secondary)" }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 mb-5">
        <div className="flex items-center overflow-x-auto hide-scrollbar px-5">
          {ALL_TABS.filter(tab => !tab.permission || hasPermission((session?.user as any)?.role, tab.permission)).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex-shrink-0 px-1 py-4 mr-6 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-[#12B76A]"
                  : "hover:text-slate-700"
              )}
              style={activeTab !== tab.id ? { color: "var(--text-muted)" } : {}}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#12B76A] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      {activeTab === "details"         && <DetailsTab patient={patient} />}
      {activeTab === "schedule"        && <ScheduleTab patient={patient} />}
      {activeTab === "medical-summary" && <MedicalSummaryTab />}
      {activeTab === "medications"     && <MedicationsTab />}
      {activeTab === "reports"         && <ReportsTab />}
      {activeTab === "documents"       && <DocumentsTab />}

      {/* ── Floating AI Scribe Console ───────────────────────────────────────── */}
      <PermissionGate permission="ai:scribe">
        <div
          className="fixed bottom-6 right-6 z-50"
          style={{ pointerEvents: "auto" }}
        >
          <Link href="/transcript">
            <button
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white rounded-2xl shadow-lg transition-all hover:opacity-90 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #0EA5E9 0%, #7C3AED 100%)",
                boxShadow: "0 8px 24px rgba(14,165,233,0.35)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              AI Scribe Console
            </button>
          </Link>
        </div>
      </PermissionGate>
    </div>
  );
}