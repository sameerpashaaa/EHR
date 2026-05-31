// ─── Document types ──────────────────────────────────────────────

export type DocumentStatus = 'draft' | 'completed' | 'verified' | 'archived';
export type DocumentType   = 'Note' | 'Report' | 'Transcript' | 'Summary';
export type DocumentSource = 'manual' | 'ai-scribe' | 'voice' | 'ocr-import';

export interface DocumentVersion {
  versionId:   string;
  versionNum:  number;
  editedBy:    string;
  editedAt:    string;        // ISO timestamp
  summary:     string;        // 1-line change description
  content:     string;        // full note text (mock)
}

export interface CoSignature {
  requiredBy:  string;        // provider name
  requestedAt: string;
  signedAt?:   string;
  status:      'pending' | 'signed' | 'rejected';
}

export interface ClinicalDocument {
  id:          string;
  title:       string;
  patient:     string;
  patientId:   string;
  type:        DocumentType;
  source:      DocumentSource;
  status:      DocumentStatus;
  createdAt:   string;
  updatedAt:   string;
  encounterId?: string;
  claimId?:    string;
  coSignature?: CoSignature;
  versions:    DocumentVersion[];
  expiresAt?:  string;        // for consent / PA docs
  qualityScore?: number;      // 0–100, AI scorer output
  tags:        string[];
}

// ─── Claim types ─────────────────────────────────────────────────

export type ClaimStatus = 'Draft' | 'Submitted' | 'Accepted' | 'Denied' | 'Paid' | 'Partial';

export interface IcdCode {
  code:        string;
  description: string;
  primary:     boolean;
}

export interface CptCode {
  code:        string;
  description: string;
  modifier?:   string;
  units:       number;
  charge:      number;
  confidence?: number;        // 0–100, AI confidence score
}

export interface EligibilityData {
  verified:        boolean;
  verifiedAt?:     string;
  copay?:          number;
  deductibleMet?:  number;
  deductibleTotal?: number;
  oopRemaining?:   number;
  coverageStatus?: 'active' | 'inactive' | 'pending';
  payer?:          string;
  planName?:       string;
  groupNumber?:    string;
  memberId?:       string;
}

export interface PriorAuth {
  required:    boolean;
  status?:     'pending' | 'approved' | 'denied' | 'expired';
  authNumber?: string;
  expiresAt?:  string;
  cptCode?:    string;
  submittedAt?: string;
}

export interface DenialScore {
  score:       number;        // 0–100 (higher = more likely to deny)
  reasons:     string[];
  suggestions: string[];
}

export interface Claim {
  id:          string;
  patient:     string;
  patientId:   string;
  dos:         string;
  provider:    string;
  payer:       string;
  status:      ClaimStatus;
  totalCharge: number;
  paidAmount?: number;
  icdCodes:    IcdCode[];
  cptCodes:    CptCode[];
  encounterId?: string;
  documentId?: string;
  eligibility?: EligibilityData;
  priorAuth?:  PriorAuth;
  denialScore?: DenialScore;
  denialReason?: string;
  denialCode?:   string;
  submittedAt?:  string;
  paidAt?:       string;
  eraStatus?:    '277-acknowledged' | '835-received' | 'pending';
  notes:         string[];
}

// ─── AR types ────────────────────────────────────────────────────

export type AgingBucket = '0-30' | '31-60' | '61-90' | '90+';

export interface ArRecord {
  id:          string;
  patient:     string;
  patientId:   string;
  payer:       string;
  claimId:     string;
  dos:         string;
  billed:      number;
  paid:        number;
  balance:     number;
  bucket:      AgingBucket;
  daysPending: number;
  followUpHistory: FollowUpEntry[];
  writeOff?:   WriteOffRecord;
}

export interface FollowUpEntry {
  id:         string;
  date:       string;
  type:       'call' | 'letter' | 'portal' | 'fax';
  outcome:    string;
  user:       string;
}

export interface WriteOffRecord {
  amount:     number;
  reason:     'bad-debt' | 'small-balance' | 'contractual' | 'charity';
  approvedBy: string;
  approvedAt: string;
  note:       string;
}

// ─── Prior Authorization ──────────────────────────────────────────

export interface PriorAuthRequest {
  id:          string;
  patient:     string;
  patientId:   string;
  payer:       string;
  cptCode:     string;
  icdCode:     string;
  submittedAt: string;
  expiresAt?:  string;
  status:      'pending' | 'approved' | 'denied' | 'expired';
  authNumber?: string;
  daysRemaining?: number;
  claimId?:    string;
}

// ─── Audit Trail ─────────────────────────────────────────────────

export type AuditAction =
  | 'create' | 'edit' | 'view' | 'download' | 'submit'
  | 'delete' | 'sign' | 'appeal' | 'export' | 'login';

export interface AuditEntry {
  id:         string;
  timestamp:  string;
  user:       string;
  role:       string;
  action:     AuditAction;
  entity:     'document' | 'claim' | 'superbill' | 'ar-record' | 'prior-auth';
  entityId:   string;
  entityLabel:string;
  ipAddress:  string;
  details?:   string;
}

// ─── Revenue Analytics ───────────────────────────────────────────

export interface RevenueKpi {
  netCollectionRate:   number;   // %
  arDays:              number;
  firstPassRate:       number;   // %
  denialRate:          number;   // %
  billedMtd:           number;
  collectedMtd:        number;
  pendingAr:           number;
  monthTrend:          MonthlyTrend[];
}

export interface MonthlyTrend {
  month:      string;            // e.g. 'Jan', 'Feb'
  billed:     number;
  collected:  number;
  denials:    number;
}

// ─── Superbill ───────────────────────────────────────────────────

export interface SuprebillPayment {
  id:        string;
  amount:    number;
  paidAt:    string;
  method:    'card' | 'check' | 'cash' | 'insurance';
  reference: string;
}

// ─── Payer Intelligence ──────────────────────────────────────────

export interface PayerProfile {
  id:              string;
  name:            string;
  avgDaysToPay:    number;
  benchmarkDays:   number;       // national average
  denialRate:      number;       // %
  underpaymentRate: number;      // %
  filingDeadlineDays: number;
  portalUrl:       string;
  appealFax:       string;
  appealPhone:     string;
  notes:           string;
  performanceScore: number;      // 0–100
}