"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Facility State Interfaces
export interface HospitalProfile {
  name: string;
  logoUrl?: string;
  registrationNumber?: string;
  nabhAccreditation: "Yes" | "No" | "In Progress";
  type: string;
  address: string;
  emergencyContact: string;
  workingHoursFrom: string;
  workingHoursTo: string;
}

export interface Campus {
  id: string;
  name: string;
  location: string;
  type: "Main" | "Satellite" | "Annex";
}

export interface Building {
  id: string;
  campusId: string;
  name: string;
  floors: number; // e.g. 4 means Ground, 1, 2, 3
  wing?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Ward {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string; // Room number/name
  type: string;
  floor: string; // e.g. "Ground", "Floor 1"
  wardId: string;
  departmentId: string;
  capacity: number;
  occupancy: number;
  cleaningStatus: "Clean" | "Dirty" | "In Progress";
  assignedNurse?: string;
  notes?: string;
}

export interface Bed {
  id: string; // e.g. "B-101"
  roomId: string;
  name: string; // Bed ID (e.g. ICU-01-B)
  status: "available" | "reserved" | "cleaning" | "occupied" | "maintenance" | "isolation";
  patientName?: string;
  wardId: string;
  cleaningStatus: "Clean" | "Dirty" | "In Progress";
  equipmentAttached: string[]; // e.g. ["Ventilator", "Monitor"]
  nurseId?: string;
  doctorId?: string;
  notes?: string;
  lastUpdated: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  departmentId: string;
  location: string; // e.g. "Floor 1, Room 102"
  status: "Active" | "Under Repair" | "Retired" | "In Calibration";
  warrantyExpiry: string;
  amcProvider: string;
  amcExpiry: string;
  lastMaintenance: string;
  nextDue: string;
  purchaseDate: string;
  vendor: string;
  lastCalibration: string;
  maintenanceInterval: "Weekly" | "Monthly" | "Quarterly" | "Annually";
}

export interface StaffAllocation {
  id: string;
  name: string;
  role: "Doctor" | "Nurse" | "Technician" | "Housekeeping" | "Receptionist" | "Security" | "Maintenance" | "Pharmacist";
  departmentId: string;
  floor: string;
  wardId: string;
  shift: "Morning" | "Afternoon" | "Night";
  status: "On Duty" | "Off Duty" | "On Leave";
}

export interface OT {
  id: string;
  name: string; // OT-1, etc.
  sterilizationStatus: "Sterile" | "Pending" | "In Use";
  currentSurgery?: {
    procedureName: string;
    patientName: string;
  } | null;
  nextSurgery?: {
    time: string;
    procedure: string;
  } | null;
  assignedSurgeon?: string;
  assignedAnesthetist?: string;
  cleaningStatus: "Clean" | "Dirty" | "In Progress";
  isAvailable: boolean;
  schedule: {
    time: string;
    procedure: string;
    patient: string;
    surgeon: string;
  }[];
}

export interface MaintenanceTicket {
  id: string;
  category: "Electrical" | "Plumbing" | "HVAC" | "Biomedical" | "Furniture" | "Civil";
  description: string;
  location: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  assignedTeam: string;
  raisedBy: string;
  dateRaised: string;
  status: "Open" | "In Progress" | "Awaiting Parts" | "Resolved";
  comments: {
    id: string;
    text: string;
    author: string;
    timestamp: string;
  }[];
}

export interface HousekeepingTask {
  id: string;
  location: string; // e.g. "Floor 1 / Room 102 / Bed B"
  taskType: "Room Cleaning" | "Bed Cleaning" | "Disinfection" | "Waste Disposal" | "Laundry Collection" | "Inspection";
  assignedStaffId: string;
  status: "Pending" | "In Progress" | "Completed" | "Skipped";
  priority: "Low" | "Normal" | "High" | "Urgent";
  scheduledTime: string;
  completedAt?: string;
}

export interface Visitor {
  id: string;
  name: string;
  relation: string;
  patientName: string;
  wardRoom: string;
  entryTime: string;
  exitTime?: string;
  passId: string;
  status: "Active" | "Checked Out";
  purpose?: string;
}

export interface Ambulance {
  id: string;
  vehicleNo: string;
  type: "Basic Life Support" | "Advanced Life Support" | "Neonatal" | "Patient Transport";
  driver: string;
  equipment: string[];
  status: "Available" | "On Call" | "Maintenance" | "Out of Service";
  lastService: string;
  fuelLevel: number; // percentage
  gpsStatus: "Online" | "Offline";
}

export interface AmbulanceCallLog {
  id: string;
  dateTime: string;
  pickup: string;
  drop: string;
  driver: string;
  vehicleNo: string;
  duration: string;
  status: "Completed" | "En Route" | "Cancelled";
}

export interface VisitingHoursConfig {
  wardId: string;
  wardName: string;
  fromTime: string;
  toTime: string;
}

export interface FacilityState {
  hospitalProfile: HospitalProfile;
  campuses: Campus[];
  buildings: Building[];
  departments: Department[];
  wards: Ward[];
  rooms: Room[];
  beds: Bed[];
  equipment: Equipment[];
  staff: StaffAllocation[];
  icuConfig: Record<string, any>;
  otList: OT[];
  maintenanceTickets: MaintenanceTicket[];
  housekeepingTasks: HousekeepingTask[];
  visitors: Visitor[];
  ambulances: Ambulance[];
  ambulanceCallLogs: AmbulanceCallLog[];
  visitingHours: VisitingHoursConfig[];
  setupComplete: boolean;
}

const DEFAULT_PROFILE: HospitalProfile = {
  name: "Metapharsic General Hospital",
  nabhAccreditation: "Yes",
  type: "General",
  address: "102 Healthcare Avenue, Medical District",
  emergencyContact: "+1 (555) 999-1122",
  workingHoursFrom: "08:00",
  workingHoursTo: "20:00",
};

// Rich mock data generators
const INITIAL_CAMPUSES: Campus[] = [
  { id: "c1", name: "Main Campus", location: "102 Healthcare Avenue", type: "Main" },
  { id: "c2", name: "North Annex", location: "505 Boulevard North", type: "Annex" },
];

const INITIAL_BUILDINGS: Building[] = [
  { id: "b1", campusId: "c1", name: "Block A", floors: 4, wing: "West Wing" },
  { id: "b2", campusId: "c1", name: "Block B", floors: 3, wing: "East Wing" },
];

const INITIAL_DEPARTMENTS: Department[] = [
  { id: "d1", name: "Emergency" },
  { id: "d2", name: "Cardiology" },
  { id: "d3", name: "ICU" },
  { id: "d4", name: "Neurology" },
  { id: "d5", name: "Pharmacy" },
  { id: "d6", name: "Laboratory" },
  { id: "d7", name: "OT" },
  { id: "d8", name: "Orthopedics" },
  { id: "d9", name: "Pediatrics" },
];

const INITIAL_WARDS: Ward[] = [
  { id: "w1", name: "General Ward" },
  { id: "w2", name: "ICU Ward" },
  { id: "w3", name: "Private Ward" },
  { id: "w4", name: "Maternity Ward" },
  { id: "w5", name: "Isolation Ward" },
];

// Let's generate 20 rooms across building floors and wards
const INITIAL_ROOMS: Room[] = [
  // Block A - Ground Floor
  { id: "r1", name: "101", type: "Emergency Room", floor: "Ground", wardId: "w1", departmentId: "d1", capacity: 5, occupancy: 3, cleaningStatus: "Clean", assignedNurse: "Nurse Sarah Connor", notes: "Emergency admissions room" },
  { id: "r2", name: "102", type: "Consultation Room", floor: "Ground", wardId: "w1", departmentId: "d1", capacity: 1, occupancy: 0, cleaningStatus: "Clean", assignedNurse: "Nurse Sarah Connor" },
  // Block A - Floor 1
  { id: "r3", name: "201", type: "General", floor: "Floor 1", wardId: "w1", departmentId: "d8", capacity: 6, occupancy: 4, cleaningStatus: "Clean", assignedNurse: "Nurse John Doe" },
  { id: "r4", name: "202", type: "General", floor: "Floor 1", wardId: "w1", departmentId: "d8", capacity: 6, occupancy: 3, cleaningStatus: "Dirty", assignedNurse: "Nurse John Doe" },
  { id: "r5", name: "203", type: "Semi Private", floor: "Floor 1", wardId: "w3", departmentId: "d8", capacity: 2, occupancy: 1, cleaningStatus: "Clean", assignedNurse: "Nurse John Doe" },
  // Block A - Floor 2
  { id: "r6", name: "301", type: "ICU", floor: "Floor 2", wardId: "w2", departmentId: "d3", capacity: 8, occupancy: 5, cleaningStatus: "Clean", assignedNurse: "Nurse Sarah Connor", notes: "Medical ICU" },
  { id: "r7", name: "302", type: "NICU", floor: "Floor 2", wardId: "w2", departmentId: "d3", capacity: 4, occupancy: 2, cleaningStatus: "Clean", assignedNurse: "Nurse Sarah Connor" },
  // Block A - Floor 3
  { id: "r8", name: "401", type: "OT", floor: "Floor 3", wardId: "w2", departmentId: "d7", capacity: 1, occupancy: 0, cleaningStatus: "Clean", assignedNurse: "Nurse Sarah Connor" },
  { id: "r9", name: "402", type: "OT", floor: "Floor 3", wardId: "w2", departmentId: "d7", capacity: 1, occupancy: 1, cleaningStatus: "In Progress", assignedNurse: "Nurse Sarah Connor" },
  // Block B - Ground Floor
  { id: "r10", name: "B-101", type: "Lab Room", floor: "Ground", wardId: "w1", departmentId: "d6", capacity: 2, occupancy: 0, cleaningStatus: "Clean", assignedNurse: "Nurse John Doe" },
  { id: "r11", name: "B-102", type: "Consultation Room", floor: "Ground", wardId: "w1", departmentId: "d4", capacity: 1, occupancy: 0, cleaningStatus: "Clean", assignedNurse: "Nurse John Doe" },
  // Block B - Floor 1
  { id: "r12", name: "B-201", type: "Private", floor: "Floor 1", wardId: "w3", departmentId: "d2", capacity: 1, occupancy: 1, cleaningStatus: "Clean", assignedNurse: "Nurse John Doe" },
  { id: "r13", name: "B-202", type: "Private", floor: "Floor 1", wardId: "w3", departmentId: "d2", capacity: 1, occupancy: 0, cleaningStatus: "Dirty", assignedNurse: "Nurse John Doe" },
  { id: "r14", name: "B-203", type: "Deluxe", floor: "Floor 1", wardId: "w3", departmentId: "d2", capacity: 1, occupancy: 1, cleaningStatus: "Clean", assignedNurse: "Nurse John Doe" },
  // Block B - Floor 2
  { id: "r15", name: "B-301", type: "Maternity Ward", floor: "Floor 2", wardId: "w4", departmentId: "d9", capacity: 4, occupancy: 2, cleaningStatus: "Clean", assignedNurse: "Nurse John Doe" },
  { id: "r16", name: "B-302", type: "Isolation", floor: "Floor 2", wardId: "w5", departmentId: "d4", capacity: 2, occupancy: 1, cleaningStatus: "Clean", assignedNurse: "Nurse John Doe" },
  // Additional filler rooms
  { id: "r17", name: "103", type: "Procedure Room", floor: "Ground", wardId: "w1", departmentId: "d1", capacity: 2, occupancy: 0, cleaningStatus: "Clean" },
  { id: "r18", name: "B-103", type: "Pharmacy Room", floor: "Ground", wardId: "w1", departmentId: "d5", capacity: 0, occupancy: 0, cleaningStatus: "Clean" },
  { id: "r19", name: "204", type: "Suite", floor: "Floor 1", wardId: "w3", departmentId: "d8", capacity: 1, occupancy: 0, cleaningStatus: "Clean" },
  { id: "r20", name: "B-204", type: "Suite", floor: "Floor 1", wardId: "w3", departmentId: "d2", capacity: 1, occupancy: 0, cleaningStatus: "Clean" },
];

// Let's generate 60 beds across floors, rooms, and wards.
// Let's seed with mixed statuses: 30 available, 18 occupied, 5 cleaning, 4 maintenance, 3 reserved
const INITIAL_BEDS: Bed[] = (() => {
  const beds: Bed[] = [];
  const roomOccupancyMap: Record<string, number> = {};

  // Status arrays to distribute
  // Total 60: 30 available, 18 occupied, 5 cleaning, 4 maintenance, 3 reserved
  const statuses: ("available" | "reserved" | "cleaning" | "occupied" | "maintenance" | "isolation")[] = [
    ...Array(30).fill("available"),
    ...Array(18).fill("occupied"),
    ...Array(5).fill("cleaning"),
    ...Array(4).fill("maintenance"),
    ...Array(3).fill("reserved"),
  ];

  // Shuffling statuses so they map naturally
  let sIndex = 0;

  const mockPatients = [
    "James Smith", "Maria Garcia", "Robert Johnson", "David Williams", "Linda Martinez",
    "Michael Brown", "Elizabeth Jones", "William Miller", "Barbara Davis", "Richard Wilson",
    "Joseph Taylor", "Susan Thomas", "Thomas Anderson", "Jessica White", "Charles Harris",
    "Karen Martin", "Christopher Thompson", "Nancy Robinson"
  ];
  let pIndex = 0;

  // Distribute over the rooms
  INITIAL_ROOMS.forEach((room) => {
    if (room.capacity === 0) return;
    for (let i = 1; i <= room.capacity; i++) {
      if (beds.length >= 60) break;
      const bedStatus = statuses[sIndex % statuses.length];
      sIndex++;

      const isOccupied = bedStatus === "occupied";
      const patName = isOccupied ? mockPatients[pIndex++ % mockPatients.length] : undefined;

      if (isOccupied) {
        roomOccupancyMap[room.id] = (roomOccupancyMap[room.id] || 0) + 1;
      }

      const bedName = `${room.type === "ICU" || room.type === "NICU" ? "ICU" : "BED"}-${room.name}-${String.fromCharCode(64 + i)}`;

      beds.push({
        id: `bed-${beds.length + 1}`,
        roomId: room.id,
        name: bedName,
        status: bedStatus,
        patientName: patName,
        wardId: room.wardId,
        cleaningStatus: bedStatus === "cleaning" ? "In Progress" : "Clean",
        equipmentAttached: room.type === "ICU" ? ["Patient Monitor", "Infusion Pump", "Oxygen"] : ["Oxygen"],
        nurseId: room.assignedNurse ? `staff-${room.assignedNurse === "Nurse Sarah Connor" ? 2 : 3}` : undefined,
        doctorId: "staff-1",
        notes: bedStatus === "maintenance" ? "Replacing headboard motor mechanism" : undefined,
        lastUpdated: new Date(Date.now() - Math.random() * 72000000).toISOString(),
      });
    }
  });

  INITIAL_ROOMS.forEach((room) => {
    room.occupancy = roomOccupancyMap[room.id] || 0;
  });

  return beds;
})();

const INITIAL_EQUIPMENT: Equipment[] = [
  { id: "EQ-1001", name: "Ventilator V-500", type: "Ventilator", departmentId: "d3", location: "ICU Room 301", status: "Active", warrantyExpiry: "2027-12-15", amcProvider: "BioMed Services Inc.", amcExpiry: "2026-12-15", lastMaintenance: "2026-05-10", nextDue: "2026-11-10", purchaseDate: "2024-12-15", vendor: "Drager", lastCalibration: "2026-05-10", maintenanceInterval: "Quarterly" },
  { id: "EQ-1002", name: "Ventilator V-500 Plus", type: "Ventilator", departmentId: "d3", location: "ICU Room 301", status: "Active", warrantyExpiry: "2027-12-15", amcProvider: "BioMed Services Inc.", amcExpiry: "2026-12-15", lastMaintenance: "2026-05-12", nextDue: "2026-11-12", purchaseDate: "2024-12-15", vendor: "Drager", lastCalibration: "2026-05-12", maintenanceInterval: "Quarterly" },
  { id: "EQ-1003", name: "Newborn Care Ventilator", type: "Ventilator", departmentId: "d3", location: "NICU Room 302", status: "In Calibration", warrantyExpiry: "2028-01-20", amcProvider: "GE Healthcare", amcExpiry: "2027-01-20", lastMaintenance: "2026-06-18", nextDue: "2026-06-25", purchaseDate: "2025-01-20", vendor: "GE Healthcare", lastCalibration: "2026-06-25", maintenanceInterval: "Quarterly" },
  { id: "EQ-1004", name: "Patient Monitor PM-100", type: "Patient Monitor", departmentId: "d3", location: "ICU Room 301", status: "Active", warrantyExpiry: "2027-03-10", amcProvider: "Philips Medical", amcExpiry: "2027-03-10", lastMaintenance: "2026-04-10", nextDue: "2026-10-10", purchaseDate: "2024-03-10", vendor: "Philips", lastCalibration: "2026-04-10", maintenanceInterval: "Quarterly" },
  { id: "EQ-1005", name: "Patient Monitor PM-100", type: "Patient Monitor", departmentId: "d3", location: "ICU Room 301", status: "Active", warrantyExpiry: "2027-03-10", amcProvider: "Philips Medical", amcExpiry: "2027-03-10", lastMaintenance: "2026-04-11", nextDue: "2026-10-11", purchaseDate: "2024-03-10", vendor: "Philips", lastCalibration: "2026-04-11", maintenanceInterval: "Quarterly" },
  { id: "EQ-1006", name: "Patient Monitor PM-100", type: "Patient Monitor", departmentId: "d3", location: "ICU Room 301", status: "Active", warrantyExpiry: "2027-03-10", amcProvider: "Philips Medical", amcExpiry: "2027-03-10", lastMaintenance: "2026-04-12", nextDue: "2026-10-12", purchaseDate: "2024-03-10", vendor: "Philips", lastCalibration: "2026-04-12", maintenanceInterval: "Quarterly" },
  { id: "EQ-1007", name: "Patient Monitor PM-100", type: "Patient Monitor", departmentId: "d3", location: "NICU Room 302", status: "Active", warrantyExpiry: "2027-03-10", amcProvider: "Philips Medical", amcExpiry: "2027-03-10", lastMaintenance: "2026-04-13", nextDue: "2026-10-13", purchaseDate: "2024-03-10", vendor: "Philips", lastCalibration: "2026-04-13", maintenanceInterval: "Quarterly" },
  { id: "EQ-1008", name: "Infusion Pump IP-80", type: "Infusion Pump", departmentId: "d3", location: "ICU Room 301", status: "Active", warrantyExpiry: "2026-09-05", amcProvider: "Medtronic Tech", amcExpiry: "2026-09-05", lastMaintenance: "2026-03-05", nextDue: "2026-09-05", purchaseDate: "2023-09-05", vendor: "Medtronic", lastCalibration: "2026-03-05", maintenanceInterval: "Monthly" },
  { id: "EQ-1009", name: "Infusion Pump IP-80", type: "Infusion Pump", departmentId: "d3", location: "ICU Room 301", status: "Active", warrantyExpiry: "2026-09-05", amcProvider: "Medtronic Tech", amcExpiry: "2026-09-05", lastMaintenance: "2026-03-05", nextDue: "2026-09-05", purchaseDate: "2023-09-05", vendor: "Medtronic", lastCalibration: "2026-03-05", maintenanceInterval: "Monthly" },
  { id: "EQ-1010", name: "MAC-5000 ECG Machine", type: "ECG", departmentId: "d2", location: "Floor 1 Consult Room", status: "Active", warrantyExpiry: "2028-02-15", amcProvider: "GE Healthcare", amcExpiry: "2027-02-15", lastMaintenance: "2026-05-15", nextDue: "2026-11-15", purchaseDate: "2025-02-15", vendor: "GE Healthcare", lastCalibration: "2026-05-15", maintenanceInterval: "Quarterly" },
  { id: "EQ-1011", name: "HeartStart Defibrillator", type: "Defibrillator", departmentId: "d1", location: "Emergency Room 101", status: "Active", warrantyExpiry: "2027-07-22", amcProvider: "Philips Medical", amcExpiry: "2026-07-22", lastMaintenance: "2026-06-01", nextDue: "2026-07-01", purchaseDate: "2024-07-22", vendor: "Philips", lastCalibration: "2026-06-01", maintenanceInterval: "Monthly" },
  { id: "EQ-1012", name: "Vivid i Ultrasound", type: "Ultrasound", departmentId: "d2", location: "Cardiology Room B-201", status: "Active", warrantyExpiry: "2026-10-08", amcProvider: "GE Healthcare", amcExpiry: "2026-10-08", lastMaintenance: "2026-04-08", nextDue: "2026-10-08", purchaseDate: "2023-10-08", vendor: "GE Healthcare", lastCalibration: "2026-04-08", maintenanceInterval: "Quarterly" },
  { id: "EQ-1013", name: "Compact Mobile X-Ray", type: "X-Ray", departmentId: "d6", location: "Lab Room B-101", status: "Active", warrantyExpiry: "2028-05-30", amcProvider: "Siemens Healthineers", amcExpiry: "2027-05-30", lastMaintenance: "2026-05-30", nextDue: "2026-11-30", purchaseDate: "2025-05-30", vendor: "Siemens", lastCalibration: "2026-05-30", maintenanceInterval: "Annually" },
  { id: "EQ-1014", name: "SOMATOM CT Scanner", type: "CT", departmentId: "d6", location: "Radiology Wing", status: "Active", warrantyExpiry: "2029-01-10", amcProvider: "Siemens Healthineers", amcExpiry: "2027-01-10", lastMaintenance: "2026-01-10", nextDue: "2027-01-10", purchaseDate: "2024-01-10", vendor: "Siemens", lastCalibration: "2026-01-10", maintenanceInterval: "Annually" },
  { id: "EQ-1015", name: "MAGNETOM MRI Scanner", type: "MRI", departmentId: "d6", location: "MRI Lab A", status: "Active", warrantyExpiry: "2029-02-28", amcProvider: "Siemens Healthineers", amcExpiry: "2027-02-28", lastMaintenance: "2026-02-28", nextDue: "2027-02-28", purchaseDate: "2024-02-28", vendor: "Siemens", lastCalibration: "2026-02-28", maintenanceInterval: "Annually" },
];

const INITIAL_STAFF: StaffAllocation[] = [
  { id: "staff-1", name: "Dr. Adrian Miller", role: "Doctor", departmentId: "d3", floor: "Floor 2", wardId: "w2", shift: "Morning", status: "On Duty" },
  { id: "staff-2", name: "Nurse Sarah Connor", role: "Nurse", departmentId: "d1", floor: "Ground", wardId: "w1", shift: "Morning", status: "On Duty" },
  { id: "staff-3", name: "Nurse John Doe", role: "Nurse", departmentId: "d8", floor: "Floor 1", wardId: "w1", shift: "Afternoon", status: "On Duty" },
  { id: "staff-4", name: "Housekeeper Alice Smith", role: "Housekeeping", departmentId: "d3", floor: "Floor 2", wardId: "w2", shift: "Morning", status: "On Duty" },
  { id: "staff-5", name: "Housekeeper Bob Martin", role: "Housekeeping", departmentId: "d1", floor: "Ground", wardId: "w1", shift: "Night", status: "On Duty" },
  { id: "staff-6", name: "Technician Dave Davis", role: "Technician", departmentId: "d6", floor: "Ground", wardId: "w1", shift: "Morning", status: "On Duty" },
  { id: "staff-7", name: "Pharmacist Jane Watson", role: "Pharmacist", departmentId: "d5", floor: "Ground", wardId: "w1", shift: "Afternoon", status: "On Duty" },
  { id: "staff-8", name: "Receptionist Lucy Liu", role: "Receptionist", departmentId: "d1", floor: "Ground", wardId: "w1", shift: "Morning", status: "On Duty" },
  { id: "staff-9", name: "Security Guard Rick Grimes", role: "Security", departmentId: "d1", floor: "Ground", wardId: "w1", shift: "Night", status: "On Duty" },
  { id: "staff-10", name: "Engineer Isaac Clarke", role: "Maintenance", departmentId: "d1", floor: "Floor 3", wardId: "w2", shift: "Morning", status: "On Duty" },
];

const INITIAL_OT: OT[] = [
  {
    id: "ot-1",
    name: "OT-1 (Major)",
    sterilizationStatus: "Sterile",
    currentSurgery: null,
    nextSurgery: { time: "18:00", procedure: "Angioplasty" },
    assignedSurgeon: "Dr. Adrian Miller",
    assignedAnesthetist: "Dr. Rachel Green",
    cleaningStatus: "Clean",
    isAvailable: true,
    schedule: [
      { time: "09:00 - 11:30", procedure: "Coronary Bypass", patient: "James Smith", surgeon: "Dr. Adrian Miller" },
      { time: "13:00 - 14:30", procedure: "Heart Valve Replacement", patient: "Maria Garcia", surgeon: "Dr. Adrian Miller" },
      { time: "18:00 - 19:30", procedure: "Angioplasty", patient: "Robert Johnson", surgeon: "Dr. Adrian Miller" },
    ],
  },
  {
    id: "ot-2",
    name: "OT-2 (Orthopedic)",
    sterilizationStatus: "In Use",
    currentSurgery: { procedureName: "Hip Replacement", patientName: "Linda Martinez" },
    nextSurgery: { time: "19:00", procedure: "Knee Arthroscopy" },
    assignedSurgeon: "Dr. Sarah Adams",
    assignedAnesthetist: "Dr. John Watson",
    cleaningStatus: "In Progress",
    isAvailable: true,
    schedule: [
      { time: "14:00 - 17:00", procedure: "Hip Replacement", patient: "Linda Martinez", surgeon: "Dr. Sarah Adams" },
      { time: "19:00 - 20:30", procedure: "Knee Arthroscopy", patient: "David Williams", surgeon: "Dr. Sarah Adams" },
    ],
  },
  {
    id: "ot-3",
    name: "OT-Minor",
    sterilizationStatus: "Pending",
    currentSurgery: null,
    nextSurgery: null,
    assignedSurgeon: undefined,
    assignedAnesthetist: undefined,
    cleaningStatus: "Dirty",
    isAvailable: false,
    schedule: [],
  },
];

const INITIAL_AMBULANCES: Ambulance[] = [
  { id: "amb-1", vehicleNo: "AMB-2026-X1", type: "Advanced Life Support", driver: "John Wheeler", equipment: ["Defibrillator", "Oxygen", "Stretcher", "IV Kit"], status: "Available", lastService: "2026-05-15", fuelLevel: 85, gpsStatus: "Online" },
  { id: "amb-2", vehicleNo: "AMB-2026-X2", type: "Basic Life Support", driver: "Mike Wheeler", equipment: ["Oxygen", "Stretcher", "Suction"], status: "On Call", lastService: "2026-06-01", fuelLevel: 45, gpsStatus: "Online" },
  { id: "amb-3", vehicleNo: "AMB-2026-X3", type: "Neonatal", driver: "Steve Harrington", equipment: ["Ventilator", "Oxygen", "Stretcher"], status: "Maintenance", lastService: "2026-06-20", fuelLevel: 10, gpsStatus: "Offline" },
];

const INITIAL_AMBULANCE_CALLS: AmbulanceCallLog[] = [
  { id: "call-1", dateTime: "2026-06-25T10:30:00Z", pickup: "5th Avenue Intersection", drop: "Metapharsic ER", driver: "Mike Wheeler", vehicleNo: "AMB-2026-X2", duration: "18 mins", status: "Completed" },
  { id: "call-2", dateTime: "2026-06-25T14:15:00Z", pickup: "North Annex Clinic", drop: "Metapharsic ICU", driver: "John Wheeler", vehicleNo: "AMB-2026-X1", duration: "25 mins", status: "Completed" },
  { id: "call-3", dateTime: "2026-06-25T16:00:00Z", pickup: "Oak Street Res.", drop: "Metapharsic ER", driver: "Mike Wheeler", vehicleNo: "AMB-2026-X2", duration: "En Route", status: "En Route" },
];

const INITIAL_MAINTENANCE: MaintenanceTicket[] = [
  {
    id: "TKT-301",
    category: "Electrical",
    description: "Bed lights flickering in General Ward Floor 1 Room 201.",
    location: "Block A, Floor 1, Room 201",
    priority: "Medium",
    assignedTeam: "Electrical Team B",
    raisedBy: "Nurse John Doe",
    dateRaised: "2026-06-24T12:00:00Z",
    status: "Open",
    comments: [
      { id: "c-1", text: "Reported during morning shift change.", author: "Nurse John Doe", timestamp: "2026-06-24T12:00:00Z" }
    ],
  },
  {
    id: "TKT-302",
    category: "Plumbing",
    description: "OT-2 wash station sink drain clogged.",
    location: "Block A, Floor 3, OT-2",
    priority: "Critical",
    assignedTeam: "Plumbing Team A",
    raisedBy: "Nurse Sarah Connor",
    dateRaised: "2026-06-25T08:30:00Z",
    status: "In Progress",
    comments: [
      { id: "c-2", text: "Plumber on site, trying to clear obstruction.", author: "Engineer Isaac Clarke", timestamp: "2026-06-25T09:00:00Z" }
    ],
  },
  {
    id: "TKT-303",
    category: "HVAC",
    description: "Maternity Ward AC running too cold, thermostat unresponsive.",
    location: "Block B, Floor 2, Room B-301",
    priority: "High",
    assignedTeam: "HVAC Techs",
    raisedBy: "Nurse John Doe",
    dateRaised: "2026-06-25T09:15:00Z",
    status: "In Progress",
    comments: [],
  },
  {
    id: "TKT-304",
    category: "Biomedical",
    description: "Defibrillator due for monthly recalibration.",
    location: "Block A, Ground, ER 101",
    priority: "Medium",
    assignedTeam: "Biomedical Team",
    raisedBy: "System Auditor",
    dateRaised: "2026-06-25T00:00:00Z",
    status: "Open",
    comments: [],
  },
  {
    id: "TKT-305",
    category: "Furniture",
    description: "Repaired bed lock wheel mechanism in ICU Room 301 Bed-D.",
    location: "Block A, Floor 2, Room 301",
    priority: "Low",
    assignedTeam: "Furniture Team",
    raisedBy: "Nurse Sarah Connor",
    dateRaised: "2026-06-23T10:00:00Z",
    status: "Resolved",
    comments: [
      { id: "c-3", text: "Wheel assembly replaced. Lock tested successfully.", author: "Engineer Isaac Clarke", timestamp: "2026-06-23T14:00:00Z" }
    ],
  },
];

const INITIAL_HOUSEKEEPING: HousekeepingTask[] = [
  { id: "HK-101", location: "Ground / Emergency Room 101 / Bed-A", taskType: "Disinfection", assignedStaffId: "staff-5", status: "Pending", priority: "Urgent", scheduledTime: "17:00" },
  { id: "HK-102", location: "Floor 2 / ICU Room 301 / Bed-B", taskType: "Bed Cleaning", assignedStaffId: "staff-4", status: "In Progress", priority: "High", scheduledTime: "16:15" },
  { id: "HK-103", location: "Floor 1 / Room 202 / Bed-A", taskType: "Room Cleaning", assignedStaffId: "staff-4", status: "Pending", priority: "Normal", scheduledTime: "18:00" },
  { id: "HK-104", location: "Floor 3 / OT-3", taskType: "Disinfection", assignedStaffId: "staff-5", status: "Pending", priority: "High", scheduledTime: "17:30" },
  { id: "HK-105", location: "Floor 2 / NICU Room 302", taskType: "Waste Disposal", assignedStaffId: "staff-4", status: "Completed", priority: "High", scheduledTime: "15:00", completedAt: "15:15" },
];

const INITIAL_VISITORS: Visitor[] = [
  { id: "vis-1", name: "Sarah Smith", relation: "Spouse", patientName: "James Smith", wardRoom: "ICU / Room 301", entryTime: "14:00", passId: "PASS-9081", status: "Active", purpose: "Patient Visit" },
  { id: "vis-2", name: "David Garcia", relation: "Sibling", patientName: "Maria Garcia", wardRoom: "ICU / Room 301", entryTime: "14:30", passId: "PASS-9082", status: "Active", purpose: "Patient Visit" },
  { id: "vis-3", name: "Karen Martinez", relation: "Child", patientName: "Linda Martinez", wardRoom: "Private / B-201", entryTime: "11:00", exitTime: "13:00", passId: "PASS-9083", status: "Checked Out", purpose: "Bring Lunch" },
  { id: "vis-4", name: "Emma Jones", relation: "Friend", patientName: "Elizabeth Jones", wardRoom: "Maternity / B-301", entryTime: "15:00", passId: "PASS-9084", status: "Active", purpose: "Patient Visit" },
  { id: "vis-5", name: "Michael Taylor", relation: "Spouse", patientName: "Susan Thomas", wardRoom: "General / Room 201", entryTime: "16:00", passId: "PASS-9085", status: "Active", purpose: "Patient Visit" },
  { id: "vis-6", name: "Brian Anderson", relation: "Parent", patientName: "Thomas Anderson", wardRoom: "General / Room 201", entryTime: "15:30", passId: "PASS-9086", status: "Active", purpose: "Patient Visit" },
  { id: "vis-7", name: "Gary Harris", relation: "Child", patientName: "Charles Harris", wardRoom: "Maternity / B-301", entryTime: "09:30", exitTime: "10:45", passId: "PASS-9087", status: "Checked Out", purpose: "Doctor Consultation" },
  { id: "vis-8", name: "Fiona White", relation: "Spouse", patientName: "Jessica White", wardRoom: "General / Room 202", entryTime: "16:15", passId: "PASS-9088", status: "Active", purpose: "Patient Visit" },
];

const INITIAL_VISITING_HOURS: VisitingHoursConfig[] = [
  { wardId: "w1", wardName: "General Ward", fromTime: "16:00", toTime: "19:00" },
  { wardId: "w2", wardName: "ICU Ward", fromTime: "17:00", toTime: "18:00" },
  { wardId: "w3", wardName: "Private Ward", fromTime: "11:00", toTime: "20:00" },
  { wardId: "w4", wardName: "Maternity Ward", fromTime: "15:00", toTime: "19:00" },
  { wardId: "w5", wardName: "Isolation Ward", fromTime: "12:00", toTime: "13:00" },
];

interface FacilityContextProps {
  state: FacilityState;
  updateHospitalProfile: (p: Partial<HospitalProfile>) => void;
  setCampuses: React.Dispatch<React.SetStateAction<Campus[]>>;
  addCampus: (c: Omit<Campus, "id">) => void;
  removeCampus: (id: string) => void;
  updateCampus: (c: Campus) => void;
  setBuildings: React.Dispatch<React.SetStateAction<Building[]>>;
  addBuilding: (b: Omit<Building, "id">) => void;
  removeBuilding: (id: string) => void;
  updateBuilding: (b: Building) => void;
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  addDepartment: (d: Omit<Department, "id">) => void;
  removeDepartment: (id: string) => void;
  updateDepartment: (d: Department) => void;
  setWards: React.Dispatch<React.SetStateAction<Ward[]>>;
  addWard: (w: Omit<Ward, "id">) => void;
  removeWard: (id: string) => void;
  updateWard: (w: Ward) => void;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  addRoom: (r: Omit<Room, "id" | "occupancy">) => void;
  removeRoom: (id: string) => void;
  updateRoom: (r: Room) => void;
  setBeds: React.Dispatch<React.SetStateAction<Bed[]>>;
  addBed: (b: Omit<Bed, "id" | "lastUpdated">) => void;
  removeBed: (id: string) => void;
  updateBed: (b: Bed) => void;
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  addEquipment: (e: Omit<Equipment, "id">) => void;
  removeEquipment: (id: string) => void;
  updateEquipment: (e: Equipment) => void;
  setStaff: React.Dispatch<React.SetStateAction<StaffAllocation[]>>;
  addStaff: (s: Omit<StaffAllocation, "id">) => void;
  removeStaff: (id: string) => void;
  updateStaff: (s: StaffAllocation) => void;
  setOtList: React.Dispatch<React.SetStateAction<OT[]>>;
  addOT: (o: Omit<OT, "id" | "sterilizationStatus" | "cleaningStatus" | "isAvailable" | "schedule">) => void;
  removeOT: (id: string) => void;
  updateOT: (o: OT) => void;
  setMaintenanceTickets: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
  addMaintenanceTicket: (t: Omit<MaintenanceTicket, "id" | "dateRaised" | "comments">) => void;
  removeMaintenanceTicket: (id: string) => void;
  updateMaintenanceTicket: (t: MaintenanceTicket) => void;
  setHousekeepingTasks: React.Dispatch<React.SetStateAction<HousekeepingTask[]>>;
  addHousekeepingTask: (t: Omit<HousekeepingTask, "id" | "status">) => void;
  removeHousekeepingTask: (id: string) => void;
  updateHousekeepingTask: (t: HousekeepingTask) => void;
  setVisitors: React.Dispatch<React.SetStateAction<Visitor[]>>;
  addVisitor: (v: Omit<Visitor, "id" | "status">) => void;
  removeVisitor: (id: string) => void;
  updateVisitor: (v: Visitor) => void;
  setAmbulances: React.Dispatch<React.SetStateAction<Ambulance[]>>;
  addAmbulance: (a: Omit<Ambulance, "id">) => void;
  removeAmbulance: (id: string) => void;
  updateAmbulance: (a: Ambulance) => void;
  addAmbulanceCallLog: (l: Omit<AmbulanceCallLog, "id">) => void;
  setVisitingHours: React.Dispatch<React.SetStateAction<VisitingHoursConfig[]>>;
  updateVisitingHours: (wardId: string, fromTime: string, toTime: string) => void;
  completeSetup: (profile: HospitalProfile, campuses: Campus[], buildings: Building[], departments: Department[], wards: Ward[], rooms: Room[]) => void;
  skipSetup: () => void;
  resetAll: () => void;
}

const FacilityContext = createContext<FacilityContextProps | undefined>(undefined);

export function FacilityProvider({ children }: { children: React.ReactNode }) {
  const [hospitalProfile, setHospitalProfileState] = useState<HospitalProfile>(DEFAULT_PROFILE);
  const [campuses, setCampuses] = useState<Campus[]>(INITIAL_CAMPUSES);
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [wards, setWards] = useState<Ward[]>(INITIAL_WARDS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [beds, setBeds] = useState<Bed[]>(INITIAL_BEDS);
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [staff, setStaff] = useState<StaffAllocation[]>(INITIAL_STAFF);
  const [otList, setOtList] = useState<OT[]>(INITIAL_OT);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>(INITIAL_HOUSEKEEPING);
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);
  const [ambulanceCallLogs, setAmbulanceCallLogs] = useState<AmbulanceCallLog[]>(INITIAL_AMBULANCE_CALLS);
  const [visitingHours, setVisitingHours] = useState<VisitingHoursConfig[]>(INITIAL_VISITING_HOURS);
  const [setupComplete, setSetupComplete] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    try {
      const isComplete = localStorage.getItem("facility_setup_complete") === "true";
      setSetupComplete(isComplete);

      const cachedProfile = localStorage.getItem("facility_hospitalProfile");
      const cachedCampuses = localStorage.getItem("facility_campuses");
      const cachedBuildings = localStorage.getItem("facility_buildings");
      const cachedDepartments = localStorage.getItem("facility_departments");
      const cachedWards = localStorage.getItem("facility_wards");
      const cachedRooms = localStorage.getItem("facility_rooms");
      const cachedBeds = localStorage.getItem("facility_beds");
      const cachedEquipment = localStorage.getItem("facility_equipment");
      const cachedStaff = localStorage.getItem("facility_staff");
      const cachedOts = localStorage.getItem("facility_otList");
      const cachedTickets = localStorage.getItem("facility_maintenanceTickets");
      const cachedTasks = localStorage.getItem("facility_housekeepingTasks");
      const cachedVisitors = localStorage.getItem("facility_visitors");
      const cachedAmbulances = localStorage.getItem("facility_ambulances");
      const cachedCalls = localStorage.getItem("facility_ambulanceCallLogs");
      const cachedHours = localStorage.getItem("facility_visitingHours");

      if (cachedProfile) setHospitalProfileState(JSON.parse(cachedProfile));
      if (cachedCampuses) setCampuses(JSON.parse(cachedCampuses));
      if (cachedBuildings) setBuildings(JSON.parse(cachedBuildings));
      if (cachedDepartments) setDepartments(JSON.parse(cachedDepartments));
      if (cachedWards) setWards(JSON.parse(cachedWards));
      if (cachedRooms) setRooms(JSON.parse(cachedRooms));
      if (cachedBeds) setBeds(JSON.parse(cachedBeds));
      if (cachedEquipment) setEquipment(JSON.parse(cachedEquipment));
      if (cachedStaff) setStaff(JSON.parse(cachedStaff));
      if (cachedOts) setOtList(JSON.parse(cachedOts));
      if (cachedTickets) setMaintenanceTickets(JSON.parse(cachedTickets));
      if (cachedTasks) setHousekeepingTasks(JSON.parse(cachedTasks));
      if (cachedVisitors) setVisitors(JSON.parse(cachedVisitors));
      if (cachedAmbulances) setAmbulances(JSON.parse(cachedAmbulances));
      if (cachedCalls) setAmbulanceCallLogs(JSON.parse(cachedCalls));
      if (cachedHours) setVisitingHours(JSON.parse(cachedHours));
    } catch (e) {
      console.error("Error reading facility layout from cache:", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("facility_hospitalProfile", JSON.stringify(hospitalProfile));
      localStorage.setItem("facility_campuses", JSON.stringify(campuses));
      localStorage.setItem("facility_buildings", JSON.stringify(buildings));
      localStorage.setItem("facility_departments", JSON.stringify(departments));
      localStorage.setItem("facility_wards", JSON.stringify(wards));
      localStorage.setItem("facility_rooms", JSON.stringify(rooms));
      localStorage.setItem("facility_beds", JSON.stringify(beds));
      localStorage.setItem("facility_equipment", JSON.stringify(equipment));
      localStorage.setItem("facility_staff", JSON.stringify(staff));
      localStorage.setItem("facility_otList", JSON.stringify(otList));
      localStorage.setItem("facility_maintenanceTickets", JSON.stringify(maintenanceTickets));
      localStorage.setItem("facility_housekeepingTasks", JSON.stringify(housekeepingTasks));
      localStorage.setItem("facility_visitors", JSON.stringify(visitors));
      localStorage.setItem("facility_ambulances", JSON.stringify(ambulances));
      localStorage.setItem("facility_ambulanceCallLogs", JSON.stringify(ambulanceCallLogs));
      localStorage.setItem("facility_visitingHours", JSON.stringify(visitingHours));
      localStorage.setItem("facility_setup_complete", setupComplete ? "true" : "false");
    } catch (e) {
      console.error("Error storing facility layout state:", e);
    }
  }, [hospitalProfile, campuses, buildings, departments, wards, rooms, beds, equipment, staff, otList, maintenanceTickets, housekeepingTasks, visitors, ambulances, ambulanceCallLogs, visitingHours, setupComplete, isLoaded]);

  const updateHospitalProfile = (p: Partial<HospitalProfile>) => {
    setHospitalProfileState((prev) => ({ ...prev, ...p }));
  };

  const addCampus = (c: Omit<Campus, "id">) => {
    const newCampus: Campus = { ...c, id: `c-${Date.now()}` };
    setCampuses((prev) => [...prev, newCampus]);
  };
  const removeCampus = (id: string) => {
    setCampuses((prev) => prev.filter((item) => item.id !== id));
    setBuildings((prev) => prev.filter((item) => item.campusId !== id));
  };
  const updateCampus = (c: Campus) => {
    setCampuses((prev) => prev.map((item) => (item.id === c.id ? c : item)));
  };

  const addBuilding = (b: Omit<Building, "id">) => {
    const newB: Building = { ...b, id: `b-${Date.now()}` };
    setBuildings((prev) => [...prev, newB]);
  };
  const removeBuilding = (id: string) => {
    setBuildings((prev) => prev.filter((item) => item.id !== id));
  };
  const updateBuilding = (b: Building) => {
    setBuildings((prev) => prev.map((item) => (item.id === b.id ? b : item)));
  };

  const addDepartment = (d: Omit<Department, "id">) => {
    const newD: Department = { ...d, id: `d-${Date.now()}` };
    setDepartments((prev) => [...prev, newD]);
  };
  const removeDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((item) => item.id !== id));
  };
  const updateDepartment = (d: Department) => {
    setDepartments((prev) => prev.map((item) => (item.id === d.id ? d : item)));
  };

  const addWard = (w: Omit<Ward, "id">) => {
    const newW: Ward = { ...w, id: `w-${Date.now()}` };
    setWards((prev) => [...prev, newW]);
  };
  const removeWard = (id: string) => {
    setWards((prev) => prev.filter((item) => item.id !== id));
  };
  const updateWard = (w: Ward) => {
    setWards((prev) => prev.map((item) => (item.id === w.id ? w : item)));
  };

  const addRoom = (r: Omit<Room, "id" | "occupancy">) => {
    const newR: Room = { ...r, id: `r-${Date.now()}`, occupancy: 0 };
    setRooms((prev) => [...prev, newR]);
  };
  const removeRoom = (id: string) => {
    setRooms((prev) => prev.filter((item) => item.id !== id));
    setBeds((prev) => prev.filter((item) => item.roomId !== id));
  };
  const updateRoom = (r: Room) => {
    setRooms((prev) => prev.map((item) => (item.id === r.id ? r : item)));
  };

  const addBed = (b: Omit<Bed, "id" | "lastUpdated">) => {
    const newB: Bed = {
      ...b,
      id: `bed-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
    };
    setBeds((prev) => [...prev, newB]);

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === b.roomId) {
          const newOcc = b.status === "occupied" ? r.occupancy + 1 : r.occupancy;
          return { ...r, capacity: r.capacity + 1, occupancy: newOcc };
        }
        return r;
      })
    );
  };
  const removeBed = (id: string) => {
    const target = beds.find((b) => b.id === id);
    if (!target) return;
    setBeds((prev) => prev.filter((item) => item.id !== id));

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === target.roomId) {
          const newOcc = target.status === "occupied" ? Math.max(0, r.occupancy - 1) : r.occupancy;
          return { ...r, capacity: Math.max(0, r.capacity - 1), occupancy: newOcc };
        }
        return r;
      })
    );
  };
  const updateBed = (b: Bed) => {
    const oldBed = beds.find((x) => x.id === b.id);
    setBeds((prev) =>
      prev.map((item) => (item.id === b.id ? { ...b, lastUpdated: new Date().toISOString() } : item))
    );

    if (oldBed && oldBed.status !== b.status) {
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id === b.roomId) {
            let occChange = 0;
            if (oldBed.status === "occupied" && b.status !== "occupied") occChange = -1;
            if (oldBed.status !== "occupied" && b.status === "occupied") occChange = 1;
            return { ...r, occupancy: Math.max(0, r.occupancy + occChange) };
          }
          return r;
        })
      );
    }
  };

  const addEquipment = (e: Omit<Equipment, "id">) => {
    const newE: Equipment = { ...e, id: `EQ-${Date.now().toString().slice(-4)}` };
    setEquipment((prev) => [...prev, newE]);
  };
  const removeEquipment = (id: string) => {
    setEquipment((prev) => prev.filter((item) => item.id !== id));
  };
  const updateEquipment = (e: Equipment) => {
    setEquipment((prev) => prev.map((item) => (item.id === e.id ? e : item)));
  };

  const addStaff = (s: Omit<StaffAllocation, "id">) => {
    const newS: StaffAllocation = { ...s, id: `staff-${Date.now()}` };
    setStaff((prev) => [...prev, newS]);
  };
  const removeStaff = (id: string) => {
    setStaff((prev) => prev.filter((item) => item.id !== id));
  };
  const updateStaff = (s: StaffAllocation) => {
    setStaff((prev) => prev.map((item) => (item.id === s.id ? s : item)));
  };

  const addOT = (o: Omit<OT, "id" | "sterilizationStatus" | "cleaningStatus" | "isAvailable" | "schedule">) => {
    const newO: OT = {
      ...o,
      id: `ot-${Date.now()}`,
      sterilizationStatus: "Sterile",
      cleaningStatus: "Clean",
      isAvailable: true,
      schedule: [],
    };
    setOtList((prev) => [...prev, newO]);
  };
  const removeOT = (id: string) => {
    setOtList((prev) => prev.filter((item) => item.id !== id));
  };
  const updateOT = (o: OT) => {
    setOtList((prev) => prev.map((item) => (item.id === o.id ? o : item)));
  };

  const addMaintenanceTicket = (t: Omit<MaintenanceTicket, "id" | "dateRaised" | "comments">) => {
    const newT: MaintenanceTicket = {
      ...t,
      id: `TKT-${Math.floor(100 + Math.random() * 900)}`,
      dateRaised: new Date().toISOString(),
      comments: [],
    };
    setMaintenanceTickets((prev) => [newT, ...prev]);
  };
  const removeMaintenanceTicket = (id: string) => {
    setMaintenanceTickets((prev) => prev.filter((item) => item.id !== id));
  };
  const updateMaintenanceTicket = (t: MaintenanceTicket) => {
    setMaintenanceTickets((prev) => prev.map((item) => (item.id === t.id ? t : item)));
  };

  const addHousekeepingTask = (t: Omit<HousekeepingTask, "id" | "status">) => {
    const newT: HousekeepingTask = {
      ...t,
      id: `HK-${Math.floor(100 + Math.random() * 900)}`,
      status: "Pending",
    };
    setHousekeepingTasks((prev) => [newT, ...prev]);
  };
  const removeHousekeepingTask = (id: string) => {
    setHousekeepingTasks((prev) => prev.filter((item) => item.id !== id));
  };
  const updateHousekeepingTask = (t: HousekeepingTask) => {
    setHousekeepingTasks((prev) => prev.map((item) => (item.id === t.id ? t : item)));
  };

  const addVisitor = (v: Omit<Visitor, "id" | "status">) => {
    const newV: Visitor = {
      ...v,
      id: `vis-${Date.now()}`,
      status: "Active",
    };
    setVisitors((prev) => [newV, ...prev]);
  };
  const removeVisitor = (id: string) => {
    setVisitors((prev) => prev.filter((item) => item.id !== id));
  };
  const updateVisitor = (v: Visitor) => {
    setVisitors((prev) => prev.map((item) => (item.id === v.id ? v : item)));
  };

  const addAmbulance = (a: Omit<Ambulance, "id">) => {
    const newA: Ambulance = { ...a, id: `amb-${Date.now()}` };
    setAmbulances((prev) => [...prev, newA]);
  };
  const removeAmbulance = (id: string) => {
    setAmbulances((prev) => prev.filter((item) => item.id !== id));
  };
  const updateAmbulance = (a: Ambulance) => {
    setAmbulances((prev) => prev.map((item) => (item.id === a.id ? a : item)));
  };

  const addAmbulanceCallLog = (l: Omit<AmbulanceCallLog, "id">) => {
    const newL: AmbulanceCallLog = { ...l, id: `call-${Date.now()}` };
    setAmbulanceCallLogs((prev) => [newL, ...prev]);
  };

  const updateVisitingHours = (wardId: string, fromTime: string, toTime: string) => {
    setVisitingHours((prev) =>
      prev.map((h) => (h.wardId === wardId ? { ...h, fromTime, toTime } : h))
    );
  };

  const completeSetup = (
    profile: HospitalProfile,
    newCampuses: Campus[],
    newBuildings: Building[],
    newDepartments: Department[],
    newWards: Ward[],
    newRooms: Room[]
  ) => {
    setHospitalProfileState(profile);
    setCampuses(newCampuses);
    setBuildings(newBuildings);
    setDepartments(newDepartments);
    setWards(newWards);
    setRooms(newRooms);

    const updatedBeds: Bed[] = [];
    newRooms.forEach((room) => {
      for (let i = 1; i <= room.capacity; i++) {
        const bedName = `${room.type === "ICU" || room.type === "NICU" ? "ICU" : "BED"}-${room.name}-${String.fromCharCode(64 + i)}`;
        updatedBeds.push({
          id: `bed-${room.id}-${i}`,
          roomId: room.id,
          name: bedName,
          status: "available",
          wardId: room.wardId,
          cleaningStatus: "Clean",
          equipmentAttached: room.type === "ICU" ? ["Patient Monitor", "Oxygen"] : ["Oxygen"],
          lastUpdated: new Date().toISOString(),
        });
      }
    });

    setBeds(updatedBeds);
    setSetupComplete(true);
    localStorage.setItem("facility_setup_complete", "true");
  };

  const skipSetup = () => {
    setHospitalProfileState(DEFAULT_PROFILE);
    setCampuses(INITIAL_CAMPUSES);
    setBuildings(INITIAL_BUILDINGS);
    setDepartments(INITIAL_DEPARTMENTS);
    setWards(INITIAL_WARDS);
    setRooms(INITIAL_ROOMS);
    setBeds(INITIAL_BEDS);
    setEquipment(INITIAL_EQUIPMENT);
    setStaff(INITIAL_STAFF);
    setOtList(INITIAL_OT);
    setMaintenanceTickets(INITIAL_MAINTENANCE);
    setHousekeepingTasks(INITIAL_HOUSEKEEPING);
    setVisitors(INITIAL_VISITORS);
    setAmbulances(INITIAL_AMBULANCES);
    setAmbulanceCallLogs(INITIAL_AMBULANCE_CALLS);
    setVisitingHours(INITIAL_VISITING_HOURS);
    setSetupComplete(true);
    localStorage.setItem("facility_setup_complete", "true");
  };

  const resetAll = () => {
    localStorage.removeItem("facility_hospitalProfile");
    localStorage.removeItem("facility_campuses");
    localStorage.removeItem("facility_buildings");
    localStorage.removeItem("facility_departments");
    localStorage.removeItem("facility_wards");
    localStorage.removeItem("facility_rooms");
    localStorage.removeItem("facility_beds");
    localStorage.removeItem("facility_equipment");
    localStorage.removeItem("facility_staff");
    localStorage.removeItem("facility_otList");
    localStorage.removeItem("facility_maintenanceTickets");
    localStorage.removeItem("facility_housekeepingTasks");
    localStorage.removeItem("facility_visitors");
    localStorage.removeItem("facility_ambulances");
    localStorage.removeItem("facility_ambulanceCallLogs");
    localStorage.removeItem("facility_visitingHours");
    localStorage.setItem("facility_setup_complete", "false");

    setHospitalProfileState(DEFAULT_PROFILE);
    setCampuses(INITIAL_CAMPUSES);
    setBuildings(INITIAL_BUILDINGS);
    setDepartments(INITIAL_DEPARTMENTS);
    setWards(INITIAL_WARDS);
    setRooms(INITIAL_ROOMS);
    setBeds(INITIAL_BEDS);
    setEquipment(INITIAL_EQUIPMENT);
    setStaff(INITIAL_STAFF);
    setOtList(INITIAL_OT);
    setMaintenanceTickets(INITIAL_MAINTENANCE);
    setHousekeepingTasks(INITIAL_HOUSEKEEPING);
    setVisitors(INITIAL_VISITORS);
    setAmbulances(INITIAL_AMBULANCES);
    setAmbulanceCallLogs(INITIAL_AMBULANCE_CALLS);
    setVisitingHours(INITIAL_VISITING_HOURS);
    setSetupComplete(false);
  };

  const value: FacilityContextProps = {
    state: {
      hospitalProfile,
      campuses,
      buildings,
      departments,
      wards,
      rooms,
      beds,
      equipment,
      staff,
      icuConfig: {},
      otList,
      maintenanceTickets,
      housekeepingTasks,
      visitors,
      ambulances,
      ambulanceCallLogs,
      visitingHours,
      setupComplete,
    },
    updateHospitalProfile,
    setCampuses,
    addCampus,
    removeCampus,
    updateCampus,
    setBuildings,
    addBuilding,
    removeBuilding,
    updateBuilding,
    setDepartments,
    addDepartment,
    removeDepartment,
    updateDepartment,
    setWards,
    addWard,
    removeWard,
    updateWard,
    setRooms,
    addRoom,
    removeRoom,
    updateRoom,
    setBeds,
    addBed,
    removeBed,
    updateBed,
    setEquipment,
    addEquipment,
    removeEquipment,
    updateEquipment,
    setStaff,
    addStaff,
    removeStaff,
    updateStaff,
    setOtList,
    addOT,
    removeOT,
    updateOT,
    setMaintenanceTickets,
    addMaintenanceTicket,
    removeMaintenanceTicket,
    updateMaintenanceTicket,
    setHousekeepingTasks,
    addHousekeepingTask,
    removeHousekeepingTask,
    updateHousekeepingTask,
    setVisitors,
    addVisitor,
    removeVisitor,
    updateVisitor,
    setAmbulances,
    addAmbulance,
    removeAmbulance,
    updateAmbulance,
    addAmbulanceCallLog,
    setVisitingHours,
    updateVisitingHours,
    completeSetup,
    skipSetup,
    resetAll,
  };

  return (
    <FacilityContext.Provider value={value}>
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacility() {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error("useFacility must be used within a FacilityProvider");
  }
  return context;
}
