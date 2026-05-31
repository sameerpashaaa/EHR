"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Bell, ChevronDown, MoreVertical,
  ChevronLeft, ChevronRight, User, Pencil, Trash2, Eye
} from "lucide-react";
import { MOCK_PATIENTS } from "@/data/mockPatients";
import { cn } from "@/lib/utils";
import { usePatients } from "@/hooks/usePatients";

const TOTAL_PAGES = 10;

type SortKey = "name" | "age" | "lastVisit" | "gender";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name",      label: "Name (A → Z)" },
  { key: "age",       label: "Age (oldest first)" },
  { key: "lastVisit", label: "Last Visit" },
  { key: "gender",    label: "Gender" },
];

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getPatientStatus(id: string) {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const statuses = [
    { label: "Ext. Hospitalism", color: "#D97706", bg: "#FEF3C7" }, // Orange
    { label: "In Surgery", color: "#DC2626", bg: "#FEE2E2" }, // Red
    { label: "Discharge", color: "#059669", bg: "#D1FAE5" }, // Green
    { label: "Expected Stay", color: "#111827", bg: "#F3F4F6" }, // Black
  ];
  return statuses[hash % statuses.length];
}

// Row action menu
function RowMenu({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
      >
        <MoreVertical className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-8 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-44"
          >
            <button
              onClick={() => { setOpen(false); router.push(`/patients/${patientId}`); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-left"
              style={{ color: "var(--text-secondary)" }}
            >
              <Eye className="w-4 h-4" /> View Profile
            </button>
            <button
              onClick={() => { setOpen(false); router.push(`/patients/${patientId}/edit`); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-left"
              style={{ color: "var(--text-secondary)" }}
            >
              <Pencil className="w-4 h-4" /> Edit Patient
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={() => { setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-rose-50 transition-colors text-left text-rose-500"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pagination bar
function Pagination({ current, total }: { current: number; total: number }) {
  const pages: (number | "...")[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", 7, 8, 9, 10);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <span className="text-sm text-slate-500">
        Page {current} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40"
          disabled={current === 1}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">...</span>
          ) : (
            <button
              key={p}
              className={cn(
                "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                p === current
                  ? "bg-[#12B76A] text-white"
                  : "text-slate-600 hover:bg-slate-50 border border-slate-200"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40"
          disabled={current === total}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Go to</span>
        <input
          type="number"
          min={1}
          max={total}
          defaultValue={current}
          className="w-16 h-8 text-sm text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#12B76A]/20 focus:border-[#12B76A]"
        />
        <span className="text-sm text-slate-500">Page</span>
      </div>
    </div>
  );
}

export default function PatientsListPage() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(q);
  const [currentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { data: dbData } = usePatients({ query: searchQuery, page: currentPage, limit: 50 });

  const filtered = useMemo(() => {
    const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    let list = tokens.length > 0
      ? MOCK_PATIENTS.filter(
          (p) => tokens.every(token => 
            p.fullName.toLowerCase().includes(token) ||
            (p.id || "").toLowerCase().includes(token) ||
            (p.abhaId || "").toLowerCase().includes(token) ||
            (p.phone || "").toLowerCase().includes(token) ||
            (p.email || "").toLowerCase().includes(token) ||
            (p.primaryCondition || "").toLowerCase().includes(token)
          )
        )
      : [...MOCK_PATIENTS];

    if (dbData?.data) {
      // Append database patients to the list
      list = [...dbData.data, ...list];
      // Deduplicate by ID just in case
      const seen = new Set();
      list = list.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }

    list.sort((a, b) => {
      if (sortKey === "name")      return (a.fullName || "").localeCompare(b.fullName || "");
      if (sortKey === "age")       return new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime();
      if (sortKey === "gender")    return (a.gender || "").localeCompare(b.gender || "");
      if (sortKey === "lastVisit") return (a.lastVisit || "").localeCompare(b.lastVisit || "");
      return 0;
    });
    return list;
  }, [searchQuery, sortKey, dbData]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-sora text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Patients
        </h1>
        <div className="flex items-center gap-3">
          <Link href="/patients/new">
            <button
              className="flex items-center gap-2 h-9 px-4 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#12B76A" }}
            >
              <Plus className="w-4 h-4" />
              Add Patient
            </button>
          </Link>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white transition-colors">
            <Bell className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search patient"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-9 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#12B76A]/20 focus:border-[#12B76A] placeholder-slate-400"
          />
        </div>

        {/* Sort by */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen(o => !o)}
            className="flex items-center gap-2 h-9 px-4 text-sm border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            Sort by: <span className="font-medium" style={{ color: "var(--text-primary)" }}>{SORT_OPTIONS.find(s => s.key === sortKey)?.label}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", sortOpen && "rotate-180")} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-10 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-52"
              >
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortKey(opt.key); setSortOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left",
                      sortKey === opt.key ? "bg-[#12B76A]/10 text-[#12B76A] font-semibold" : "hover:bg-slate-50"
                    )}
                    style={sortKey !== opt.key ? { color: "var(--text-secondary)" } : {}}
                  >
                    {sortKey === opt.key && <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />}
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>


      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Patient", "Gender", "Primary Condition", "ABHA-id", "Status", "Last Visit Date", "Next Visit Date", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold px-4 py-3 whitespace-nowrap"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient, i) => (
                <motion.tr
                  key={patient.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                >
                  {/* Patient */}
                  <td className="px-4 py-3">
                    <Link href={`/patients/${patient.id}`} className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                        style={{ background: patient.bg, color: patient.color }}
                      >
                        {patient.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                          {patient.fullName}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {calculateAge(patient.dateOfBirth)} years
                        </p>
                      </div>
                    </Link>
                  </td>

                  {/* Gender */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={
                        patient.gender === "Female"
                          ? { background: "#FFF0F9", color: "#BE185D" }
                          : { background: "#EFF6FF", color: "#1D4ED8" }
                      }
                    >
                      {patient.gender}
                    </span>
                  </td>

                  {/* Primary Condition */}
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {patient.primaryCondition || "—"}
                    </span>
                  </td>

                  {/* ABHA-id */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                      {patient.abhaId || "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {(() => {
                      const st = getPatientStatus(patient.id);
                      return (
                        <span
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border"
                          style={{ background: st.bg, color: st.color, borderColor: `${st.color}30` }}
                        >
                          {st.label}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Last Visit */}
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {patient.lastVisitDate || "—"}
                    </span>
                  </td>

                  {/* Next Visit */}
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {patient.nextVisitDate || "—"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <RowMenu patientId={patient.id} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination current={currentPage} total={TOTAL_PAGES} />
      </div>
    </div>
  );
}
