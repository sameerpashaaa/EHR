"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Search, Download, Printer, RefreshCw, Sparkles, TrendingUp, Users, ClipboardList, Activity,
  Calendar, CheckCircle, Clock, FileText, ChevronRight, Play, Check, AlertTriangle, ShieldCheck, HelpCircle, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import CountUp from "react-countup";

// ─── ClientOnly Wrapper ─────────────────────────────────────────────────────
function ClientOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}

// ─── Shared card style ─────────────────────────────────────────────────────
const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
  transition: "box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.3s, transform 0.3s cubic-bezier(0.4,0,0.2,1)",
};

const hoverCardStyle = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  el.style.boxShadow = "0 14px 40px rgba(0,0,0,0.10)";
  el.style.borderColor = "rgba(34,197,94,0.25)";
  el.style.transform = "translateY(-6px)";
};

const resetCardStyle = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)";
  el.style.borderColor = "rgba(255,255,255,0.60)";
  el.style.transform = "translateY(0)";
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface ReportMetadata {
  id: string;
  title: string;
  category: "clinical" | "billing" | "operational";
  description: string;
  frequency: "Daily" | "Weekly" | "Monthly" | "Real-time";
  lastRun: string;
  icon: React.ComponentType<{ className?: string }>;
  color: { bg: string; text: string };
}

interface ReportDataPoint {
  label: string;
  value: number;
  secondaryVal?: number;
  percentage?: number;
}

const Stethoscope = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

// ─── Mock Reports Catalog ───────────────────────────────────────────────────
const REPORTS_CATALOG: ReportMetadata[] = [
  {
    id: "rep-clinical-quality",
    title: "Clinical Quality Measures (CQM)",
    category: "clinical",
    description: "Evaluates patient health progress, medication compliance, preventive screenings, and patient follow-up effectiveness.",
    frequency: "Monthly",
    lastRun: "2 days ago",
    icon: Stethoscope,
    color: { bg: "bg-[#E6F1FB]", text: "text-[#185FA5]" }
  },
  {
    id: "rep-scribe-perf",
    title: "AI Scribe & Voice Performance",
    category: "operational",
    description: "Tracks voice capture accuracy, automatic SOAP notes generation speeds, bilingual transcription fidelity, and clinician approval ratios.",
    frequency: "Daily",
    lastRun: "8 hours ago",
    icon: Sparkles,
    color: { bg: "bg-[#EEEDFE]", text: "text-[#534AB7]" }
  },
  {
    id: "rep-billing-claims",
    title: "Claims & Reimbursement Cycles",
    category: "billing",
    description: "Monitors insurance claims approval speeds, payer denial frequencies, aging accounts balance tracking, and MTD clinic revenue audits.",
    frequency: "Real-time",
    lastRun: "Just now",
    icon: BarChart3,
    color: { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]" }
  },
  {
    id: "rep-patient-demographics",
    title: "Patient Demographic & Cohort Analytics",
    category: "operational",
    description: "Averages age distribution, maps geographic patient clusters, breaks down chronic condition risk groups, and schedules metrics.",
    frequency: "Weekly",
    lastRun: "4 days ago",
    icon: Users,
    color: { bg: "bg-[#FBEAF0]", text: "text-[#993556]" }
  }
];

// ──── Main Page Component ──────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "clinical" | "billing" | "operational">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [runningReport, setRunningReport] = useState<string | null>(null);
  const [runProgress, setRunProgress] = useState(0);
  const [executedReport, setExecutedReport] = useState<string | null>(null);
  const [executedReportTitle, setExecutedReportTitle] = useState("");
  const [reportData, setReportData] = useState<ReportDataPoint[]>([]);
  const [chartGrown, setChartGrown] = useState(false);

  useEffect(() => {
    if (executedReport) {
      setChartGrown(false);
      const t = setTimeout(() => setChartGrown(true), 150);
      return () => clearTimeout(t);
    }
  }, [executedReport]);

  const filteredReports = REPORTS_CATALOG.filter((rep) => {
    if (activeCategory !== "all" && rep.category !== activeCategory) return false;
    if (searchQuery && !rep.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !rep.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleRunReport = (report: ReportMetadata) => {
    setExecutedReport(null);
    setRunningReport(report.id);
    setRunProgress(0);
    
    // Simulate step progress
    const steps = 4;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setRunProgress((currentStep / steps) * 100);
      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          setRunningReport(null);
          setExecutedReport(report.id);
          setExecutedReportTitle(report.title);
          
          // Generate visual report mock data points
          if (report.id === "rep-clinical-quality") {
            setReportData([
              { label: "Diabetes HBA1c Control", value: 84, percentage: 84 },
              { label: "Hypertension BP Control", value: 78, percentage: 78 },
              { label: "Preventive Cancer Screenings", value: 92, percentage: 92 },
              { label: "Medication Reconciliation Done", value: 96, percentage: 96 },
              { label: "Immunisation Schedule Followed", value: 89, percentage: 89 }
            ]);
          } else if (report.id === "rep-scribe-perf") {
            setReportData([
              { label: "Speech Transcription Accuracy", value: 98, percentage: 98 },
              { label: "SOAP Auto-Gen Speed (seconds)", value: 84, percentage: 84 }, // scale out of 100
              { label: "Medical Terminology Capture", value: 95, percentage: 95 },
              { label: "Clinician Edit Ratio (No edit)", value: 76, percentage: 76 },
              { label: "Multi-language parsing success", value: 91, percentage: 91 }
            ]);
          } else if (report.id === "rep-billing-claims") {
            setReportData([
              { label: "Claims Accepted First-pass", value: 92, percentage: 92 },
              { label: "Payer Claims Paid in 15 days", value: 74, percentage: 74 },
              { label: "Total Claims Denied & Appealed", value: 14, percentage: 14 },
              { label: "Patient Statement Collection", value: 81, percentage: 81 },
              { label: "Metta AI Coding Audit Match", value: 97, percentage: 97 }
            ]);
          } else {
            setReportData([
              { label: "Age 0-18 Years (Pediatrics)", value: 18, percentage: 18 },
              { label: "Age 19-50 Years (Adults)", value: 45, percentage: 45 },
              { label: "Age 51-70 Years (Geriatric)", value: 25, percentage: 25 },
              { label: "Age 70+ Years (Critical Care)", value: 12, percentage: 12 }
            ]);
          }
        }, 600);
      }
    }, 500);
  };

  return (
    <div 
      className="min-h-screen p-[20px] relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(34,197,94,0.06), transparent 30%),
          radial-gradient(circle at bottom right, rgba(59,130,246,0.06), transparent 30%),
          #f5f7fb
        `,
      }}
    >
      {/* Decorative Orbs */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(34,197,94,0.12)", zIndex: 0 }}
        animate={{ y: [0, -25, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "rgba(59,130,246,0.10)", zIndex: 0 }}
        animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="max-w-[1400px] mx-auto w-full relative z-10 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#101828] flex items-center gap-2.5 font-sora">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[#E1F5EE] flex items-center justify-center">
                <BarChart3 className="w-[18px] h-[18px] text-[#0F6E56]" />
              </div>
              Reports & Analytics
            </h1>
            <p className="text-[#667085] text-xs font-semibold mt-1.5 tracking-wide">Generate clinical outcomes, billing audits, and operational metric worksheets.</p>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Button 
              variant="outline" 
              className="gap-2 font-bold text-xs bg-white/80 backdrop-blur-sm border-[#e2e8f0] text-[#475569] shadow-sm hover:bg-[#f8fafc] rounded-[10px] h-9 px-4 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync Data Sources
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: REPORTS_CATALOG.length, icon: FileText, color: { bg: "bg-[#E6F1FB]", text: "text-[#185FA5]" } },
            { label: "Clinical Quality", value: 98.4, suffix: "%", icon: Activity, color: { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]" } },
            { label: "AI Recognition Rate", value: 98.2, suffix: "%", icon: Sparkles, color: { bg: "bg-[#EEEDFE]", text: "text-[#534AB7]" } },
            { label: "Claims Approval MTD", value: 92.5, suffix: "%", icon: BarChart3, color: { bg: "bg-[#FBEAF0]", text: "text-[#993556]" } },
          ].map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="flex flex-col h-full"
              style={{ ...CARD_STYLE, padding: "16px" }}
              onMouseEnter={hoverCardStyle}
              onMouseLeave={resetCardStyle}
            >
              <div className="flex items-center gap-3.5">
                <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center", s.color.bg)}>
                  <s.icon className={cn("w-5 h-5", s.color.text)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-widest">{s.label}</p>
                  <p className="text-[22px] font-bold text-[#101828] mt-0.5 font-sora leading-none">
                    <ClientOnly fallback={`${s.value}${s.suffix || ""}`}>
                      <CountUp end={s.value} duration={1.5} decimals={s.value % 1 !== 0 ? 1 : 0} />
                      {s.suffix}
                    </ClientOnly>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Split: Left catalog, Right run viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Report List (7 cols) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-1 p-0.5 rounded-[12px] bg-slate-100/70 border border-slate-200/30">
                {(["all", "clinical", "billing", "operational"] as const).map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={cn("px-4 py-1.5 rounded-[10px] text-[11px] font-bold transition-all capitalize active:scale-95",
                      activeCategory === cat 
                        ? "bg-white text-[#0F6E56] shadow-sm border border-slate-200/50" 
                        : "bg-transparent text-[#667085] hover:text-[#101828]"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3] focus-within:text-[#1D9E75]" />
                <input 
                  type="text" 
                  placeholder="Filter catalog..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#e2e8f0] rounded-[12px] text-xs font-semibold text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#12B76A] focus:ring-2 focus:ring-[#12B76A]/10 shadow-sm transition-all" 
                />
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-3.5 flex-1">
              {filteredReports.map((rep, idx) => {
                const RepIcon = rep.icon;
                const isSelected = runningReport === rep.id || executedReport === rep.id;
                return (
                  <motion.div
                    key={rep.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className="relative overflow-hidden cursor-pointer"
                    style={{
                      ...CARD_STYLE,
                      padding: "16px",
                      border: isSelected ? "1px solid rgba(29, 158, 117, 0.4)" : "1px solid rgba(255,255,255,0.60)",
                      boxShadow: isSelected ? "0 10px 25px rgba(0,0,0,0.06)" : "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)"
                    }}
                    onMouseEnter={hoverCardStyle}
                    onMouseLeave={resetCardStyle}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-sm", rep.color.bg)}>
                        <RepIcon className={cn("w-5 h-5", rep.color.text)} />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#101828] text-[14px] font-sora leading-tight">{rep.title}</h3>
                          <span className={cn("text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                            rep.category === "clinical" ? "bg-blue-50 text-[#185FA5] border-blue-100" :
                            rep.category === "billing" ? "bg-emerald-50 text-[#0F6E56] border-emerald-100" : "bg-purple-50 text-[#534AB7] border-purple-100"
                          )}>
                            {rep.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#667085] mt-1.5 font-semibold leading-relaxed line-clamp-2">{rep.description}</p>
                        <p className="text-[10px] text-[#98A2B3] font-bold mt-2 uppercase tracking-wide">Frequency: {rep.frequency} • Last run: {rep.lastRun}</p>
                      </div>
                      
                      <div className="flex items-center justify-center flex-shrink-0 self-center">
                        <Button
                          onClick={() => handleRunReport(rep)}
                          disabled={runningReport !== null}
                          className="h-8 px-3 text-[11px] font-bold rounded-[8px] bg-[#E1F5EE] hover:bg-[#1D9E75] hover:text-white text-[#0F6E56] gap-1 shadow-sm border border-[#1D9E75]/10 active:scale-95 transition-all"
                        >
                          <Play className="w-3 h-3 fill-currentColor" /> Run
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Execution & Viewer (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-stretch h-full">
            <div 
              className="bg-white rounded-[24px] p-6 border flex-1 flex flex-col justify-center min-h-[480px]"
              style={{
                border: "1.5px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.05)"
              }}
            >
              
              {/* State 1: Nothing running, nothing executed */}
              {!runningReport && !executedReport && (
                <div className="text-center p-8 space-y-4">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-[16px] flex items-center justify-center mx-auto shadow-sm">
                    <BarChart3 className="w-7 h-7 text-[#98A2B3]" />
                  </div>
                  <h3 className="font-bold text-[#101828] text-base font-sora">Analytical Engine Ready</h3>
                  <p className="text-xs font-semibold text-[#667085] max-w-xs mx-auto leading-relaxed">Select a clinic quality, billing workflow, or operational report from the catalog and click "Run" to initialize live cohort aggregates.</p>
                </div>
              )}

              {/* State 2: Report Running (Loader) */}
              {runningReport && (
                <div className="text-center p-8 space-y-6">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center mb-6">
                    <Loader2 className="w-10 h-10 text-[#1D9E75] animate-spin" />
                    <div className="absolute inset-0 rounded-full border-2 border-[#1D9E75]/20 border-t-transparent animate-ping" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#101828] text-base font-sora">Executing Analytical Script</h3>
                    <p className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wider">Aggregating DB logs • Metta AI engine active</p>
                  </div>
                  <div className="w-48 bg-slate-100 rounded-full h-2 mx-auto overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
                      style={{ width: `${runProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* State 3: Report Successfully Executed (Render Visual Report) */}
              {executedReport && (
                <div className="flex flex-col h-full space-y-6">
                  
                  {/* Title & Metadata */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#E1F5EE] border border-[#1D9E75]/10 text-[#0F6E56] uppercase tracking-wider font-sora">Report Result</span>
                      <h3 className="font-bold text-[#101828] text-[15px] font-sora mt-1.5 leading-snug">{executedReportTitle}</h3>
                      <p className="text-[10px] text-[#98A2B3] font-bold mt-1 uppercase tracking-wide">Timestamp: {new Date().toLocaleTimeString()} • Accuracy Check: <span className="text-[#12B76A]">99.8% Verified</span></p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-[#f8fafc] border border-slate-100 text-[#475569] hover:text-[#0F6E56] rounded-[8px]" title="Export PDF"><Printer className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-[#f8fafc] border border-slate-100 text-[#475569] hover:text-[#0F6E56] rounded-[8px]" title="Export CSV"><Download className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  {/* Render Visual Graphical Bars */}
                  <div className="flex-1 space-y-4">
                    {reportData.map((data, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#475569]">
                          <span className="truncate pr-4">{data.label}</span>
                          <span className="font-bold text-[#101828] font-mono">{data.value}%</span>
                        </div>
                        <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full"
                            style={{
                              width: chartGrown ? `${data.percentage}%` : "0%",
                              transition: `width 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.08}s`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Signature block */}
                  <div className="bg-[#E1F5EE]/40 p-4 rounded-[16px] border border-[#1D9E75]/15 flex items-center justify-between gap-4 mt-auto">
                    <div>
                      <p className="text-[9px] font-bold text-[#98A2B3] uppercase tracking-wider">Compliance Verification</p>
                      <p className="text-[11px] font-semibold text-[#0F6E56] mt-0.5">HIPAA and E&M standards matched successfully.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-[#12B76A]" />
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
