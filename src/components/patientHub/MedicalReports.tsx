"use client";

import React, { useState } from "react";
import { Plus, Download, FileText } from "lucide-react";
import { MOCK_MEDICAL_REPORTS } from "@/data/mockPatients";

export function MedicalReports() {
  const [showInactive, setShowInactive] = useState(false);

  const visible = showInactive
    ? MOCK_MEDICAL_REPORTS
    : MOCK_MEDICAL_REPORTS.filter((r) => r.active);

  return (
    <div className="pih-card flex flex-col" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="font-sora text-[13px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Medical Reports
        </span>
        {/* Toggle switch */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            Show Inactive
          </span>
          <button
            role="switch"
            aria-checked={showInactive}
            onClick={() => setShowInactive(!showInactive)}
            className="relative w-9 h-5 rounded-full transition-colors focus:outline-none"
            style={{
              background: showInactive ? "var(--accent-green)" : "#D0D5DD",
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
              style={{
                transform: showInactive ? "translateX(16px)" : "translateX(0)",
              }}
            />
          </button>
        </div>
      </div>

      {/* PDF Cards Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {visible.map((report) => (
          <div
            key={report.id}
            className="flex items-start gap-2 p-3 rounded-[10px] group cursor-pointer transition-all"
            style={{
              background: "#F9FAFB",
              border: "1px solid var(--border-subtle)",
              opacity: report.active ? 1 : 0.55,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-green)";
              (e.currentTarget as HTMLElement).style.background = "#F0FDF4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
              (e.currentTarget as HTMLElement).style.background = "#F9FAFB";
            }}
          >
            {/* PDF icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#FEE2E2" }}
            >
              <FileText className="w-4 h-4" style={{ color: "#EF4444" }} />
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[11px] font-semibold truncate leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {report.name}
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {report.size} · {report.date}
              </p>
            </div>
            {/* Download icon */}
            <button
              className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded transition-opacity"
              aria-label="Download"
            >
              <Download className="w-3.5 h-3.5" style={{ color: "var(--accent-green)" }} />
            </button>
          </div>
        ))}
      </div>

      {/* Upload button */}
      <button
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[12px] font-semibold border-2 border-dashed transition-all"
        style={{
          borderColor: "var(--border-subtle)",
          color: "var(--text-secondary)",
          background: "transparent",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--accent-green)";
          el.style.color = "var(--accent-green)";
          el.style.background = "#F0FDF4";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "var(--border-subtle)";
          el.style.color = "var(--text-secondary)";
          el.style.background = "transparent";
        }}
      >
        <Plus className="w-3.5 h-3.5" />
        Upload Report
      </button>
    </div>
  );
}
