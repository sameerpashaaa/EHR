"use client";

import React, { useState } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import { MOCK_SELECTED_PATIENT } from "@/data/mockPatients";

export function PatientAbout() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const p = MOCK_SELECTED_PATIENT;

  return (
    <div className="pih-card flex flex-col" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="font-sora text-[13px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          About Patient
        </span>
        <div className="flex items-center gap-2">
          {/* Admission date badge */}
          <span
            className="text-[10px] font-medium px-2 py-1 rounded-full"
            style={{
              background: "#F2F4F7",
              color: "var(--text-secondary)",
            }}
          >
            Admitted: {p.admissionDate || "N/A"}
          </span>
          {/* Period toggle */}
          <button
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors"
            style={{
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              background: "var(--bg-card)",
            }}
            onClick={() => setPeriod(period === "monthly" ? "yearly" : "monthly")}
          >
            {period === "monthly" ? "Monthly" : "Yearly"}
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 2×2 Metadata Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetaField label="Patient Complaint" value={p.complaint || "None specified"} />
        <MetaField label="Floor / Ward" value={p.floor || "Unassigned"} />
        <MetaField label="Potential Release Date" value={p.releaseDate || "TBD"} muted />
        <MetaField
          label="Doctor's Diagnosis"
          value={p.diagnosis || "Pending evaluation"}
          extra={
            p.requiresSurgery && (
              <span
                className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-1"
                style={{ background: "#FEE2E2", color: "#991B1B" }}
              >
                <AlertCircle className="w-2.5 h-2.5" />
                Requires Surgery
              </span>
            )
          }
        />
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border-subtle)", marginBottom: "12px" }} />

      {/* Extra metadata row */}
      <div className="grid grid-cols-3 gap-2">
        {/* Blood Type */}
        <div
          className="flex flex-col items-center py-2 rounded-[10px] text-center"
          style={{ background: "#FEE2E2" }}
        >
          <span className="text-[10px] font-medium mb-0.5" style={{ color: "#991B1B" }}>
            Blood Type
          </span>
          <span className="text-[16px] font-bold" style={{ color: "#EF4444" }}>
            {p.bloodType}
          </span>
        </div>

        {/* Last Encounter */}
        <div
          className="flex flex-col items-center py-2 rounded-[10px] text-center"
          style={{ background: "#F0FDF4" }}
        >
          <span className="text-[10px] font-medium mb-0.5" style={{ color: "#065F46" }}>
            Last Seen
          </span>
          <span className="text-[10px] font-semibold" style={{ color: "var(--accent-green)" }}>
            {p.lastEncounter || "No recent visits"}
          </span>
        </div>

        {/* ABHA Status */}
        <div
          className="flex flex-col items-center py-2 rounded-[10px] text-center"
          style={{ background: "#EFF6FF" }}
        >
          <span className="text-[10px] font-medium mb-0.5" style={{ color: "#1D4ED8" }}>
            ABHA
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: "#DBEAFE", color: "#1D4ED8" }}
          >
            ✓ Verified
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MetaField helper ─────────────────────────────────────────────────────────
function MetaField({
  label,
  value,
  muted,
  extra,
}: {
  label: string;
  value: string;
  muted?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div
      className="p-2.5 rounded-[10px] flex flex-col gap-0.5"
      style={{ background: "#F9FAFB", border: "1px solid var(--border-subtle)" }}
    >
      <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span
        className="text-[12px] font-semibold leading-snug"
        style={{ color: muted ? "var(--text-muted)" : "var(--text-primary)" }}
      >
        {value}
      </span>
      {extra}
    </div>
  );
}
