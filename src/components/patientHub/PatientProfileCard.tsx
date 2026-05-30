"use client";

import React from "react";
import { Phone, Mail, MapPin, Edit, MessageSquare, ShieldCheck, Languages, CreditCard, CheckCircle } from "lucide-react";
import { MOCK_SELECTED_PATIENT } from "@/data/mockPatients";

interface PatientProfileCardProps {
  patientId?: string;
}

export function PatientProfileCard({ patientId }: PatientProfileCardProps) {
  const p = MOCK_SELECTED_PATIENT;

  return (
    <div
      className="pih-card flex flex-col"
      style={{ padding: "20px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="font-sora text-[13px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Patient Profile
        </span>
        <button
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2F4F7] transition-colors"
          aria-label="Edit patient"
        >
          <Edit className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center mb-5">
        <div
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 ring-4"
          style={{
            background: "linear-gradient(135deg, var(--accent-green) 0%, #059669 100%)",
            boxShadow: "0 0 0 4px var(--accent-green-light)",
          }}
        >
          {p.initials}
        </div>
        <h2
          className="font-sora text-[16px] font-bold leading-tight mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {p.fullName}
        </h2>
        <span
          className="px-3 py-1 rounded-full text-[11px] font-semibold"
          style={{
            background: "var(--accent-green-light)",
            color: "#065F46",
          }}
        >
          {p.specialty}
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border-subtle)", marginBottom: "16px" }} />

      {/* Contact Info Rows */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Phone */}
        <InfoRow icon={<Phone className="w-3.5 h-3.5" />} value={p.phone} verified={p.mobileVerified} />
        {/* Email */}
        <InfoRow icon={<Mail className="w-3.5 h-3.5" />} value={p.email} />
        {/* Address */}
        <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} value={p.address} />

        {/* Indian-specific fields */}
        <div style={{ height: "1px", background: "var(--border-subtle)" }} />

        {/* ABHA ID */}
        {p.abhaId && (
          <InfoRow
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            label="ABHA"
            value={p.abhaId}
            verified={p.abhaVerified}
            accent
          />
        )}
        {/* Languages */}
        <InfoRow
          icon={<Languages className="w-3.5 h-3.5" />}
          label="Languages"
          value={p.language}
        />
        {/* Blood Type */}
        <InfoRow
          icon={<CreditCard className="w-3.5 h-3.5" />}
          label="Blood Type"
          value={p.bloodType}
          badge
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[12px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "var(--accent-green)",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(18,183,106,0.25)",
          }}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Message
        </button>
        <button
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-[12px] font-semibold transition-colors hover:bg-[#F2F4F7]"
          style={{
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    </div>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  verified,
  accent,
  badge,
}: {
  icon: React.ReactNode;
  label?: string;
  value: string;
  verified?: boolean;
  accent?: boolean;
  badge?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="mt-0.5 flex-shrink-0"
        style={{ color: accent ? "var(--accent-green)" : "var(--text-muted)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        {label && (
          <p
            className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </p>
        )}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[12px] font-medium ${badge ? "px-2 py-0.5 rounded-full text-white text-[11px]" : ""}`}
            style={{
              color: badge ? undefined : "var(--text-secondary)",
              background: badge ? "#EF4444" : undefined,
            }}
          >
            {value}
          </span>
          {verified && (
            <CheckCircle
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: "var(--accent-green)" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
