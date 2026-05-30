"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MoreHorizontal } from "lucide-react";
import { MOCK_BP_DATA } from "@/data/mockPatients";

// Custom Tooltip
function BPTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-[10px] text-[11px]"
      style={{
        background: "#fff",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 4px 16px rgba(16,24,40,0.12)",
      }}
    >
      <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span style={{ color: "var(--text-secondary)" }}>
            {entry.dataKey === "systolic" ? "Systolic" : "Diastolic"}: {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BloodPressureChart() {
  return (
    <div
      className="pih-card flex flex-col"
      style={{ padding: "20px", flex: "1 1 0" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: "linear-gradient(135deg, var(--accent-cyan) 0%, #0891B2 100%)" }}
          >
            BP
          </div>
          <span
            className="font-sora text-[13px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Blood Pressure
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--accent-cyan)" }}
              />
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Systolic
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--accent-amber)" }}
              />
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Diastolic
              </span>
            </div>
          </div>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F2F4F7] transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      </div>

      {/* Big stat */}
      <div className="flex items-end gap-2 mb-3">
        <span
          className="font-sora font-bold"
          style={{ fontSize: "32px", color: "var(--text-primary)", lineHeight: 1 }}
        >
          132/45
        </span>
        <span
          className="text-[13px] mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          mmHg
        </span>
      </div>

      {/* Chart */}
      <div style={{ height: "140px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={MOCK_BP_DATA}
            margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
          >
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<BPTooltip />} />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="var(--accent-cyan)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="var(--accent-amber)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
