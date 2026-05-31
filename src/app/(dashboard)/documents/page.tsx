"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Search, Download, Share2, Mic, Sparkles, User, CheckCircle, Edit3, MoreVertical, Plus,
  DollarSign, Receipt, ChevronDown, ChevronUp, ClipboardList, Zap, BarChart3, RefreshCw, Printer, Send, Activity, ShieldCheck, FileCheck2, Loader2, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, CheckSquare
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
import { 
  ClinicalDocument, Claim, ArRecord, PriorAuthRequest, AuditEntry, PayerProfile
} from "./_types/billing.types";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const INITIAL_DOCUMENTS: ClinicalDocument[] = [
  { 
    id: "d1", title: "Annual Physical - Progress Note", type: "Note", patient: "John Smith", patientId: "P12345", createdAt: "2 hours ago", updatedAt: "2 hours ago", status: "completed", source: "ai-scribe",
    versions: [
      { versionId: 'v1-d1', versionNum: 1, editedBy: 'Dr. Priya Nair', editedAt: '2024-11-12T09:00:00Z', summary: 'Initial draft created by AI scribe', content: '[Mock note content — lorem ipsum clinical text for version 1]' },
      { versionId: 'v2-d1', versionNum: 2, editedBy: 'Dr. Priya Nair', editedAt: '2024-11-12T11:30:00Z', summary: 'Added physical exam findings and amended assessment', content: '[Mock note content — lorem ipsum clinical text for version 2]' }
    ],
    tags: ['cardiology', 'follow-up'], qualityScore: 84,
  },
  { 
    id: "d2", title: "Cardiology Consultation Report", type: "Report", patient: "Sarah Johnson", patientId: "P12346", createdAt: "4 hours ago", updatedAt: "4 hours ago", status: "verified", source: "manual",
    versions: [{ versionId: 'v1-d2', versionNum: 1, editedBy: 'Dr. Priya Nair', editedAt: '2024-11-12T09:00:00Z', summary: 'Initial', content: '' }], tags: [], qualityScore: 92
  },
  { 
    id: "d3", title: "Voice Transcript - Follow-up", type: "Transcript", patient: "Michael Brown", patientId: "P12347", createdAt: "5 hours ago", updatedAt: "5 hours ago", status: "draft", source: "voice",
    versions: [{ versionId: 'v1-d3', versionNum: 1, editedBy: 'AI', editedAt: '2024-11-12T09:00:00Z', summary: 'Initial', content: '' }], tags: [], qualityScore: 78
  },
  { 
    id: "d4", title: "AI-Generated Visit Summary", type: "Summary", patient: "Emily Davis", patientId: "P12348", createdAt: "6 hours ago", updatedAt: "6 hours ago", status: "completed", source: "ai-scribe",
    versions: [{ versionId: 'v1-d4', versionNum: 1, editedBy: 'AI', editedAt: '2024-11-12T09:00:00Z', summary: 'Initial', content: '' }], tags: [], qualityScore: 88
  },
  { 
    id: "d5", title: "Lab Results Summary", type: "Report", patient: "Robert Wilson", patientId: "P12349", createdAt: "1 day ago", updatedAt: "1 day ago", status: "verified", source: "manual",
    versions: [{ versionId: 'v1-d5', versionNum: 1, editedBy: 'Dr. Priya Nair', editedAt: '2024-11-12T09:00:00Z', summary: 'Initial', content: '' }], tags: [], qualityScore: 95
  },
  { 
    id: "d6", title: "Discharge Summary", type: "Summary", patient: "Lisa Anderson", patientId: "P12350", createdAt: "1 day ago", updatedAt: "1 day ago", status: "completed", source: "ai-scribe",
    versions: [{ versionId: 'v1-d6', versionNum: 1, editedBy: 'AI', editedAt: '2024-11-12T09:00:00Z', summary: 'Initial', content: '' }], tags: [], qualityScore: 81
  },
  {
    id: 'doc-007',
    title: 'Discharge Summary — Rajan Mehta',
    patient: 'Rajan Mehta', patientId: 'P-007',
    type: 'Note', source: 'ai-scribe', status: 'draft',
    createdAt: '2024-12-01T14:00:00Z', updatedAt: '2024-12-01T14:00:00Z',
    encounterId: 'ENC-091',
    coSignature: {
      requiredBy: 'Dr. Anand Sharma', requestedAt: '2024-12-01T14:05:00Z',
      status: 'pending'
    },
    versions: [{ versionId: 'v1-doc-007', versionNum: 1,
      editedBy: 'Resident Dr. Ayesha Khan', editedAt: '2024-12-01T14:00:00Z',
      summary: 'Draft discharge note by resident', content: '[Mock discharge summary text]' }],
    qualityScore: 71, tags: ['discharge', 'inpatient']
  },
  {
    id: 'doc-008',
    title: 'Informed Consent — Surgical Procedure',
    patient: 'Sunita Rao', patientId: 'P-008',
    type: 'Report', source: 'manual', status: 'draft',
    createdAt: '2024-12-02T10:00:00Z', updatedAt: '2024-12-02T10:00:00Z',
    encounterId: 'ENC-092',
    coSignature: {
      requiredBy: 'Dr. Priya Nair', requestedAt: '2024-12-02T10:05:00Z',
      status: 'pending'
    },
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 14 days
    versions: [{ versionId: 'v1-doc-008', versionNum: 1,
      editedBy: 'Nurse Kavitha', editedAt: '2024-12-02T10:00:00Z',
      summary: 'Consent form prepared', content: '[Mock consent text]' }],
    qualityScore: 90, tags: ['consent', 'surgical']
  }
];

const INITIAL_CLAIMS: Claim[] = [
  {
    id: "c1", patient: "John Smith", patientId: "P12345",
    payer: "Blue Cross Blue Shield", dos: "2024-02-20",
    provider: "Dr. Sarah Chen",
    icdCodes: [{ code: "I10", description: "Essential Hypertension", primary: true }, { code: "E11.9", description: "Type 2 Diabetes", primary: false }],
    cptCodes: [
      { code: "99214", description: "Office Visit, Est. Patient", units: 1, charge: 250, confidence: 95 },
      { code: "93000", description: "Electrocardiogram", units: 1, charge: 85, confidence: 98 },
    ],
    totalCharge: 335, status: "Submitted", submittedAt: "2024-02-20", notes: [],
    eraStatus: 'pending'
  },
  {
    id: "c2", patient: "Maria Garcia", patientId: "P12346",
    payer: "Aetna", dos: "2024-02-19",
    provider: "Dr. Michael Ross", 
    icdCodes: [{ code: "R07.9", description: "Chest Pain, unspecified", primary: true }],
    cptCodes: [
      { code: "99213", description: "Office Visit, Est. Patient", units: 1, charge: 180, confidence: 85 },
      { code: "71046", description: "Chest X-ray 2 views", units: 1, charge: 120, confidence: 90 },
    ],
    totalCharge: 300, status: "Accepted", submittedAt: "2024-02-19", notes: [],
    eraStatus: 'pending'
  },
  {
    id: "c3", patient: "Robert Johnson", patientId: "P12347",
    payer: "Medicare", dos: "2024-02-10",
    provider: "Dr. James Wilson", 
    icdCodes: [{ code: "M79.3", description: "Knee Pain", primary: true }],
    cptCodes: [{ code: "99215", description: "Office Visit, Complex", units: 1, charge: 320, confidence: 75 }],
    totalCharge: 320, status: "Denied", denialReason: "Missing prior authorization", denialCode: "CO-16", submittedAt: "2024-02-10", notes: [],
    eraStatus: 'pending'
  },
  {
    id: "c4", patient: "Emma Thompson", patientId: "P12348",
    payer: "United Healthcare", dos: "2024-02-05",
    provider: "Dr. Lisa Park",
    icdCodes: [{ code: "L30.9", description: "Dermatitis, unspecified", primary: true }],
    cptCodes: [{ code: "99212", description: "Office Visit, Est. Patient", units: 1, charge: 140, confidence: 92 }],
    totalCharge: 140, status: "Paid", paidAmount: 112, submittedAt: "2024-02-05", notes: [],
    eraStatus: '835-received'
  },
];

const INITIAL_AR: ArRecord[] = [
  { id: "ar1", claimId: "c1", patient: "David Lee", patientId: "P12351", payer: "Kaiser Permanente", dos: "2024-02-01", billed: 420, paid: 0, balance: 380, bucket: "0-30", daysPending: 25, followUpHistory: [] },
  { id: "ar2", claimId: "c2", patient: "Sarah Williams", patientId: "P12352", payer: "Cigna", dos: "2024-01-20", billed: 650, paid: 300, balance: 300, bucket: "31-60", daysPending: 45, followUpHistory: [{ id: 'f1', date: '2024-02-15', type: 'portal', outcome: 'Claim under review', user: 'Admin' }] },
  { id: "ar3", claimId: "c3", patient: "Michael Brown", patientId: "P12347", payer: "Aetna", dos: "2023-12-15", billed: 890, paid: 0, balance: 800, bucket: "61-90", daysPending: 80, followUpHistory: [] },
  { id: "ar4", claimId: "c4", patient: "Jennifer Davis", patientId: "P12353", payer: "Medicare", dos: "2023-11-01", billed: 1200, paid: 0, balance: 1100, bucket: "90+", daysPending: 120, followUpHistory: [{ id: 'f2', date: '2023-12-01', type: 'call', outcome: 'Left voicemail', user: 'Admin' }, { id: 'f3', date: '2024-01-15', type: 'portal', outcome: 'Still pending', user: 'Admin' }, { id: 'f4', date: '2024-02-20', type: 'call', outcome: 'Rep said check back in 30 days', user: 'Admin' }] },
];

const INITIAL_PRIOR_AUTHS: PriorAuthRequest[] = [
  { id: 'PA-001', patient: 'Aravind Kumar', patientId: 'P-001', payer: 'Star Health Insurance', cptCode: '27447', icdCode: 'M17.11', submittedAt: '2024-11-20T09:00:00Z', expiresAt: '2025-02-20T00:00:00Z', status: 'approved', authNumber: 'SH-2024-77821', daysRemaining: 82, claimId: 'CLM-001' },
  { id: 'PA-002', patient: 'Lakshmi Devi', patientId: 'P-002', payer: 'HDFC ERGO', cptCode: '43239', icdCode: 'K21.0', submittedAt: '2024-11-28T10:00:00Z', status: 'pending', daysRemaining: undefined, claimId: undefined },
  { id: 'PA-003', patient: 'Rajan Mehta', patientId: 'P-007', payer: 'New India Assurance', cptCode: '63047', icdCode: 'M51.16', submittedAt: '2024-11-10T08:00:00Z', expiresAt: '2024-12-10T00:00:00Z', status: 'expired', authNumber: 'NIA-44312', daysRemaining: -3, claimId: 'CLM-004' },
  { id: 'PA-004', patient: 'Sunita Rao', patientId: 'P-008', payer: 'United India', cptCode: '27130', icdCode: 'M16.11', submittedAt: '2024-12-01T11:00:00Z', status: 'denied', daysRemaining: undefined, claimId: undefined }
];

const INITIAL_AUDIT_ENTRIES: AuditEntry[] = [
  { id: 'AUD-001', timestamp: '2024-12-03T08:12:00Z', user: 'Dr. Priya Nair', role: 'Physician', action: 'sign', entity: 'document', entityId: 'doc-001', entityLabel: 'SOAP Note — Aravind Kumar', ipAddress: '192.168.1.10', details: 'Co-signature applied' },
  { id: 'AUD-002', timestamp: '2024-12-03T08:45:00Z', user: 'Billing Admin Rekha', role: 'Biller', action: 'submit', entity: 'claim', entityId: 'CLM-002', entityLabel: 'Claim — Lakshmi Devi', ipAddress: '192.168.1.22' },
  { id: 'AUD-003', timestamp: '2024-12-03T09:10:00Z', user: 'Dr. Anand Sharma', role: 'Attending', action: 'view', entity: 'document', entityId: 'doc-007', entityLabel: 'Discharge Summary — Rajan Mehta', ipAddress: '192.168.1.15' },
  { id: 'AUD-004', timestamp: '2024-12-03T09:30:00Z', user: 'Billing Admin Rekha', role: 'Biller', action: 'export', entity: 'ar-record', entityId: 'AR-001', entityLabel: 'AR Ledger Export', ipAddress: '192.168.1.22', details: 'CSV export, 42 records' },
  { id: 'AUD-005', timestamp: '2024-12-03T10:00:00Z', user: 'Resident Dr. Ayesha Khan', role: 'Resident', action: 'create', entity: 'document', entityId: 'doc-007', entityLabel: 'Discharge Summary — Rajan Mehta', ipAddress: '192.168.1.31' }
];

const INITIAL_PAYERS: PayerProfile[] = [
  { id: 'PAY-001', name: 'Star Health Insurance', avgDaysToPay: 18, benchmarkDays: 21, denialRate: 8, underpaymentRate: 4, filingDeadlineDays: 180, portalUrl: 'https://providers.starhealth.in', appealFax: '044-2345-6789', appealPhone: '1800-425-2255', notes: 'Requires itemized bills for all surgical claims. Appeals turnaround: 30 days.', performanceScore: 82 },
  { id: 'PAY-002', name: 'HDFC ERGO', avgDaysToPay: 31, benchmarkDays: 21, denialRate: 14, underpaymentRate: 9, filingDeadlineDays: 90, portalUrl: 'https://portal.hdfcergo.com', appealFax: '022-6234-6300', appealPhone: '022-6234-6234', notes: 'High denial rate for day surgeries. Always include pre-auth for procedures >₹50k.', performanceScore: 54 },
  { id: 'PAY-003', name: 'New India Assurance', avgDaysToPay: 42, benchmarkDays: 21, denialRate: 18, underpaymentRate: 12, filingDeadlineDays: 365, portalUrl: 'https://newindia.co.in/portal', appealFax: '022-2270-0409', appealPhone: '1800-209-1415', notes: 'Slowest payer. Submit appeals via fax; portal frequently down.', performanceScore: 31 }
];


import { ToastProvider } from "./_components/ToastContext";
import { useAuditLogger } from "./_hooks/useAuditLogger";

import { ExpiryAlertBanner } from "./_components/ExpiryAlertBanner";
import { BulkOperationsBar } from "./_components/BulkOperationsBar";
import { CoSignatureWorkflow } from "./_components/CoSignatureWorkflow";
import { DocumentCard } from "./_components/DocumentCard";
import { SuperbillTab } from "./_components/SuperbillTab";
import { ArAgingTab } from "./_components/ArAgingTab";
import { PriorAuthHub } from "./_components/PriorAuthHub";
import { AuditTrailLog } from "./_components/AuditTrailLog";
import { RevenueAnalyticsDashboard } from "./_components/RevenueAnalyticsDashboard";
import { RevenueLeakageDetector } from "./_components/RevenueLeakageDetector";
import { AIClaimBuilderModal } from "./_components/AIClaimBuilderModal";
import { ClaimCard } from "./_components/ClaimCard";
import { EraStatusPoller } from "./_components/EraStatusPoller";
import { BatchSubmitBar } from "./_components/BatchClaimSubmitter";

// ──── Main Page Component ──────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ClinicalDocument[]>(INITIAL_DOCUMENTS);
  const [claims, setClaims] = useState<Claim[]>(INITIAL_CLAIMS);
  const [arRecords, setArRecords] = useState<ArRecord[]>(INITIAL_AR);
  const [priorAuths, setPriorAuths] = useState<PriorAuthRequest[]>(INITIAL_PRIOR_AUTHS);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(INITIAL_AUDIT_ENTRIES);
  const { log } = useAuditLogger(setAuditEntries);

  const [filter, setFilter] = useState<"all" | "Note" | "Report" | "Transcript" | "Summary">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"documents" | "claims" | "superbill" | "ar" | "prior-auth" | "audit" | "revenue">("documents");
  const [isBuildingClaim, setIsBuildingClaim] = useState(false);

  const [isModuleReady, setIsModuleReady] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showLeakageDetector, setShowLeakageDetector] = useState(false);

  useEffect(() => {
    // Simulate fetching initial data
    setTimeout(() => setIsModuleReady(true), 800);
  }, []);

  const filteredDocs = documents.filter((doc) => {
    if (filter !== "all" && doc.type !== filter) return false;
    if (searchTerm && !doc.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !doc.patient.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAIBuildComplete = (newClaim: Claim) => {
    setIsBuildingClaim(false);
    setClaims([newClaim, ...claims]);
    log('create', 'claim', newClaim.id, `Claim — ${newClaim.patient}`);
  };

  const claimStats = {
    total: claims.length,
    submitted: claims.filter((c) => c.status === "Submitted").length,
    denied: claims.filter((c) => c.status === "Denied").length,
    paid: claims.filter((c) => c.status === "Paid").length,
    totalBilled: claims.reduce((s, c) => s + c.totalCharge, 0),
  };

  const tabs = [
    { id: "documents", label: "Documents", icon: FileText },
    { id: "claims", label: "Claim Builder", icon: Receipt, badge: claimStats.denied > 0 ? claimStats.denied : undefined },
    { id: "superbill", label: "Superbill", icon: ClipboardList },
    { id: "ar", label: "AR Aging", icon: BarChart3 },
    { id: "prior-auth", label: "Prior Auth Hub", icon: ShieldCheck, isNew: true },
    { id: "audit", label: "Audit Trail", icon: Activity, isNew: true },
    { id: "revenue", label: "Revenue Analytics", icon: DollarSign, isNew: true },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Note": return <FileText className="w-5 h-5 text-[#06B6D4]" />;
      case "Report": return <Search className="w-5 h-5 text-violet-500" />;
      case "Transcript": return <Mic className="w-5 h-5 text-[#EF4444]" />;
      case "Summary": return <Sparkles className="w-5 h-5 text-[#F59E0B]" />;
      default: return <FileText className="w-5 h-5 text-[#94a3b8]" />;
    }
  };

  return (
    <ToastProvider>
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
          {!isModuleReady ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pt-10">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="bg-gray-200/50 animate-pulse rounded-xl h-24" />)}
              </div>
              <div className="flex gap-2">
                {[1,2,3,4].map(i => <div key={i} className="bg-gray-200/50 animate-pulse rounded-lg w-24 h-10" />)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="bg-gray-200/50 animate-pulse rounded-xl h-48" />)}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 transition-opacity duration-300">
              {isBuildingClaim && <AIClaimBuilderModal onClose={() => setIsBuildingClaim(false)} onComplete={handleAIBuildComplete} />}
              {showLeakageDetector && <RevenueLeakageDetector onClose={() => setShowLeakageDetector(false)} />}

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
              onClick={() => setShowLeakageDetector(true)}
              className="gap-2 font-bold text-xs bg-white/80 backdrop-blur-sm border-[#e2e8f0] text-violet-600 shadow-sm hover:bg-violet-50 rounded-[10px] h-9 px-4 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Run leakage scan
            </Button>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Documents", value: documents.length, icon: FileText, color: { bg: "bg-[#E6F1FB]", text: "text-[#185FA5]" }, decimals: 0 },
            { label: "AI Generated", value: documents.filter(d=>d.source==="ai-scribe").length, icon: Sparkles, color: { bg: "bg-[#EEEDFE]", text: "text-[#534AB7]" }, decimals: 0 },
            { label: "Active Claims", value: claimStats.total, icon: Receipt, color: { bg: "bg-[#E1F5EE]", text: "text-[#0F6E56]" }, decimals: 0 },
            { label: "Total Billed MTD", value: claimStats.totalBilled, prefix: "$", icon: DollarSign, color: { bg: "bg-[#FBEAF0]", text: "text-[#993556]" }, decimals: 0 },
            { label: "First-Pass Rate", value: 91.2, suffix: "%", icon: CheckCircle, color: { bg: "bg-emerald-50", text: "text-emerald-700" }, decimals: 1 },
            { label: "Expiring PAs", value: priorAuths.filter(pa => pa.daysRemaining !== undefined && pa.daysRemaining <= 7).length, icon: AlertTriangle, color: { bg: "bg-amber-50", text: "text-amber-700" }, decimals: 0 },
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
                  <p className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-widest leading-tight">{s.label}</p>
                  <p className="text-[20px] font-bold text-[#101828] mt-0.5 font-sora leading-none">
                    <ClientOnly fallback={`${s.prefix || ""}${s.value.toLocaleString()}${s.suffix || ""}`}>
                      {s.prefix}
                      <CountUp end={s.value} duration={1.5} separator="," decimals={s.decimals} />
                      {s.suffix}
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
            <CoSignatureWorkflow documents={documents} setDocuments={setDocuments} logAudit={log} />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-1 p-0.5 rounded-[12px] bg-slate-100/70 border border-slate-200/30 items-center">
                {(["all", "Note", "Report", "Transcript", "Summary"] as const).map((f) => (
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
                <div className="w-px h-5 bg-gray-300 mx-1"></div>
                <button
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    if (isSelectMode) setSelectedIds([]);
                  }}
                  className={cn("border rounded-md px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors",
                    isSelectMode ? "bg-green-50 border-green-300 text-green-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Select
                </button>
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

            <ExpiryAlertBanner documents={documents} setDocuments={setDocuments} />

            <BulkOperationsBar 
              selectedIds={selectedIds} 
              setSelectedIds={setSelectedIds} 
              setDocuments={setDocuments} 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <DocumentCard 
                  key={doc.id}
                  doc={doc}
                  isSelectMode={isSelectMode}
                  isSelected={selectedIds.includes(doc.id)}
                  onToggleSelect={() => toggleSelect(doc.id)}
                  setDocuments={setDocuments}
                  logAudit={log}
                />
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
                <div className="flex flex-col gap-2 w-full md:w-auto items-end">
                  <EraStatusPoller claims={claims} setClaims={setClaims} />
                  <Button 
                    onClick={() => setIsBuildingClaim(true)} 
                    className="bg-white hover:bg-slate-50 text-[#101828] font-extrabold text-xs px-6 py-5 h-auto rounded-[12px] shadow-lg flex-shrink-0 gap-2 w-full md:w-auto active:scale-95 transition-all mt-1"
                  >
                    <Zap className="w-4 h-4 text-amber-500" fill="currentColor" />
                    Auto-Build from Latest Notes
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const draftIds = claims.filter(c => c.status === 'Draft').map(c => c.id);
                  if (selectedIds.length === draftIds.length) setSelectedIds([]);
                  else setSelectedIds(draftIds);
                }}
                className={cn("border rounded-md px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors",
                  selectedIds.length > 0 ? "bg-green-50 border-green-300 text-green-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                )}
              >
                <CheckSquare className="w-3.5 h-3.5" /> Select All Drafts
              </button>
            </div>

            <BatchSubmitBar 
              selectedIds={selectedIds} 
              setSelectedIds={setSelectedIds} 
              claims={claims} 
              setClaims={setClaims} 
              logAudit={log}
            />

            <div className="space-y-3">
              <AnimatePresence>
                {claims.map((claim) => (
                  <motion.div key={claim.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} layout>
                    <ClaimCard 
                      claim={claim} 
                      setClaims={setClaims} 
                      logAudit={log} 
                      selected={selectedIds.includes(claim.id)}
                      isSelectMode={selectedIds.length > 0 || claims.filter(c => c.status === 'Draft').length > 0}
                      onToggleSelect={() => toggleSelect(claim.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── Tab 3: Superbill Tab ────────────────────────────────────────── */}
        {activeTab === "superbill" && <SuperbillTab />}

        {/* ── Tab 4: AR Aging Tab ─────────────────────────────────────────── */}
        {activeTab === "ar" && (
          <ArAgingTab 
            arRecords={arRecords} 
            setArRecords={setArRecords} 
            payers={INITIAL_PAYERS} 
            logAudit={log} 
          />
        )}

        {/* ── Tab 5: Prior Auth Hub ───────────────────────────────────────── */}
        {activeTab === "prior-auth" && (
          <PriorAuthHub 
            priorAuths={priorAuths} 
            setPriorAuths={setPriorAuths} 
            logAudit={log} 
          />
        )}

        {/* ── Tab 6: Audit Trail ──────────────────────────────────────────── */}
        {activeTab === "audit" && (
          <AuditTrailLog auditEntries={auditEntries} />
        )}

        {/* ── Tab 7: Revenue Analytics ────────────────────────────────────── */}
        {activeTab === "revenue" && (
          <RevenueAnalyticsDashboard />
        )}

            </motion.div>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}
