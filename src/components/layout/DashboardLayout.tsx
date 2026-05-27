"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { SessionUser } from "@/types";
import { FloatingNav } from "./FloatingNav";
import { cn, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRoleDisplayName } from "@/lib/auth/roles";
import dynamic from "next/dynamic";

const AdvancedVoiceAssistant = dynamic(
  () => import("@/components/ai/AdvancedVoiceAssistant").then(m => m.AdvancedVoiceAssistant),
  { ssr: false }
);
import {
  Sparkles, Bell, Settings, LogOut, ChevronDown, ChevronRight,
  Mic, Brain, Users, FileText, Calendar, Stethoscope,
  ClipboardList, TrendingUp, Search, X, Command, Activity, Zap
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: SessionUser;
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Smart Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length === 0) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchResults, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleResultClick = (href: string) => {
    router.push(href);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery) {
      if (searchResults.length > 0) {
        handleResultClick(searchResults[0].href);
      } else {
        router.push(`/patients?q=${encodeURIComponent(searchQuery)}`);
        setSearchOpen(false);
        setSearchQuery("");
      }
    }
    if (e.key === "Escape") setSearchOpen(false);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#f5f7fb" }}>
      <FloatingNav user={user} onExpandChange={setSidebarExpanded} />

      <div
        className="min-h-screen flex flex-col transition-all duration-300 ease-out"
        style={{ marginLeft: sidebarExpanded ? 208 : 72 }}
      >
        {/* Top Header Bar */}
        <header
          className="sticky top-0 z-30"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,255,255,0.4)",
            boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-5 py-2.5 flex items-center justify-between gap-4">

            {/* System Status Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#f0fdf4] border border-[#dcfce7] cursor-pointer hover:bg-[#dcfce7] transition-colors">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-[11px] font-[700] text-[#16a34a] tracking-wide">Metta AI Core</span>
              <span className="text-[10px] text-[#4CAF72] font-mono font-[600]">12ms</span>
            </div>

            {/* Search Bar Trigger */}
            <div className="flex-1 max-w-xl mx-auto">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 rounded-[6px] px-[12px] py-[8px] cursor-text text-left active:scale-[0.99]"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  transition: "width 0.3s ease, border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.40)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
                onFocus={e => {
                  (e.currentTarget as HTMLElement).style.outline = "2px solid rgba(34,197,94,0.5)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 4px rgba(34,197,94,0.1), 0 4px 20px rgba(0,0,0,0.08)";
                }}
                onBlur={e => {
                  (e.currentTarget as HTMLElement).style.outline = "none";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <Search className="w-4 h-4 text-[#94a3b8] flex-shrink-0" />
                <span className="text-[13px] font-[500] text-[#94a3b8] flex-1">
                  Search patients, records…
                </span>
                <div className="flex items-center gap-1 opacity-60">
                  <kbd className="h-5 px-1.5 rounded-[4px] bg-white border border-[#e2e8f0] text-[10px] font-[700] text-[#475569] flex items-center gap-0.5">
                    <Command className="w-2.5 h-2.5" /> K
                  </kbd>
                </div>
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant={isListening ? "default" : "secondary"}
                aria-label="Voice input"
                className={cn(
                  "h-9 w-9 rounded-[6px]",
                  isListening && "bg-[#dc2626] hover:bg-[#b91c1c] border-0"
                )}
                onClick={() => {
                  setIsListening(!isListening);
                  window.dispatchEvent(new CustomEvent('toggle-ai-assistant'));
                }}
              >
                <Mic className="h-4 w-4" />
              </Button>

              <Button size="icon" variant="secondary" aria-label="Notifications" className="h-9 w-9 rounded-[6px] relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#dc2626] ring-2 ring-white" />
              </Button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-[6px] hover:bg-[#f8fafc] border border-transparent hover:border-[#e2e8f0] transition-all focus:outline-none focus:ring-[3px] focus:ring-[#22c55e]/20"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-[#4CAF72] text-white text-[10px] font-[700]">
                      {user?.name ? initials(user.name.split(" ")[0] || "", user.name.split(" ").pop() || "") : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-[13px] font-[700] text-[#0f172a] leading-tight">{user?.name || "User"}</p>
                    <p className="text-[10px] font-[600] text-[#94a3b8] uppercase tracking-wider">{getRoleDisplayName(user?.role || "FRONT_DESK")}</p>
                  </div>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-[#94a3b8] transition-transform hidden md:block", userMenuOpen && "rotate-180")} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-[8px] border border-[#e2e8f0] p-1.5 z-50 animate-fadeIn">
                      <div className="px-3 py-2.5 border-b border-[#e2e8f0] mb-1">
                        <p className="font-[700] text-[#0f172a] text-[13px]">{user?.name || "User"}</p>
                        <p className="text-[11px] text-[#888888]">{user?.email || ""}</p>
                      </div>
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-[500] text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors w-full"
                      >
                        <Settings className="w-4 h-4" />
                        Administration
                      </Link>
                      <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-[500] text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors">
                        <Sparkles className="w-4 h-4" />
                        AI Preferences
                      </button>
                      <div className="h-px bg-[#e2e8f0] my-1 mx-1" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-[600] text-[#dc2626] hover:bg-[#fef2f2] transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Global Smart Search Modal */}
        {searchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4">
            {/* Flat overlay — no blur */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSearchOpen(false)}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-[8px] border border-[#e2e8f0] overflow-hidden flex flex-col max-h-[80vh] animate-fadeIn">

              {/* Search Input */}
              <div className="relative flex items-center px-4 py-3 border-b border-[#e2e8f0]">
                <Search className="w-4 h-4 text-[#4CAF72] mr-3 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search patients, conditions, or ask Metta AI…"
                  className="w-full bg-transparent border-none outline-none text-[15px] font-[500] text-[#0f172a] placeholder:text-[#94a3b8]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="p-1 hover:bg-[#f8fafc] rounded-[4px] text-[#94a3b8] absolute right-14"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="px-2 py-1 bg-[#f8fafc] rounded-[4px] border border-[#e2e8f0] ml-3 flex items-center gap-1">
                  <Command className="w-2.5 h-2.5 text-[#94a3b8]" />
                  <span className="text-[10px] font-[700] text-[#94a3b8]">K</span>
                </div>
              </div>

              {/* Loading */}
              {isSearching && (
                <div className="p-6 flex items-center gap-3 text-[#475569]">
                  <div className="w-4 h-4 border-2 border-[#4CAF72] border-t-transparent rounded-full animate-spin" />
                  <p className="text-[13px] font-[500]">Searching…</p>
                </div>
              )}

              {/* Results */}
              {!isSearching && (
                <div className="overflow-y-auto flex-1 p-2">
                  {searchQuery.length > 0 && searchResults.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-[#f8fafc] rounded-[8px] border border-[#e2e8f0] flex items-center justify-center mx-auto mb-3">
                        <Search className="w-5 h-5 text-[#94a3b8]" />
                      </div>
                      <p className="text-[#0f172a] font-[700] text-[14px] mb-1">No results for "{searchQuery}"</p>
                      <p className="text-[#888888] text-[12px]">Try asking Metta AI to generate a report instead.</p>
                    </div>
                  ) : searchQuery.length > 0 ? (
                    <div className="p-1 space-y-0.5">
                      <p className="px-3 py-2 text-[10px] font-[800] uppercase tracking-[0.08em] text-[#94a3b8]">Results</p>
                      {searchResults.map((result, i) => {
                        const iconMap2: Record<string, any> = { LayoutDashboard: TrendingUp, Calendar, ClipboardList, FileText, Users, MessageCircle: Sparkles, Settings, Sparkles, Mic, Brain, User: Users, Stethoscope };
                        const Icon = iconMap2[result.iconName] || Search;

                        if (result.isExecutable) {
                          const isExecuting = executingAction === result.title;
                          return (
                            <div key={i} className="mb-3 p-4 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc]">
                              <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-[6px] bg-[#f0fdf4] border border-[#dcfce7] flex items-center justify-center flex-shrink-0">
                                  <Icon className="w-4 h-4 text-[#22c55e]" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-[800] text-[#16a34a] uppercase tracking-[0.08em] bg-[#f0fdf4] px-2 py-0.5 rounded-[4px] border border-[#dcfce7]">Autonomous Workflow</span>
                                  </div>
                                  <h4 className="font-[700] text-[#0f172a] text-[14px]">{result.title}</h4>
                                  <div className="mt-2 grid grid-cols-2 gap-2">
                                    {Object.entries(result.actionPayload).map(([key, val]) => (
                                      <div key={key} className="bg-white p-2 rounded-[6px] border border-[#e2e8f0]">
                                        <p className="text-[9px] uppercase tracking-wider text-[#94a3b8] font-[700] mb-0.5">{key}</p>
                                        <p className="text-[12px] font-[600] text-[#0f172a] truncate">{String(val)}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-3">
                                    <Button
                                      onClick={() => {
                                        setExecutingAction(result.title);
                                        setTimeout(() => {
                                          setExecutingAction(null);
                                          setSearchOpen(false);
                                          setSearchQuery("");
                                        }, 2000);
                                      }}
                                      disabled={isExecuting}
                                      className="h-9 px-4 text-[12px]"
                                    >
                                      {isExecuting ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Executing…</>
                                      ) : (
                                        <>Approve & Execute <ChevronRight className="w-3.5 h-3.5 ml-1.5" /></>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => handleResultClick(result.href)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#f8fafc] cursor-pointer transition-all border border-transparent hover:border-[#e2e8f0] text-left group active:scale-[0.99]"
                          >
                            <div className="w-8 h-8 rounded-[6px] bg-[#f8fafc] border border-[#e2e8f0] group-hover:bg-[#f0fdf4] group-hover:border-[#dcfce7] flex items-center justify-center flex-shrink-0 transition-colors">
                              <Icon className="w-4 h-4 text-[#475569] group-hover:text-[#22c55e]" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-[13px] font-[700] text-[#0f172a] truncate">{result.title}</p>
                              <p className="text-[11px] font-[500] text-[#888888] truncate mt-0.5">{result.subtitle}</p>
                            </div>
                            <span className="ml-auto text-[10px] font-[700] text-[#94a3b8] uppercase tracking-[0.06em] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-1 rounded-[4px]">
                              {result.type}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3">
                      <p className="px-2 py-2 text-[10px] font-[800] uppercase tracking-[0.08em] text-[#94a3b8] mb-1">Quick Navigation</p>
                      <div className="flex flex-wrap gap-1.5 px-1">
                        {[
                          { name: "Dashboard", href: "/" },
                          { name: "Voice Hub", href: "/voice" },
                          { name: "Patients", href: "/patients" },
                          { name: "Billing & Claims", href: "/documents" },
                          { name: "System Admin", href: "/admin" },
                        ].map((n) => (
                          <Link
                            key={n.name}
                            href={n.href}
                            onClick={() => setSearchOpen(false)}
                            className="px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f0fdf4] border border-[#e2e8f0] hover:border-[#dcfce7] text-[#475569] hover:text-[#16a34a] text-[12px] font-[600] rounded-[6px] transition-all active:scale-95"
                          >
                            {n.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] font-[500] text-[#94a3b8]">
                  <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded-[4px] border border-[#e2e8f0] bg-white text-[10px]">↑↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded-[4px] border border-[#e2e8f0] bg-white text-[10px]">↵</kbd> Select</span>
                  <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded-[4px] border border-[#e2e8f0] bg-white text-[10px]">ESC</kbd> Close</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#4CAF72]" />
                  <span className="text-[11px] font-[700] text-[#16a34a]">Metta AI</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="p-4 lg:p-5 flex-1">
          {children}
        </main>
      </div>

      <AdvancedVoiceAssistant assistantName="Metta" />
    </div>
  );
}
