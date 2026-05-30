export interface VitalSign {
  date: string;
  bp: string;
  hr: number;
  rr: number;
  temp: string;
  spo2: string;
  weight: string;
  bmi: string;
}

export interface LabResult {
  date: string;
  name: string;
  result: string;
  status: "normal" | "abnormal" | "high" | "critical";
  orderedBy: string;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  route: string;
  status: "active" | "completed";
  prescribedBy: string;
  indication: string;
  refills: number;
}

export interface Problem {
  code: string;
  name: string;
  onset: string;
  status: "active" | "resolved";
  severity?: "mild" | "moderate" | "severe" | "";
}

export interface Allergy {
  allergen: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe";
  type: "Drug" | "Food" | "Environmental";
  emoji?: string;
}

export interface Encounter {
  date: string;
  type: string;
  provider: string;
  reason: string;
  status: "in-progress" | "completed";
  note: string;
}

export interface MedicalReport {
  id: string;
  name: string;
  size: string;
  date: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  date: string;
  type: string;
  doctor: string;
  status: "upcoming" | "completed" | "cancelled";
}

export interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  bg: string;
  photoUrl?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  initials: string;
  color: string;
  bg: string;
  isService?: boolean; // for 911 services
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string; // ISO or YYYY-MM-DD
  gender: "Male" | "Female" | "Other";

  // Contact & Location
  phone: string;
  email: string;
  address: string;
  location: string;

  // Identifiers
  abhaId?: string;

  // Clinical Baseline
  bloodType: string;
  language: string;

  // Status & Triage
  lastVisit: string;
  urgentAlert?: string | null;
  status: "new" | "old";
  waitTime?: string;

  // List view fields
  primaryCondition?: string;
  carePlan?: string;
  lastVisitDate?: string;
  nextVisitDate?: string;

  // Appearance (for UI)
  photoUrl?: string;
  initials: string;
  color: string;
  bg: string;

  // Medical Data
  vitals?: VitalSign[];
  labs?: LabResult[];
  medications?: Medication[];
  problems?: Problem[];
  allergies?: Allergy[];
  encounters?: Encounter[];
  reports?: MedicalReport[];
  appointments?: Appointment[];

  // Care relationships
  careTeam?: CareTeamMember[];
  emergencyContacts?: EmergencyContact[];

  // Specific detail fields for profile
  specialty?: string;
  complaint?: string;
  floor?: string;
  releaseDate?: string;
  diagnosis?: string;
  requiresSurgery?: boolean;
  admissionDate?: string;
  lastEncounter?: string;
  abhaVerified?: boolean;
  mobileVerified?: boolean;
}
