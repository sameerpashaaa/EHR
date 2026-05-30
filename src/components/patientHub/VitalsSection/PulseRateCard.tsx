"use client";

import React from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { MoreHorizontal } from "lucide-react";
import { MOCK_PULSE_DATA } from "@/data/mockPatients";

export function PulseRateCard() {
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
          Pulse Rate
        </span>
        <button
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F2F4F7] transition-colors"
          aria-label="More"
        >
          <MoreHorizontal className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* Stat */}
      <div className="flex items-end gap-1 mb-3">
        <span
          className="font-sora font-bold"
          style={{ fontSize: "28px", color: "var(--text-primary)", lineHeight: 1 }}
        >
          60
        </span>
        <span
          className="text-[11px] mb-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          bpm
        </span>
      </div>

      {/* Sparkline */}
      <div style={{ height: "80px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={MOCK_PULSE_DATA}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--accent-cyan)"
              strokeWidth={2}
              fill="url(#pulseGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer label */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          beats per minute
        </span>
        <span
          className="text-[11px] font-semibold"
          style={{ color: "var(--accent-cyan)" }}
        >
          60
        </span>
      </div>
    </div>
  );
}
