"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SessionUser } from "@/types";
import { filterNavItemsByRole, NAV_ITEMS } from "@/lib/auth/roles";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Settings,
  Sparkles,
  Mic,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  BarChart3,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  FileText,
  Settings,
  Sparkles,
  List,
  UserPlus,
  Activity,
  Pill,
  AlertTriangle,
  UserCog,
  ClipboardList,
  BarChart3,
};

function List({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function UserPlus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function Pill({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function UserCog({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ClipboardList({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

interface FloatingNavProps {
  user: SessionUser;
  onExpandChange?: (expanded: boolean) => void;
}

export function FloatingNav({ user, onExpandChange }: FloatingNavProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const pathname = usePathname();

  const navItems = filterNavItemsByRole(NAV_ITEMS, user?.role || "FRONT_DESK");

  useEffect(() => {
    if (window.innerWidth < 1024) {
      handleExpand(false);
    }
  }, []);

  const handleExpand = (val: boolean) => {
    setIsExpanded(val);
    onExpandChange?.(val);
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => handleExpand(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <nav
        className={cn(
          "fixed left-0 top-0 h-full z-50 hidden lg:flex flex-col",
          "border-r",
          "transition-all duration-300 ease-out",
          isExpanded ? "w-52" : "w-[72px]"
        )}
        style={{
          background: "rgba(248,250,252,0.95)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(226,232,240,0.8)",
          boxShadow: "2px 0 20px rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-4 border-b border-slate-100 bg-white",
            isExpanded ? "justify-start" : "justify-center"
          )}
        >
          <div className="h-8 w-8 rounded-[6px] bg-[#4CAF72] flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {isExpanded && (
            <div className="overflow-hidden">
              <p className="font-[700] text-[13px] text-[#0f172a] whitespace-nowrap">Metapharsic</p>
              <p className="text-[10px] text-[#4CAF72] font-[500] whitespace-nowrap tracking-wide">Lifesciences EHR</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-[2px] flex-1 overflow-y-auto px-2 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={!isExpanded ? item.title : undefined}
                className={cn(
                  "relative flex items-center gap-3 px-3 h-9 rounded-[12px] group",
                  isExpanded ? "" : "justify-center",
                  isActive
                    ? "font-[700]"
                    : "text-[#475569]"
                )}
                style={{
                  color: isActive ? "#16a34a" : undefined,
                  background: isActive ? "#f0fdf4" : undefined,
                  boxShadow: isActive ? "inset 3px 0 0 #22c55e" : undefined,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.10)";
                    (e.currentTarget as HTMLElement).style.color = "#0f172a";
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
                  }
                  if (!isExpanded) setActiveTooltip(item.title);
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "";
                    (e.currentTarget as HTMLElement).style.color = "";
                    (e.currentTarget as HTMLElement).style.transform = "";
                  }
                  setActiveTooltip(null);
                }}
              >
                <span className="flex-shrink-0">{getIcon(item.icon)}</span>

                {isExpanded && (
                  <span className="text-[13px] whitespace-nowrap overflow-hidden">
                    {item.title}
                  </span>
                )}

                {/* Tooltip */}
                {!isExpanded && activeTooltip === item.title && (
                  <div className="absolute left-full ml-3 px-[10px] py-[6px] bg-[#0f172a] text-white text-[12px] font-[500] rounded-[6px] whitespace-nowrap z-50 pointer-events-none">
                    {item.title}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-[#0f172a]" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="px-2 pb-2 border-t border-slate-200 pt-2">
          <button
            aria-label="Voice Command"
            className={cn(
              "flex items-center gap-3 w-full px-3 h-9 rounded-[6px] text-[#475569] hover:bg-white hover:text-[#0f172a] transition-all",
              !isExpanded && "justify-center"
            )}
          >
            <Mic className="h-4 w-4 flex-shrink-0" />
            {isExpanded && <span className="text-[13px] whitespace-nowrap">Voice Command</span>}
          </button>
          <button
            aria-label="Smart Search"
            className={cn(
              "flex items-center gap-3 w-full px-3 h-9 rounded-[6px] text-[#475569] hover:bg-white hover:text-[#0f172a] transition-all",
              !isExpanded && "justify-center"
            )}
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            {isExpanded && <span className="text-[13px] whitespace-nowrap">Smart Search</span>}
          </button>
        </div>

        {/* Expand/Collapse Button */}
        <div className="px-2 pb-4 border-t border-slate-200 pt-2">
          <button
            onClick={() => handleExpand(!isExpanded)}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className={cn(
              "flex items-center gap-3 w-full px-3 h-9 rounded-[6px] text-[#475569] hover:bg-white hover:text-[#0f172a] transition-all",
              !isExpanded && "justify-center"
            )}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-transform duration-300",
                isExpanded && "rotate-180"
              )}
            />
            {isExpanded && <span className="text-[13px] text-[#475569]">Collapse</span>}
          </button>
        </div>
      </nav>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => handleExpand(!isExpanded)}
        aria-label={isExpanded ? "Close menu" : "Open menu"}
        className="fixed bottom-6 left-6 z-50 lg:hidden h-12 w-12 rounded-[8px] bg-[#4CAF72] text-white flex items-center justify-center active:scale-95 transition-all"
      >
        {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Navigation Menu */}
      <div
        className={cn(
          "fixed bottom-24 left-6 z-50 lg:hidden",
          "bg-white border border-[#e2e8f0] rounded-[8px] p-3 w-52",
          "transition-all duration-300",
          isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="flex flex-col gap-[2px]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsExpanded(false)}
                className={cn(
                  "flex items-center gap-3 px-3 h-9 rounded-[6px] transition-all text-[13px]",
                  isActive
                    ? "bg-[#f0fdf4] text-[#16a34a] font-[700] shadow-[inset_3px_0_0_#22c55e]"
                    : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                )}
              >
                {getIcon(item.icon)}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 lg:hidden bg-white border-b border-[#e2e8f0]">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-[6px] bg-[#4CAF72] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-[700] text-[13px] text-[#0f172a]">Metapharsic</p>
              <p className="text-[10px] text-[#4CAF72]">Lifesciences EHR</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" className="p-2 rounded-[6px] text-[#475569] hover:bg-[#f8fafc] transition-all active:scale-95">
              <Bell className="h-4 w-4" />
            </button>
            <button aria-label="Search" className="p-2 rounded-[6px] text-[#475569] hover:bg-[#f8fafc] transition-all active:scale-95">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile spacer */}
      <div className="h-14 lg:hidden" />
    </>
  );
}
