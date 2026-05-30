"use client";

import React, { useState } from "react";
import { Sparkles, MessageSquare, Mic, UserPlus } from "lucide-react";
import Link from "next/link";

interface ToolItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  action: "event" | "link";
  eventName?: string;
  href?: string;
}

const TOOLS: ToolItem[] = [
  {
    id: "metta",
    icon: <Sparkles className="w-5 h-5" />,
    label: "Metta AI",
    color: "var(--accent-cyan)",
    bg: "#ECFEFF",
    action: "event",
    eventName: "toggle-metta-search",
  },
  {
    id: "whatsapp",
    icon: <MessageSquare className="w-5 h-5" />,
    label: "WhatsApp",
    color: "var(--accent-green)",
    bg: "#F0FDF4",
    action: "link",
    href: "/whatsapp-sync",
  },
  {
    id: "voice",
    icon: <Mic className="w-5 h-5" />,
    label: "Voice",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    action: "event",
    eventName: "toggle-ai-assistant",
  },
  {
    id: "walkin",
    icon: <UserPlus className="w-5 h-5" />,
    label: "Walk-in",
    color: "var(--accent-amber)",
    bg: "#FFFBEB",
    action: "link",
    href: "/patients/new",
  },
];

export function FloatingAIToolbar() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleAction = (tool: ToolItem) => {
    if (tool.action === "event" && tool.eventName) {
      window.dispatchEvent(new CustomEvent(tool.eventName));
    }
  };

  return (
    <div
      className="fixed flex flex-col gap-2 no-print"
      style={{
        right: "16px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 100,
      }}
    >
      {TOOLS.map((tool) => {
        const isHovered = hoveredId === tool.id;
        const btn = (
          <button
            key={tool.id}
            className="relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: isHovered ? tool.bg : "#FFFFFF",
              boxShadow: isHovered
                ? `0 4px 20px rgba(0,0,0,0.15), 0 0 0 2px ${tool.color}33`
                : "0 2px 8px rgba(16,24,40,0.12), 0 1px 3px rgba(16,24,40,0.08)",
              transform: isHovered ? "scale(1.12)" : "scale(1)",
              color: tool.color,
              border: "1px solid var(--border-subtle)",
            }}
            onClick={() => handleAction(tool)}
            onMouseEnter={() => setHoveredId(tool.id)}
            onMouseLeave={() => setHoveredId(null)}
            aria-label={tool.label}
          >
            {tool.icon}

            {/* Tooltip */}
            {isHovered && (
              <div
                className="absolute right-full mr-3 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap pointer-events-none animate-fadeIn"
                style={{
                  background: "#101828",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {tool.label}
                {/* Arrow */}
                <div
                  className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                  style={{ background: "#101828" }}
                />
              </div>
            )}
          </button>
        );

        return tool.action === "link" && tool.href ? (
          <Link key={tool.id} href={tool.href}>
            {btn}
          </Link>
        ) : (
          <div key={tool.id}>{btn}</div>
        );
      })}
    </div>
  );
}
