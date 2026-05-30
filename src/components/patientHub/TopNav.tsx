"use client";

import React from "react";
import Link from "next/link";
import { Bell, Mail, MoreHorizontal, ChevronDown, Calendar } from "lucide-react";

interface TopNavProps {
  title?: string;
  dateRange?: string;
}

export function TopNav({
  title = "Patient Profile",
  dateRange = "Jan 2024 – Oct 2024",
}: TopNavProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-5"
      style={{
        height: "60px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border-subtle)",
        boxShadow: "0 1px 0 rgba(16,24,40,0.04)",
      }}
    >
      {/* Left — Title + date range */}
      <div className="flex items-center gap-3">
        <h1
          className="font-sora text-[20px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium"
          style={{
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
          }}
        >
          <Calendar className="w-3 h-3" />
          Last Update: {dateRange}
        </div>
      </div>

      {/* Right — Icon row */}
      <div className="flex items-center gap-1">
        {/* Mail */}
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[#F2F4F7]"
          aria-label="Mail"
        >
          <Mail className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
        </button>

        {/* Bell with unread dot */}
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[#F2F4F7]"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-white"
            style={{ background: "var(--accent-red)" }}
          />
        </button>

        {/* Avatar */}
        <button
          className="flex items-center gap-1.5 ml-1 px-2 py-1 rounded-lg transition-colors hover:bg-[#F2F4F7]"
          aria-label="User menu"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
            style={{ background: "var(--accent-green)" }}
          >
            Dr
          </div>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
        </button>

        {/* Three-dot */}
        <button
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[#F2F4F7]"
          aria-label="More options"
        >
          <MoreHorizontal className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>
    </header>
  );
}
