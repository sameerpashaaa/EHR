import {
  Patient, VitalSign, LabResult, Medication, Problem, Allergy,
  Encounter, MedicalReport, Appointment, CareTeamMember, EmergencyContact
} from "@/types/patient";

// ─── Shared Clinical Data ──────────────────────────────────────────────────────
export const MOCK_VITALS: VitalSign[] = [
  { date: "Today 09:15",  bp: "128/82", hr: 74,  rr: 16, temp: "98.6°F", spo2: "98%", weight: "185 lbs", bmi: "26.8" },
  { date: "Jan 15, 2024", bp: "132/85", hr: 78,  rr: 18, temp: "98.4°F", spo2: "97%", weight: "187 lbs", bmi: "27.1" },
  { date: "Dec 10, 2023", bp: "125/80", hr: 72,  rr: 16, temp: "98.7°F", spo2: "99%", weight: "183 lbs", bmi: "26.5" },
  { date: "Nov 05, 2023", bp: "138/90", hr: 82,  rr: 17, temp: "99.1°F", spo2: "96%", weight: "189 lbs", bmi: "27.4" },
];

export const MOCK_LABS: LabResult[] = [
  { date: "Today",   name: "Complete Blood Count",    result: "WBC 7.2, RBC 4.8, Hgb 14.2",  status: "normal",   orderedBy: "Dr. Smith" },
  { date: "Today",   name: "HbA1c",                   result: "7.2%",                          status: "abnormal", orderedBy: "Dr. Smith" },
  { date: "Jan 15",  name: "Lipid Panel",              result: "LDL 142 mg/dL",                 status: "high",     orderedBy: "Dr. Smith" },
  { date: "Jan 15",  name: "Comprehensive Metabolic",  result: "BMP within normal limits",      status: "normal",   orderedBy: "Dr. Johnson" },
  { date: "Dec 10",  name: "TSH",                      result: "2.1 mIU/L",                     status: "normal",   orderedBy: "Dr. Smith" },
  { date: "Nov 05",  name: "Urinalysis",               result: "Trace protein, no blood",       status: "abnormal", orderedBy: "Dr. Smith" },
];

export const MOCK_MEDICATIONS: Medication[] = [
  { name: "Lisinopril",   dose: "10mg",  frequency: "Once daily",      route: "Oral", status: "active",    prescribedBy: "Dr. Smith",   indication: "Hypertension",    refills: 3 },
  { name: "Metformin",    dose: "500mg", frequency: "Twice daily",      route: "Oral", status: "active",    prescribedBy: "Dr. Smith",   indication: "Type 2 Diabetes", refills: 2 },
  { name: "Atorvastatin", dose: "40mg",  frequency: "Once at night",    route: "Oral", status: "active",    prescribedBy: "Dr. Smith",   indication: "Hyperlipidemia",  refills: 5 },
  { name: "Amoxicillin",  dose: "500mg", frequency: "Three times/day",  route: "Oral", status: "completed", prescribedBy: "Dr. Johnson", indication: "Sinusitis",       refills: 0 },
];

export const MOCK_PROBLEMS: Problem[] = [
  { code: "I10",     name: "Essential Hypertension",   onset: "2018", status: "active",   severity: "moderate" },
  { code: "E11.9",   name: "Type 2 Diabetes Mellitus", onset: "2020", status: "active",   severity: "moderate" },
  { code: "E78.5",   name: "Hyperlipidemia",            onset: "2019", status: "active",   severity: "mild" },
  { code: "Z87.891", name: "Ex-Smoker",                 onset: "2015", status: "resolved", severity: "" },
];

export const MOCK_ALLERGIES: Allergy[] = [
  { allergen: "Penicillin", reaction: "Hives, Anaphylaxis", severity: "severe",   type: "Drug",          emoji: "💊" },
  { allergen: "Sulfa drugs",reaction: "Rash",               severity: "moderate", type: "Drug",          emoji: "💊" },
  { allergen: "Peanuts",    reaction: "Anaphylaxis",         severity: "severe",   type: "Food",          emoji: "🥜" },
  { allergen: "Latex",      reaction: "Contact dermatitis",  severity: "mild",     type: "Environmental", emoji: "🌿" },
];

export const MOCK_ALLERGIES_JENNY: Allergy[] = [
  { allergen: "Peanuts",    reaction: "Anaphylaxis",         severity: "severe",   type: "Food",          emoji: "🥜" },
  { allergen: "Penicillin", reaction: "Hives, Anaphylaxis",  severity: "severe",   type: "Drug",          emoji: "💊" },
  { allergen: "Gluten",     reaction: "GI distress",         severity: "moderate", type: "Food",          emoji: "🌾" },
  { allergen: "Pollen",     reaction: "Hay fever",           severity: "mild",     type: "Environmental", emoji: "🌺" },
  { allergen: "Fish",       reaction: "Anaphylaxis",         severity: "severe",   type: "Food",          emoji: "🐟" },
];

export const MOCK_ENCOUNTERS: Encounter[] = [
  { date: "Today",  type: "Office Visit", provider: "Dr. Smith",   reason: "Annual Physical",     status: "in-progress", note: "SOAP note in progress" },
  { date: "Jan 15", type: "Follow-up",    provider: "Dr. Smith",   reason: "Diabetes management", status: "completed",   note: "HbA1c reviewed, dose unchanged" },
  { date: "Dec 10", type: "Telehealth",   provider: "Dr. Johnson", reason: "Sinusitis",           status: "completed",   note: "Rx Amoxicillin 500mg x 10 days" },
  { date: "Nov 05", type: "Urgent Care",  provider: "Dr. Smith",   reason: "Chest pain workup",   status: "completed",   note: "EKG normal, costochondritis" },
  { date: "Sep 20", type: "Lab Review",   provider: "Dr. Smith",   reason: "Lipid panel review",  status: "completed",   note: "Started Atorvastatin" },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: "apt-1", date: "12 Oct 2023", type: "Post-Surgical Care",       doctor: "Dr. Marvin McKinney", status: "completed" },
  { id: "apt-2", date: "28 Oct 2023", type: "Follow-up Consultation",   doctor: "Dr. Sarah Patel",     status: "completed" },
  { id: "apt-3", date: "05 Nov 2023", type: "Lab Results Review",       doctor: "Dr. Marvin McKinney", status: "completed" },
  { id: "apt-4", date: "20 Jan 2024", type: "Cardiology Check-up",      doctor: "Dr. Ravi Sharma",     status: "upcoming"  },
];

export const MOCK_MEDICAL_REPORTS: MedicalReport[] = [
  { id: "rep-1", name: "Blood Work Report.pdf",  size: "1.5 MB", date: "12 Oct 2023", active: true  },
  { id: "rep-2", name: "ECG Analysis.pdf",        size: "2.3 MB", date: "28 Oct 2023", active: true  },
  { id: "rep-3", name: "Radiology Scan.pdf",      size: "8.7 MB", date: "05 Nov 2023", active: true  },
  { id: "rep-4", name: "Surgical Notes.pdf",      size: "512 KB", date: "20 Jan 2024", active: false },
];

// ─── Care Team Members (shared) ────────────────────────────────────────────────
export const MOCK_CARE_TEAM: CareTeamMember[] = [
  { id: "ct-1", name: "Patricia Smith",    role: "Home Health Aide",       initials: "PS", color: "#7C3AED", bg: "#EDE9FE" },
  { id: "ct-2", name: "Wade Warren",       role: "Nurse Supervisor",       initials: "WW", color: "#D97706", bg: "#FEF3C7" },
  { id: "ct-3", name: "Brooklyn Simmons",  role: "Personal Support Worker",initials: "BS", color: "#0891B2", bg: "#CFFAFE" },
  { id: "ct-4", name: "Leslie Alexander",  role: "Nursing Assistant",      initials: "LA", color: "#059669", bg: "#D1FAE5" },
];

// ─── Emergency Contacts (for Jenny Wilson) ─────────────────────────────────────
export const MOCK_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: "ec-1", name: "Cameron Wilson",       relationship: "Daughter",    phone: "+1 123 456 7890", initials: "CW", color: "#7C3AED", bg: "#EDE9FE" },
  { id: "ec-2", name: "Robert Wilson",        relationship: "Husband",     phone: "+1 123 456 7890", initials: "RW", color: "#0891B2", bg: "#CFFAFE" },
  { id: "ec-3", name: "California Healthcare",relationship: "Healthcare",  phone: "+1 123 456 7890", initials: "CH", color: "#059669", bg: "#D1FAE5", isService: true },
  { id: "ec-4", name: "Ambulance",            relationship: "Emergency",   phone: "911",             initials: "🚑", color: "#EF4444", bg: "#FEE2E2", isService: true },
  { id: "ec-5", name: "Fire",                 relationship: "Emergency",   phone: "911",             initials: "🚒", color: "#F59E0B", bg: "#FEF3C7", isService: true },
  { id: "ec-6", name: "Police",               relationship: "Emergency",   phone: "911",             initials: "👮", color: "#6366F1", bg: "#EEF2FF", isService: true },
];

// ─── Full Patient List (10 patients) ──────────────────────────────────────────
export const MOCK_PATIENTS: Patient[] = [
  {
    id: "P-2024-001",
    firstName: "Jenny", lastName: "Wilson", fullName: "Jenny Wilson",
    dateOfBirth: "1946-08-16", gender: "Female",
    phone: "+1 123 456 7890", email: "jenny.wilson@mail.com",
    address: "3891 Ranchview Dr. Richardson, California",
    location: "Richardson, California",
    abhaId: "1234-5678-9012-34", abhaVerified: true, mobileVerified: true,
    bloodType: "O+", language: "English, Spanish",
    lastVisit: "Today, 10:30 AM", status: "new", waitTime: "5m",
    initials: "JW", color: "#12B76A", bg: "#D1FAE5",
    primaryCondition: "Diabetes Type II",
    carePlan: "Chronic Disease Management Plan",
    lastVisitDate: "28 Aug, 2024", nextVisitDate: "28 Aug, 2024",
    specialty: "Endocrinology", complaint: "Fatigue, Elevated Blood Sugar",
    floor: "Floor 2, Ward A", diagnosis: "Type 2 Diabetes Mellitus",
    admissionDate: "2024-01-10", lastEncounter: "Today, 10:30 AM",
    vitals: MOCK_VITALS, labs: MOCK_LABS, medications: MOCK_MEDICATIONS,
    problems: MOCK_PROBLEMS, allergies: MOCK_ALLERGIES_JENNY,
    encounters: MOCK_ENCOUNTERS, reports: MOCK_MEDICAL_REPORTS,
    appointments: MOCK_APPOINTMENTS,
    careTeam: MOCK_CARE_TEAM,
    emergencyContacts: MOCK_EMERGENCY_CONTACTS,
  },
  {
    id: "P-2024-002",
    firstName: "Jacob", lastName: "Jones", fullName: "Jacob Jones",
    dateOfBirth: "1957-03-22", gender: "Male",
    phone: "+1 234 567 8901", email: "jacob.jones@mail.com",
    address: "2464 Royal Ln. Mesa, New Jersey",
    location: "Mesa, New Jersey",
    bloodType: "A+", language: "English",
    lastVisit: "Yesterday", status: "old", waitTime: "12m",
    initials: "JJ", color: "#6366F1", bg: "#EEF2FF",
    primaryCondition: "Hypertension",
    carePlan: "Post-Surgical Recovery Plan",
    lastVisitDate: "28 Aug, 2024", nextVisitDate: "28 Aug, 2024",
    specialty: "Cardiology", complaint: "Chest discomfort",
    diagnosis: "Essential Hypertension",
    vitals: MOCK_VITALS, labs: MOCK_LABS,
    careTeam: MOCK_CARE_TEAM.slice(0, 3),
    emergencyContacts: MOCK_EMERGENCY_CONTACTS.slice(0, 3),
    allergies: MOCK_ALLERGIES,
  },
  {
    id: "P-2024-003",
    firstName: "Dianne", lastName: "Russell", fullName: "Dianne Russell",
    dateOfBirth: "1948-07-15", gender: "Male",
    phone: "+1 345 678 9012", email: "dianne.russell@mail.com",
    address: "1901 Thornridge Cir. Shiloh, Hawaii",
    location: "Shiloh, Hawaii",
    bloodType: "B+", language: "English, Hawaiian",
    lastVisit: "2 Days Ago", urgentAlert: "COPD Alert", status: "old", waitTime: "18m",
    initials: "DR", color: "#F59E0B", bg: "#FEF3C7",
    primaryCondition: "Chronic Obstructive Pulmonary Disease (COPD)",
    carePlan: "Dementia Care Plan",
    lastVisitDate: "28 Aug, 2024", nextVisitDate: "28 Aug, 2024",
    specialty: "Pulmonology", complaint: "Shortness of breath",
    diagnosis: "COPD Stage III",
    careTeam: MOCK_CARE_TEAM.slice(0, 4),
    allergies: MOCK_ALLERGIES,
  },
  {
    id: "P-2024-004",
    firstName: "Guy", lastName: "Hawkins", fullName: "Guy Hawkins",
    dateOfBirth: "1952-11-05", gender: "Male",
    phone: "+1 456 789 0123", email: "guy.hawkins@mail.com",
    address: "4517 Washington Ave. Manchester, Kentucky",
    location: "Manchester, Kentucky",
    bloodType: "AB-", language: "English",
    lastVisit: "Last Week", status: "new", waitTime: "2m",
    initials: "GH", color: "#EF4444", bg: "#FEE2E2",
    primaryCondition: "Congestive Heart Failure (CHF)",
    carePlan: "CHF Care Plan",
    lastVisitDate: "28 Aug, 2024", nextVisitDate: "28 Aug, 2024",
    specialty: "Cardiology", complaint: "Swelling and fatigue",
    diagnosis: "CHF Class III",
    careTeam: MOCK_CARE_TEAM,
    allergies: MOCK_ALLERGIES,
  },
  {
    id: "P-2024-005",
    firstName: "Courtney", lastName: "Henry", fullName: "Courtney Henry",
    dateOfBirth: "1957-06-12", gender: "Female",
    phone: "+1 567 890 1234", email: "courtney.henry@mail.com",
    address: "3517 W. Gray St. Utica, Pennsylvania",
    location: "Utica, Pennsylvania",
    bloodType: "O-", language: "English, French",
    lastVisit: "3 Days Ago", status: "old", waitTime: "8m",
    initials: "CH", color: "#0891B2", bg: "#CFFAFE",
    primaryCondition: "Coronary Artery Disease (CAD)",
    carePlan: "CAD Care Plan",
    lastVisitDate: "28 Aug, 2024", nextVisitDate: "28 Aug, 2024",
    specialty: "Cardiology", complaint: "Chest pain on exertion",
    diagnosis: "Stable Angina / CAD",
    careTeam: [...MOCK_CARE_TEAM, { id: "ct-5", name: "Dr. Michael Ross", role: "Cardiologist", initials: "MR", color: "#BE185D", bg: "#FCE7F3" }],
    allergies: MOCK_ALLERGIES,
  },
  {
    id: "P-2024-006",
    firstName: "Eleanor", lastName: "Pena", fullName: "Eleanor Pena",
    dateOfBirth: "1962-02-28", gender: "Male",
    phone: "+1 678 901 2345", email: "eleanor.pena@mail.com",
    address: "6391 Elgin St. Celina, Delaware",
    location: "Celina, Delaware",
    bloodType: "A-", language: "English, Spanish",
    lastVisit: "Today", status: "new", waitTime: "25m",
    initials: "EP", color: "#7C3AED", bg: "#EDE9FE",
    primaryCondition: "Asthma",
    carePlan: "Asthma Care Plan",
    lastVisitDate: "28 Aug, 2024", nextVisitDate: "28 Aug, 2024",
    specialty: "Pulmonology", complaint: "Wheezing and coughing",
    diagnosis: "Moderate Persistent Asthma",
    careTeam: MOCK_CARE_TEAM.slice(0, 2),
    allergies: MOCK_ALLERGIES,
  },
  {
    id: "P-2024-007",
    firstName: "Arlene", lastName: "McCoy", fullName: "Arlene McCoy",
    dateOfBirth: "1964-09-14", gender: "Female",
    phone: "+1 789 012 3456", email: "arlene.mccoy@mail.com",
    address: "2118 Thornridge Cir. Syracuse, Connecticut",
    location: "Syracuse, Connecticut",
    bloodType: "B-", language: "English",
    lastVisit: "4 Days Ago", status: "old", waitTime: "15m",
    initials: "AM", color: "#059669", bg: "#D1FAE5",
    primaryCondition: "Parkinson's Disease",
    carePlan: "Chronic Disease Management Plan",
    lastVisitDate: "28 Aug, 2024", nextVisitDate: "28 Aug, 2024",
    specialty: "Neurology", complaint: "Tremors, balance issues",
    diagnosis: "Parkinson's Disease Stage II",
    careTeam: MOCK_CARE_TEAM.slice(1, 4),
    allergies: MOCK_ALLERGIES,
  },
  {
    id: "P-2024-008",
    firstName: "John", lastName: "Murphy", fullName: "John Murphy",
    dateOfBirth: "1975-12-03", gender: "Male",
    phone: "+1 890 123 4567", email: "john.murphy@mail.com",
    address: "8502 Preston Rd. Inglewood, Maine",
    location: "Inglewood, Maine",
    bloodType: "O+", language: "English",
    lastVisit: "Yesterday", status: "old", waitTime: "10m",
    initials: "JM", color: "#D97706", bg: "#FEF3C7",
    primaryCondition: "Anxiety Disorders",
    carePlan: "Chronic Disease Management Plan",
    lastVisitDate: "28 Aug, 2024", nextVisitDate: "28 Aug, 2024",
    specialty: "Psychiatry", complaint: "Persistent anxiety and insomnia",
    diagnosis: "Generalized Anxiety Disorder",
    careTeam: MOCK_CARE_TEAM.slice(0, 3),
    allergies: MOCK_ALLERGIES,
  },
  {
    id: "P-2024-009",
    firstName: "Jerome", lastName: "Bell", fullName: "Jerome Bell",
    dateOfBirth: "1944-04-18", gender: "Male",
    phone: "+1 901 234 5678", email: "jerome.bell@mail.com",
    address: "8502 Preston Rd. Inglewood, Maine 98380",
    location: "Inglewood, Maine",
    bloodType: "A+", language: "English",
    lastVisit: "5 Days Ago", status: "old", waitTime: "30m",
    initials: "JB", color: "#BE185D", bg: "#FCE7F3",
    primaryCondition: "Osteoporosis",
    carePlan: "8502 Preston Rd. Inglewood, Maine 98380",
    lastVisitDate: "28 Aug, 2024", nextVisitDate: "28 Aug, 2024",
    specialty: "Orthopedics", complaint: "Back pain and frequent fractures",
    diagnosis: "Severe Osteoporosis",
    careTeam: MOCK_CARE_TEAM.slice(2, 4),
    allergies: MOCK_ALLERGIES,
  },
  {
    id: "P-2024-010",
    firstName: "Marvin", lastName: "McKinney", fullName: "Marvin McKinney",
    dateOfBirth: "1953-01-27", gender: "Female",
    phone: "+1 012 345 6789", email: "marvin.mckinney@mail.com",
    address: "2972 Westheimer Rd. Santa Ana, Illinois",
    location: "Santa Ana, Illinois",
    bloodType: "AB+", language: "English, Italian",
    lastVisit: "Last Week", status: "new", waitTime: "7m",
    initials: "MM", color: "#6366F1", bg: "#EEF2FF",
    primaryCondition: "Wound Care",
    carePlan: "Wound Care Plan",
    lastVisitDate: "28 Aug, 2024", nextVisitDate: "28 Aug, 2024",
    specialty: "Dermatology", complaint: "Non-healing surgical wound",
    diagnosis: "Chronic Wound / Post-Surgical",
    careTeam: MOCK_CARE_TEAM,
    allergies: MOCK_ALLERGIES,
  },
];

export const MOCK_SELECTED_PATIENT = MOCK_PATIENTS[0];

export const MOCK_PATIENTS_QUEUE = MOCK_PATIENTS.map(p => ({
  id: p.id,
  name: p.fullName,
  specialty: p.specialty,
  initials: p.initials,
  color: p.color,
  bg: p.bg,
  status: p.status,
  waitTime: p.waitTime,
  alert: p.urgentAlert ? true : false,
  badge: p.urgentAlert,
  badgeColor: p.color
}));

// ─── Blood Pressure Chart Data ─────────────────────────────────────────────────
export const MOCK_BP_DATA = [
  { month: "Jan", systolic: 118, diastolic: 75 },
  { month: "Feb", systolic: 125, diastolic: 78 },
  { month: "Mar", systolic: 122, diastolic: 72 },
  { month: "Apr", systolic: 130, diastolic: 82 },
  { month: "May", systolic: 128, diastolic: 80 },
  { month: "Jun", systolic: 135, diastolic: 85 },
  { month: "Jul", systolic: 140, diastolic: 88 },
  { month: "Aug", systolic: 132, diastolic: 80 },
  { month: "Sep", systolic: 138, diastolic: 84 },
  { month: "Oct", systolic: 132, diastolic: 45  },
];

// ─── Pulse Rate Sparkline Data ─────────────────────────────────────────────────
export const MOCK_PULSE_DATA = [
  { value: 58 }, { value: 62 }, { value: 55 }, { value: 65 }, { value: 60 },
  { value: 68 }, { value: 60 }, { value: 57 }, { value: 63 }, { value: 60 },
];
