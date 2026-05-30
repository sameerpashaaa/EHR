"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MoreHorizontal, MessageCircle, Mic } from "lucide-react";
import { MOCK_PATIENTS_QUEUE } from "@/data/mockPatients";

type FilterTab = "all" | "old" | "new";

interface PatientQueueProps {
  selectedId?: string;
}

export function PatientQueue({ selectedId = "P-2024-002" }: PatientQueueProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const filtered =
    activeFilter === "all"
      ? MOCK_PATIENTS_QUEUE
      : MOCK_PATIENTS_QUEUE.filter((p) => p.status === activeFilter);

  const handleVoiceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("toggle-ai-assistant"));
  };

  const handleWhatsAppClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/whatsapp-sync?patient=${id}`;
  };

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: "160px",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-subtle)",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 pt-4 pb-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span
          className="font-sora text-[13px] font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Patient Queue
        </span>
        <button
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#F2F4F7] transition-colors"
          aria-label="Search patients"
        >
          <Search className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 px-2.5 py-2.5">
        {(["all", "old", "new"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className="flex-1 py-1 rounded-full text-[10px] font-semibold capitalize transition-all"
            style={
              activeFilter === tab
                ? {
                    background: "var(--accent-green)",
                    color: "#fff",
                  }
                : {
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                  }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-4 space-y-0.5">
        {filtered.map((patient, idx) => {
          const isSelected = patient.id === selectedId;
          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
            >
              <Link href={`/patients/${patient.id}`}>
                <div
                  className="group relative flex flex-col gap-0.5 px-2 py-2.5 rounded-[10px] cursor-pointer transition-all"
                  style={
                    isSelected
                      ? {
                          borderLeft: "3px solid var(--accent-green)",
                          background: "#F0FDF4",
                          paddingLeft: "6px",
                        }
                      : {
                          border: "1px solid transparent",
                          paddingLeft: "8px",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background = "#F9FAFB";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  {/* Avatar + Name row */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        background: patient.bg,
                        color: patient.color,
                      }}
                    >
                      {patient.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[11px] font-semibold truncate leading-tight"
                        style={{
                          color: isSelected ? "var(--accent-green)" : "var(--text-primary)",
                        }}
                      >
                        {patient.name}
                      </p>
                    </div>
                    {/* Three-dot (visible on hover) */}
                    <button
                      className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded transition-opacity"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    >
                      <MoreHorizontal className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>

                  {/* Condition tag */}
                  <p
                    className="text-[10px] leading-tight truncate ml-9"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {patient.specialty}
                  </p>

                  {/* Diabetic badge */}
                  {patient.badge && (
                    <div className="ml-9">
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "#FEE2E2",
                          color: "#EF4444",
                        }}
                      >
                        {patient.badge}
                      </span>
                    </div>
                  )}

                  {/* Quick action icons (hover) */}
                  <div className="ml-9 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <button
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-green-100 transition-colors"
                      onClick={(e) => handleWhatsAppClick(e, patient.id)}
                      aria-label="WhatsApp"
                      title="WhatsApp Triage"
                    >
                      <MessageCircle className="w-3 h-3" style={{ color: "var(--accent-green)" }} />
                    </button>
                    <button
                      className="w-5 h-5 rounded flex items-center justify-center hover:bg-cyan-50 transition-colors"
                      onClick={handleVoiceClick}
                      aria-label="Voice consult"
                      title="Live Voice Consult"
                    >
                      <Mic className="w-3 h-3" style={{ color: "var(--accent-cyan)" }} />
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </aside>
  );
}
