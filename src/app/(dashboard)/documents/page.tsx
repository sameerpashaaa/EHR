"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Search, Download, Share2, Mic, Sparkles, User, CheckCircle, Edit3, MoreVertical, Plus,
  DollarSign, Receipt, ChevronDown, ChevronUp, ClipboardList, Zap, BarChart3, RefreshCw, Printer, Send, Activity, ShieldCheck, FileCheck2, Loader2, ArrowUpRight, ArrowDownRight, Minus
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

// ── Types ──────────────────────────────────────────────────────────────────────
interface Document {
  id: string;
  title: string;
  type: "note" | "report" | "transcript" | "summary";
  patient: string;
  patientId: string;
  createdAt: string;
  status: "draft" | "completed" | "verified";
  source: "manual" | "ai-scribe" | "voice";
  size: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  patientId: string;
  dob: string;
  insurance: string;
  insuranceId: string;
  dos: string;
  provider: string;
  facility: string;
  icdCodes: { code: string; description: string }[];
  cptCodes: { code: string; description: string; units: number; charge: number }[];
  totalCharge: number;
  status: "draft" | "submitted" | "accepted" | "denied" | "paid" | "partial";
  paidAmount?: number;
  denialReason?: string;
  submittedAt?: string;
}

interface ARItem {
  id: string;
  claimNumber: string;
  patientName: string;
  insurance: string;
  dos: string;
  billed: number;
  allowed: number;
  paid: number;
  balance: number;
  aging: "0-30" | "31-60" | "61-90" | "90+";
  status: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_DOCUMENTS: Document[] = [
  { id: "d1", title: "Annual Physical - Progress Note", type: "note", patient: "John Smith", patientId: "P12345", createdAt: "2 hours ago", status: "completed", source: "ai-scribe", size: "245 KB" },
  { id: "d2", title: "Cardiology Consultation Report", type: "report", patient: "Sarah Johnson", patientId: "P12346", createdAt: "4 hours ago", status: "verified", source: "manual", size: "1.2 MB" },
  { id: "d3", title: "Voice Transcript - Follow-up", type: "transcript", patient: "Michael Brown", patientId: "P12347", createdAt: "5 hours ago", status: "draft", source: "voice", size: "89 KB" },
  { id: "d4", title: "AI-Generated Visit Summary", type: "summary", patient: "Emily Davis", patientId: "P12348", createdAt: "6 hours ago", status: "completed", source: "ai-scribe", size: "156 KB" },
  { id: "d5", title: "Lab Results Summary", type: "report", patient: "Robert Wilson", patientId: "P12349", createdAt: "1 day ago", status: "verified", source: "manual", size: "456 KB" },
  { id: "d6", title: "Discharge Summary", type: "summary", patient: "Lisa Anderson", patientId: "P12350", createdAt: "1 day ago", status: "completed", source: "ai-scribe", size: "312 KB" },
];

const INITIAL_CLAIMS: Claim[] = [
  {
    id: "c1", claimNumber: "CLM-2024-0012", patientName: "John Smith", patientId: "P12345", dob: "1979-03-15",
    insurance: "Blue Cross Blue Shield", insuranceId: "BCBS-123456789", dos: "2024-02-20",
    provider: "Dr. Sarah Chen", facility: "Metapharsic Medical Center",
    icdCodes: [{ code: "I10", description: "Essential Hypertension" }, { code: "E11.9", description: "Type 2 Diabetes" }],
    cptCodes: [
      { code: "99214", description: "Office Visit, Est. Patient", units: 1, charge: 250 },
      { code: "93000", description: "Electrocardiogram", units: 1, charge: 85 },
    ],
    totalCharge: 335, status: "submitted", submittedAt: "2024-02-20",
  },
  {
    id: "c2", claimNumber: "CLM-2024-0013", patientName: "Maria Garcia", patientId: "P12346", dob: "1992-07-22",
    insurance: "Aetna", insuranceId: "AET-987654321", dos: "2024-02-19",
    provider: "Dr. Michael Ross", facility: "Downtown Clinic",
    icdCodes: [{ code: "R07.9", description: "Chest Pain, unspecified" }],
    cptCodes: [
      { code: "99213", description: "Office Visit, Est. Patient", units: 1, charge: 180 },
      { code: "71046", description: "Chest X-ray 2 views", units: 1, charge: 120 },
    ],
    totalCharge: 300, status: "accepted", submittedAt: "2024-02-19",
  },
  {
    id: "c3", claimNumber: "CLM-2024-0010", patientName: "Robert Johnson", patientId: "P12347", dob: "1966-11-05",
    insurance: "Medicare", insuranceId: "MED-456789123", dos: "2024-02-10",
    provider: "Dr. James Wilson", facility: "Metapharsic Medical Center",
    icdCodes: [{ code: "M79.3", description: "Knee Pain" }],
    cptCodes: [{ code: "99215", description: "Office Visit, Complex", units: 1, charge: 320 }],
    totalCharge: 320, status: "denied", denialReason: "Missing prior authorization", submittedAt: "2024-02-10",
  },
  {
    id: "c4", claimNumber: "CLM-2024-0008", patientName: "Emma Thompson", patientId: "P12348", dob: "1996-04-18",
    insurance: "United Healthcare", insuranceId: "UHC-789123456", dos: "2024-02-05",
    provider: "Dr. Lisa Park", facility: "Downtown Clinic",
    icdCodes: [{ code: "L30.9", description: "Dermatitis, unspecified" }],
    cptCodes: [{ code: "99212", description: "Office Visit, Est. Patient", units: 1, charge: 140 }],
    totalCharge: 140, status: "paid", paidAmount: 112, submittedAt: "2024-02-05",
  },
];

const INITIAL_AR: ARItem[] = [
  { id: "ar1", claimNumber: "CLM-2024-0009", patientName: "David Lee", insurance: "Kaiser Permanente", dos: "2024-02-01", billed: 420, allowed: 380, paid: 0, balance: 380, aging: "0-30", status: "Pending" },
  { id: "ar2", claimNumber: "CLM-2024-0005", patientName: "Sarah Williams", insurance: "Cigna", dos: "2024-01-20", billed: 650, allowed: 600, paid: 300, balance: 300, aging: "31-60", status: "Partial" },
  { id: "ar3", claimNumber: "CLM-2023-0098", patientName: "Michael Brown", insurance: "Aetna", dos: "2023-12-15", billed: 890, allowed: 800, paid: 0, balance: 800, aging: "61-90", status: "Denied - Appeal" },
  { id: "ar4", claimNumber: "CLM-2023-0045", patientName: "Jennifer Davis", insurance: "Medicare", dos: "2023-11-01", billed: 1200, allowed: 1100, paid: 0, balance: 1100, aging: "90+", status: "Collections" },
];

// ── AI Build Modal ─────────────────────────────────────────────────────────────
function AIClaimBuilderModal({ onClose, onComplete }: { onClose: () => void, onComplete: (claim: Claim) => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    { text: "Scanning recent clinical notes...", icon: Search },
    { text: "Extracting ICD-10 diagnosis codes...", icon: Activity },
    { text: "Determining optimal CPT E&M levels...", icon: DollarSign },
    { text: "Validating against NCCI edits...", icon: ShieldCheck },
    { text: "Claim assembled successfully.", icon: FileCheck2 }
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setStep(currentStep);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete({
            id: `c-new-${Date.now()}`,
            claimNumber: `CLM-2024-${Math.floor(Math.random() * 1000).toString().padStart(4, "0")}`,
            patientName: "Michael Brown",
            patientId: "P12347",
            dob: "1980-05-22",
            insurance: "Aetna",
            insuranceId: "AET-112233",
            dos: new Date().toISOString().split("T")[0],
            provider: "Dr. Sarah Chen",
            facility: "Metapharsic Medical Center",
            icdCodes: [{ code: "J01.90", description: "Acute sinusitis, unspecified" }],
            cptCodes: [{ code: "99213", description: "Office Visit, Est. Patient", units: 1, charge: 180 }],
            totalCharge: 180,
            status: "draft"
          });
        }, 1200);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="bg-white/95 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/80 w-full max-w-md overflow-hidden relative p-6 pt-10 pb-8"
      >
        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] rounded-full blur-[40px] pointer-events-none bg-emerald-500/10" />
        <div className="absolute bottom-[-50px] left-[-50px] w-[150px] h-[150px] rounded-full blur-[40px] pointer-events-none bg-cyan-500/10" />
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 rounded-[20px] mx-auto flex items-center justify-center mb-6 relative shadow-lg" style={{ background: "linear-gradient(135deg, #1D9E75, #06B6D4)" }}>
            {step < steps.length - 1 ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
            )}
            <div className="absolute -inset-2 rounded-[24px] border border-cyan-400/30 animate-ping" style={{ animationDuration: "1.5s" }} />
          </div>
          
          <h3 className="text-xl font-bold text-[#101828] mb-2 font-sora">Metta AI Claim Builder</h3>
          <p className="text-[#667085] text-sm mb-8 h-10 font-medium">Intelligent coding from raw consultation data</p>

          <div className="space-y-3 text-left">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isPast = idx < step;
              const isCurrent = idx === step;
              if (idx > step) return null;
              
              return (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className={cn("flex items-center gap-3 p-3 rounded-[12px] border transition-all duration-300", 
                    isPast ? "bg-slate-50 border-slate-100 text-[#667085]" :
                    isCurrent ? "bg-[#E1F5EE] border-[#1D9E75]/20 text-[#0F6E56] font-medium" : "hidden"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isPast ? "text-[#98A2B3]" : "text-[#1D9E75]")} />
                  <span className="text-sm">{s.text}</span>
                  {isCurrent && <span className="ml-auto flex w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />}
                  {isPast && <CheckCircle className="ml-auto w-4 h-4 text-[#12B76A]" />}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Claim Card ──────────────────────────────────────────────────────────────────
function ClaimCard({ claim }: { claim: Claim }) {
  const [expanded, setExpanded] = useState(false);
  
  const statusConfig: Record<string, { color: string; label: string }> = {
    draft: { color: "bg-slate-100 text-[#475569] border border-slate-200", label: "Draft" },
    submitted: { color: "bg-blue-50 text-[#185FA5] border border-blue-100", label: "Submitted" },
    accepted: { color: "bg-cyan-50 text-[#06B6D4] border border-cyan-100", label: "Accepted" },
    denied: { color: "bg-rose-50 text-[#EF4444] border border-rose-100", label: "Denied" },
    paid: { color: "bg-emerald-50 text-[#12B76A] border border-emerald-100", label: "Paid" },
    partial: { color: "bg-amber-50 text-[#F59E0B] border border-amber-100", label: "Partial Pay" },
  };
  const cfg = statusConfig[claim.status] || statusConfig.draft;

  return (
    <div 
      className={cn("bg-white rounded-[20px] border transition-all overflow-hidden")}
      style={{
        border: expanded ? "1px solid rgba(29, 158, 117, 0.4)" : "1px solid rgba(255,255,255,0.60)",
        boxShadow: expanded ? "0 10px 30px rgba(0,0,0,0.08)" : "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)"
      }}
      onMouseEnter={e => {
        if (!expanded) {
          const el = e.currentTarget;
          el.style.transform = "translateY(-4px)";
          el.style.borderColor = "rgba(29,158,117,0.25)";
          el.style.boxShadow = "0 14px 40px rgba(0,0,0,0.10)";
        }
      }}
      onMouseLeave={e => {
        if (!expanded) {
          const el = e.currentTarget;
          el.style.transform = "translateY(0)";
          el.style.borderColor = "rgba(255,255,255,0.60)";
          el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)";
        }
      }}
    >
      <div className="p-5 cursor-pointer flex items-start justify-between gap-4" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-[#f8fafc] border border-slate-100 flex items-center justify-center shadow-sm">
            {claim.status === "draft" ? <Zap className="w-5 h-5 text-amber-500 fill-amber-500/10" /> : <Receipt className="w-5 h-5 text-[#64748b]" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#101828] text-[15px] font-sora">{claim.claimNumber}</span>
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider", cfg.color)}>{cfg.label}</span>
              {claim.status === "denied" && <span className="text-xs font-semibold text-[#EF4444] bg-rose-50 px-2.5 py-0.5 rounded-full">{claim.denialReason}</span>}
              {claim.status === "draft" && <span className="text-xs font-semibold text-amber-600 bg-amber-50/50 px-2.5 py-0.5 rounded-full border border-amber-200/50 flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500"/> AI Built</span>}
            </div>
            <p className="text-[13px] font-semibold text-[#475569] mt-1.5">{claim.patientName} • <span className="text-[#94a3b8] font-normal">DOS: {claim.dos}</span></p>
            <p className="text-[11px] text-[#94a3b8] font-semibold mt-0.5 uppercase tracking-wider">{claim.insurance} • {claim.provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-[18px] font-bold text-[#101828] font-sora">${claim.totalCharge.toFixed(2)}</p>
            {claim.paidAmount !== undefined && <p className="text-xs font-bold text-[#12B76A] mt-0.5">Paid: ${claim.paidAmount.toFixed(2)}</p>}
          </div>
          <div className="w-8 h-8 rounded-full bg-[#f8fafc] flex items-center justify-center border border-slate-100 hover:bg-[#e2e8f0] transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4 text-[#94a3b8]" /> : <ChevronDown className="w-4 h-4 text-[#94a3b8]" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100 bg-[#f8fafc]/50"
          >
            <div className="p-5 grid md:grid-cols-2 gap-6">
              {/* ICD Codes */}
              <div>
                <h4 className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider mb-3 font-sora">Diagnosis Codes (ICD-10)</h4>
                <div className="space-y-2">
                  {claim.icdCodes.map((c) => (
                    <div key={c.code} className="flex items-start gap-3 bg-white p-3 rounded-[12px] border border-slate-100 shadow-sm">
                      <span className="font-mono text-[11px] font-bold text-[#06B6D4] bg-cyan-50 px-2 py-0.5 rounded-[6px] border border-cyan-100">{c.code}</span>
                      <span className="text-[13px] text-[#475569] font-semibold leading-tight pt-0.5">{c.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* CPT Codes */}
              <div>
                <h4 className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider mb-3 font-sora">Procedure Codes (CPT)</h4>
                <div className="space-y-2">
                  {claim.cptCodes.map((c) => (
                    <div key={c.code} className="flex items-center justify-between bg-white p-3 rounded-[12px] border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-[6px] border border-violet-100">{c.code}</span>
                        <span className="text-[13px] text-[#475569] font-semibold truncate max-w-[160px]">{c.description}</span>
                      </div>
                      <span className="font-bold text-[#101828] text-[13px]">${c.charge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 flex items-center justify-end gap-3 flex-wrap">
              {claim.status === "draft" && (
                <Button 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2 shadow-md hover:shadow-lg font-semibold rounded-[10px] text-xs h-9 px-4 active:scale-95 transition-all"
                  style={{ boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}
                >
                  <Send className="w-3.5 h-3.5" /> Finalize & Submit Claim
                </Button>
              )}
              {claim.status === "denied" && (
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-2 shadow-md hover:shadow-lg font-semibold rounded-[10px] text-xs h-9 px-4 active:scale-95 transition-all"
                  style={{ boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> AI Generate Appeal Letter
                </Button>
              )}
              <Button variant="outline" className="gap-2 font-semibold border-slate-200 hover:bg-slate-50 text-[#475569] text-xs rounded-[10px] h-9 px-4">
                <Printer className="w-3.5 h-3.5" /> print CMS-1500
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──── Main Page Component ──────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [filter, setFilter] = useState<"all" | "note" | "report" | "transcript" | "summary">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"documents" | "claims" | "superbill" | "ar">("documents");
  const [isBuildingClaim, setIsBuildingClaim] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    if (filter !== "all" && doc.type !== filter) return false;
    if (searchTerm && !doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !doc.patient.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleAIBuildComplete = (newClaim: Claim) => {
    setIsBuildingClaim(false);
    setClaims([newClaim, ...claims]);
  };

  const claimStats = {
    total: claims.length,
    submitted: claims.filter((c) => c.status === "submitted").length,
    denied: claims.filter((c) => c.status === "denied").length,
    paid: claims.filter((c) => c.status === "paid").length,
    totalBilled: claims.reduce((s, c) => s + c.totalCharge, 0),
  };

  const tabs = [
    { id: "documents", label: "Documents", icon: FileText },
    { id: "claims", label: "Claim Builder", icon: Receipt, badge: claimStats.denied > 0 ? claimStats.denied : undefined },
    { id: "superbill", label: "Superbill", icon: ClipboardList },
    { id: "ar", label: "AR Aging", icon: BarChart3 },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "note": return <FileText className="w-5 h-5 text-[#06B6D4]" />;
      case "report": return <Search className="w-5 h-5 text-violet-500" />;
      case "transcript": return <Mic className="w-5 h-5 text-[#EF4444]" />;
      case "summary": return <Sparkles className="w-5 h-5 text-[#F59E0B]" />;
      default: return <FileText className="w-5 h-5 text-[#94a3b8]" />;
    }
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
        
        {isBuildingClaim && <AIClaimBuilderModal onClose={() => setIsBuildingClaim(false)} onComplete={handleAIBuildComplete} />}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#101828] flex items-center gap-2.5 font-sora">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[#E1F5EE] flex items-center justify-center">
                <FileText className="w-[18px] h-[18px] text-[#0F6E56]" />
              </div>
              Documents & Billing
            </h1>
            <p className="text-[#667085] text-xs font-semibold mt-1.5 tracking-wide">Auto-documentation, intelligent claim builder, and revenue lifecycle.</p>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Button 
              variant="outline" 
              className="gap-2 font-bold text-xs bg-white/80 backdrop-blur-sm border-[#e2e8f0] text-[#475569] shadow-sm hover:bg-[#f8fafc] rounded-[10px] h-9 px-4 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export All
            </Button>
            <Button 
              className="gap-2 text-white text-xs font-bold shadow-md hover:shadow-lg rounded-[10px] h-9 px-4 active:scale-95 transition-all"
              style={{
                background: "linear-gradient(135deg,#1D9E75 0%,#16a34a 100%)",
                boxShadow: "0 4px 12px rgba(29,158,117,0.30)",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(34,197,94,0.4),0 4px 12px rgba(29,158,117,0.30)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(29,158,117,0.30)"; }}
              onClick={() => {
                setActiveTab("claims");
                setIsBuildingClaim(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" /> New Claim
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Documents", value: documents.length, icon: FileText, color: { bg: "bg-[#E6F1FB]", text: "text-[#185FA5]" }, decimals: 0 },
            { label: "AI Generated", value: documents.filter(d=>d.source==="ai-scribe").length, icon: Sparkles, color: { bg: "bg-[#EEEDFE]", text: "text-[#534AB7]" }, decimals: 0 },
            { label: "Active Claims", value: claimStats.total, icon: Receipt, color: { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]" }, decimals: 0 },
            { label: "Total Billed MTD", value: claimStats.totalBilled, prefix: "$", icon: DollarSign, color: { bg: "bg-[#FBEAF0]", text: "text-[#993556]" }, decimals: 0 },
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
                    <ClientOnly fallback={`${s.prefix || ""}${s.value.toLocaleString()}`}>
                      {s.prefix}
                      <CountUp end={s.value} duration={1.5} separator="," decimals={s.decimals} />
                    </ClientOnly>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200/60 pb-1">
          <div className="flex gap-1.5 p-1 rounded-[14px] bg-white/70 border border-slate-200/50 shadow-sm backdrop-blur-sm">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "relative flex items-center gap-2 px-[18px] py-[8px] rounded-[10px] text-[12px] font-bold transition-all duration-300 active:scale-95",
                    isActive ? "text-white" : "text-[#667085] hover:text-[#101828] hover:bg-slate-100/50"
                  )}
                  style={{
                    background: isActive ? "linear-gradient(135deg,#1D9E75 0%,#16a34a 100%)" : "transparent",
                    boxShadow: isActive ? "0 4px 10px rgba(29, 158, 117, 0.2)" : "none"
                  }}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] flex items-center justify-center font-bold absolute -top-1 -right-1 ring-2 ring-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab 1: Documents Tab ────────────────────────────────────────── */}
        {activeTab === "documents" && (
          <motion.div key="docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-1 p-0.5 rounded-[12px] bg-slate-100/70 border border-slate-200/30">
                {(["all", "note", "report", "transcript", "summary"] as const).map((f) => (
                  <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={cn("px-4 py-1.5 rounded-[10px] text-[11px] font-bold transition-all capitalize active:scale-95",
                      filter === f 
                        ? "bg-white text-[#0F6E56] shadow-sm border border-slate-200/50" 
                        : "bg-transparent text-[#667085] hover:text-[#101828]"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3] focus-within:text-[#1D9E75]" />
                <input 
                  type="text" 
                  placeholder="Search documents..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#e2e8f0] rounded-[12px] text-xs font-semibold text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#12B76A] focus:ring-2 focus:ring-[#12B76A]/10 shadow-sm transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc, index) => (
                <motion.div 
                  key={doc.id} 
                  initial={{ opacity: 0, scale: 0.96 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: index * 0.04 }}
                  className="group relative overflow-hidden"
                  style={{ ...CARD_STYLE, padding: "20px" }}
                  onMouseEnter={hoverCardStyle}
                  onMouseLeave={resetCardStyle}
                >
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 bg-white/90 backdrop-blur shadow-sm border border-slate-100 text-[#667085] hover:text-[#0F6E56] rounded-[8px]"
                    >
                      <Download className="w-4 h-4"/>
                    </Button>
                  </div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 bg-[#f8fafc] rounded-[12px] border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {getTypeIcon(doc.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#101828] text-[14px] leading-snug group-hover:text-[#0F6E56] transition-colors line-clamp-2 font-sora">{doc.title}</h3>
                      <p className="text-[12px] text-[#667085] mt-1.5 flex items-center gap-1 font-semibold"><User className="w-3.5 h-3.5 text-[#98A2B3]"/> {doc.patient}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 gap-2">
                    <div className="flex gap-1.5">
                      <span className={cn("px-2 py-0.5 rounded-[4px] text-[9px] uppercase tracking-wider font-extrabold border", 
                        doc.status === "completed" 
                          ? "bg-cyan-50 text-[#06B6D4] border-cyan-100" 
                          : "bg-emerald-50 text-[#12B76A] border-emerald-100"
                      )}>
                        {doc.status}
                      </span>
                      {doc.source === "ai-scribe" && (
                        <span className="px-2 py-0.5 rounded-[4px] bg-violet-50 text-violet-700 text-[9px] uppercase tracking-wider font-extrabold border border-violet-100 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-violet-500"/> AI
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-[#98A2B3]">{doc.createdAt}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Tab 2: Claims Builder Tab ────────────────────────────────────── */}
        {activeTab === "claims" && (
          <motion.div key="claims" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            
            {/* AI Claim Builder Banner */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[24px] p-6 shadow-xl border border-slate-800">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#1D9E75] rounded-full blur-[90px] opacity-15 transform translate-x-1/3 -translate-y-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-600 rounded-full blur-[90px] opacity-15 transform -translate-x-1/3 translate-y-1/3 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #1D9E75, #8b5cf6)" }}>
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-white mb-1 font-sora">Metta AI Claim Generator</h2>
                    <p className="text-slate-300 text-xs font-semibold leading-relaxed max-w-xl">Zero-click medical coding. Automatically analyze clinical notes to extract precise ICD-10 and CPT codes, validated in real-time against current payer rules.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsBuildingClaim(true)} 
                  className="bg-white hover:bg-slate-50 text-[#101828] font-extrabold text-xs px-6 py-5 h-auto rounded-[12px] shadow-lg flex-shrink-0 gap-2 w-full md:w-auto active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-500" fill="currentColor" />
                  Auto-Build from Latest Notes
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {claims.map((claim) => (
                  <motion.div key={claim.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} layout>
                    <ClaimCard claim={claim} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── Tab 3: Superbill Tab ────────────────────────────────────────── */}
        {activeTab === "superbill" && (
          <motion.div key="superbill" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div 
              className="bg-white rounded-[24px] p-8 max-w-4xl mx-auto border"
              style={{
                border: "1.5px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.05)"
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[14px] bg-[#E1F5EE] border border-[#1D9E75]/10 flex items-center justify-center shadow-sm">
                    <ClipboardList className="w-6 h-6 text-[#0F6E56]" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-[#101828] font-sora">Superbill Generator</h2>
                    <p className="text-xs font-semibold text-[#667085] mt-0.5">Itemized receipt for patient self-pay & reimbursement</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2 font-bold text-xs border-slate-200 text-[#475569] hover:bg-slate-50 rounded-[10px] h-9 px-4"><Printer className="w-3.5 h-3.5" /> Print PDF</Button>
                  <Button 
                    className="gap-2 font-bold text-xs text-white shadow-md hover:shadow-lg rounded-[10px] h-9 px-4 active:scale-95 transition-all"
                    style={{
                      background: "linear-gradient(135deg,#1D9E75 0%,#16a34a 100%)",
                      boxShadow: "0 4px 12px rgba(29,158,117,0.25)"
                    }}
                  >
                    <Send className="w-3.5 h-3.5" /> Send to Portal
                  </Button>
                </div>
              </div>

              {/* Practice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
                <div>
                  <h3 className="font-bold text-[#101828] text-base tracking-tight font-sora">METAPHARSIC MEDICAL CENTER</h3>
                  <p className="text-xs font-semibold text-[#667085] mt-1.5">123 Healthcare Ave, Medical City, CA 90210</p>
                  <p className="text-xs font-semibold text-[#667085] mt-0.5">(555) 123-4567 • NPI: <span className="text-[#101828] font-extrabold font-mono">1234567890</span></p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="inline-block bg-[#f8fafc] border border-slate-100 rounded-[12px] px-4 py-2">
                    <p className="text-[9px] font-bold text-[#98A2B3] uppercase tracking-wider mb-1">Receipt Number</p>
                    <p className="text-base font-bold text-[#0F6E56] font-mono leading-none">SB-2024-0012</p>
                  </div>
                  <p className="text-xs font-bold text-[#667085] mt-2">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient & Insurance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-[#f8fafc] rounded-[16px] border border-slate-100">
                  <h4 className="text-[9px] font-bold text-[#98A2B3] uppercase tracking-wider mb-2 font-sora">Patient Details</h4>
                  <p className="font-bold text-[#101828] text-base mb-1 font-sora">John Smith</p>
                  <p className="text-xs font-semibold text-[#667085]">DOB: 03/15/1979 • MRN: <span className="font-extrabold text-[#475569] font-mono">PT12345</span></p>
                  <p className="text-xs font-semibold text-[#667085] mt-0.5">456 Main St, CA 90210</p>
                </div>
                <div className="p-4 bg-[#f8fafc] rounded-[16px] border border-slate-100">
                  <h4 className="text-[9px] font-bold text-[#98A2B3] uppercase tracking-wider mb-2 font-sora">Coverage Info</h4>
                  <p className="font-bold text-[#101828] text-base mb-1 font-sora">Blue Cross Blue Shield</p>
                  <p className="text-xs font-semibold text-[#667085]">ID: <span className="font-mono font-bold text-[#475569]">BCBS-123456789</span></p>
                  <p className="text-xs font-semibold text-[#667085] mt-0.5">Group: <span className="font-mono font-bold text-[#475569]">GRP-456</span></p>
                </div>
              </div>

              {/* Services Table */}
              <div className="border border-slate-100 rounded-[16px] overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-[#f8fafc] border-b border-slate-100">
                    <tr>
                      {["DOS", "CPT/HCPCS", "Description", "ICD-10", "Qty", "Fee"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-[9px] font-bold text-[#98A2B3] uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {[
                      { dos: "02/20/24", cpt: "99214", desc: "Office Visit, Est. Patient", icd: "I10, E11.9", units: 1, fee: 250 },
                      { dos: "02/20/24", cpt: "93000", desc: "Electrocardiogram, routine", icd: "I10", units: 1, fee: 85 },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-[#667085]">{row.dos}</td>
                        <td className="px-5 py-4 font-mono font-bold text-violet-600">
                          <span className="bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-[4px]">{row.cpt}</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-[#101828]">{row.desc}</td>
                        <td className="px-5 py-4 font-mono text-[10px] font-bold text-[#06B6D4]">
                          <span className="bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-[4px]">{row.icd}</span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-[#667085]">{row.units}</td>
                        <td className="px-5 py-4 font-bold text-[#101828] text-[13px]">${row.fee.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-[#f8fafc] p-5 px-6 border-t border-slate-100 flex justify-between items-center">
                  <p className="font-bold text-[#667085] uppercase tracking-widest text-[10px] font-sora">Total Amount Due</p>
                  <p className="font-bold text-2xl text-[#101828] font-sora">$335.00</p>
                </div>
              </div>

              {/* Signature Banner */}
              <div className="flex items-center gap-4 bg-[#E1F5EE]/50 p-4 rounded-[16px] border border-[#1D9E75]/15">
                <div className="flex flex-col gap-1 w-full pl-2">
                  <h4 className="text-[9px] font-bold text-[#0F6E56] uppercase tracking-wider font-sora">Provider Signature Validation</h4>
                  <p className="text-[13px] font-semibold text-[#0F6E56]">Dr. Sarah Chen, MD <span className="font-normal text-[#1D9E75]/70 mx-2">•</span> Electronically signed <span className="font-normal text-[#1D9E75]/70 mx-2">•</span> {new Date().toLocaleDateString()}</p>
                </div>
                <div className="w-11 h-11 bg-white rounded-[12px] border border-[#1D9E75]/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-[#12B76A]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Tab 4: AR Aging Tab ─────────────────────────────────────────── */}
        {activeTab === "ar" && (
          <motion.div key="ar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* AR buckets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { bucket: "0-30 Days", val: 640, color: { border: "border-emerald-100", text: "text-[#12B76A]", bg: "bg-emerald-50/50" } },
                { bucket: "31-60 Days", val: 300, color: { border: "border-amber-100", text: "text-[#F59E0B]", bg: "bg-amber-50/50" } },
                { bucket: "61-90 Days", val: 800, color: { border: "border-orange-100", text: "text-orange-500", bg: "bg-orange-50/50" } },
                { bucket: "90+ Days (Critical)", val: 1100, color: { border: "border-rose-200", text: "text-[#EF4444]", bg: "bg-rose-50/50" } },
              ].map((b) => (
                <div 
                  key={b.bucket} 
                  className={cn("bg-white border text-center p-5 rounded-[20px] transition-all")}
                  style={{
                    border: `1.5px solid rgba(255,255,255,0.8)`,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
                    ...CARD_STYLE
                  }}
                  onMouseEnter={hoverCardStyle}
                  onMouseLeave={resetCardStyle}
                >
                  <p className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider mb-2">{b.bucket}</p>
                  <div className="flex justify-center items-center gap-1.5">
                    <p className={cn("text-2xl font-bold font-sora leading-none", b.color.text)}>
                      <ClientOnly fallback={`$${b.val.toLocaleString()}`}>
                        $<CountUp end={b.val} duration={1.5} separator="," />
                      </ClientOnly>
                    </p>
                  </div>
                  <div className={cn("mt-2.5 text-[9px] font-extrabold uppercase py-0.5 rounded-full inline-block px-3 border", b.color.text, b.color.border, b.color.bg)}>
                    Active Life
                  </div>
                </div>
              ))}
            </div>

            {/* detailed table */}
            <div 
              className="bg-white rounded-[24px] border overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.60)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)"
              }}
            >
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#101828] text-base font-sora">Detailed Aging Report</h3>
                  <p className="text-xs text-[#667085] mt-1 font-semibold">Real-time outstanding balances grouped by insurance provider aging.</p>
                </div>
                <div className="flex gap-2 self-start sm:self-auto">
                  <Button variant="outline" className="gap-2 font-bold text-xs border-slate-200 text-[#475569] hover:bg-slate-50 rounded-[10px] h-9 px-4 shadow-sm"><Download className="w-3.5 h-3.5"/> CSV Export</Button>
                  <Button 
                    className="text-white font-bold text-xs gap-2 shadow-md hover:shadow-lg rounded-[10px] h-9 px-4 active:scale-95 transition-all"
                    style={{
                      background: "linear-gradient(135deg,#1D9E75 0%,#16a34a 100%)",
                      boxShadow: "0 4px 12px rgba(29,158,117,0.25)"
                    }}
                  >
                    <RefreshCw className="w-3.5 h-3.5"/> Sync Payer Data
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#f8fafc] border-b border-slate-100">
                    <tr>
                      {["Claim #", "Patient", "Payer", "DOS", "Total Billed", "Expected", "Paid", "Balance", "Bucket", "Status"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-[9px] font-bold text-[#98A2B3] uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {INITIAL_AR.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-[#06B6D4] whitespace-nowrap">
                          <span className="bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-[4px]">{item.claimNumber}</span>
                        </td>
                        <td className="px-5 py-4 font-bold text-[#101828] whitespace-nowrap">{item.patientName}</td>
                        <td className="px-5 py-4 font-semibold text-[#667085] whitespace-nowrap">{item.insurance}</td>
                        <td className="px-5 py-4 font-semibold text-[#94a3b8] whitespace-nowrap">{item.dos}</td>
                        <td className="px-5 py-4 font-bold text-[#101828] whitespace-nowrap">${item.billed.toLocaleString()}</td>
                        <td className="px-5 py-4 font-bold text-[#667085] whitespace-nowrap">${item.allowed.toLocaleString()}</td>
                        <td className="px-5 py-4 font-bold text-[#12B76A] whitespace-nowrap">${item.paid.toLocaleString()}</td>
                        <td className="px-5 py-4 font-bold text-[#EF4444] whitespace-nowrap">${item.balance.toLocaleString()}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider border", 
                            item.aging === "0-30" ? "bg-emerald-50 text-[#12B76A] border-emerald-100" :
                            item.aging === "31-60" ? "bg-amber-50 text-[#F59E0B] border-amber-100" :
                            item.aging === "61-90" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-rose-50 text-[#EF4444] border-rose-100"
                          )}>
                            {item.aging}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-bold text-[10px] uppercase tracking-widest text-[#667085] font-sora">{item.status}</span>
                            {item.aging === "90+" && <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold text-[#EF4444] border-rose-200 hover:bg-rose-50 rounded-[8px] px-3">Collections</Button>}
                            {item.aging === "61-90" && <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold text-amber-600 border-amber-200 hover:bg-amber-50 rounded-[8px] px-3">Appeal</Button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
