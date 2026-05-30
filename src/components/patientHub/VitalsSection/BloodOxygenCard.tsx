"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";

export function BloodOxygenCard() {
  const value = 98;
  const fillPercent = value; // 98% of bar

  return (
    <div
      className="pih-card flex flex-col"
      style={{ padding: "16px 20px", minWidth: "140px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <span
          className="font-sora text-[12px] font-semibold leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Blood Oxygen
        </span>
        <button
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F2F4F7] transition-colors"
          aria-label="More"
        >
          <MoreHorizontal className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* Stat + Normal badge */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="font-sora font-bold"
          style={{ fontSize: "28px", color: "var(--text-primary)", lineHeight: 1 }}
        >
          {value}%
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{
            background: "var(--accent-green-light)",
            color: "#065F46",
          }}
        >
          Normal
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div
          className="h-3 w-full rounded-full overflow-hidden"
          style={{ background: "#F2F4F7" }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${fillPercent}%`,
              background: "linear-gradient(90deg, #F59E0B 0%, #D97706 60%, #B45309 100%)",
            }}
          />
        </div>
      </div>

      {/* SpO2 label row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            SpO₂ Level
          </span>
          <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {value}%
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Target
          </span>
          <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
            95–100%
          </span>
        </div>
      </div>

      {/* Oxygen bar indicator circles */}
      <div className="mt-3 flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full"
            style={{
              background:
                i < Math.round(fillPercent / 10)
                  ? i < 6
                    ? "#F59E0B"
                    : "#12B76A"
                  : "#EAECF0",
            }}
          />
        ))}
      </div>
    </div>
  );
}
