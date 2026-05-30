"use client";

import React from "react";
import { Edit, Plus } from "lucide-react";
import { MOCK_APPOINTMENTS } from "@/data/mockPatients";

export function AppointmentsPanel() {
  return (
    <div className="pih-card flex flex-col" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="font-sora text-[13px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Appointments
        </span>
        <button
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2F4F7] transition-colors"
          aria-label="Edit appointments"
        >
          <Edit className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-0 flex-1">
        {MOCK_APPOINTMENTS.map((apt, idx) => {
          const isLast = idx === MOCK_APPOINTMENTS.length - 1;
          const isUpcoming = apt.status === "upcoming";
          return (
            <div key={apt.id} className="flex gap-3">
              {/* Left: date + line */}
              <div className="flex flex-col items-center" style={{ width: "70px", flexShrink: 0 }}>
                <p
                  className="text-[10px] font-medium leading-tight text-right w-full"
                  style={{ color: "var(--text-muted)" }}
                >
                  {apt.date}
                </p>
                {/* Dot */}
                <div
                  className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ring-2 ring-white"
                  style={{
                    background: isUpcoming ? "var(--accent-amber)" : "var(--accent-green)",
                  }}
                />
                {/* Connector line */}
                {!isLast && (
                  <div
                    className="w-px flex-1 mt-1"
                    style={{
                      background: "var(--border-subtle)",
                      minHeight: "32px",
                    }}
                  />
                )}
              </div>

              {/* Right: card */}
              <div
                className="flex-1 mb-4 p-2.5 rounded-[10px] transition-all cursor-pointer"
                style={{
                  background: isUpcoming ? "#FFFBEB" : "#F9FAFB",
                  border: isUpcoming
                    ? "1px solid #FDE68A"
                    : "1px solid var(--border-subtle)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(16,24,40,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <p
                  className="text-[11px] font-semibold leading-tight"
                  style={{
                    color: isUpcoming ? "#92400E" : "var(--text-primary)",
                  }}
                >
                  {apt.type}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {apt.doctor}
                </p>
                {isUpcoming && (
                  <span
                    className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "#FDE68A", color: "#92400E" }}
                  >
                    Upcoming
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule button */}
      <button
        className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[12px] font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          background: "var(--accent-green-light)",
          color: "#065F46",
          border: "1px dashed var(--accent-green)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--accent-green)";
          (e.currentTarget as HTMLElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--accent-green-light)";
          (e.currentTarget as HTMLElement).style.color = "#065F46";
        }}
      >
        <Plus className="w-3.5 h-3.5" />
        Schedule Appointment
      </button>
    </div>
  );
}
