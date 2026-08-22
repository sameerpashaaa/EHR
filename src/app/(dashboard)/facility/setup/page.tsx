"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFacility } from "@/contexts/FacilityContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2, Trash2, Plus, ArrowLeft, ArrowRight, Check, AlertCircle, HelpCircle
} from "lucide-react";

export default function SetupWizardPage() {
  const router = useRouter();
  const { state, completeSetup, skipSetup } = useFacility();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Hospital Profile
  const [profile, setProfile] = useState({
    name: "Metapharsic General Hospital",
    logoUrl: "",
    registrationNumber: "REG-908123A",
    nabhAccreditation: "Yes" as "Yes" | "No" | "In Progress",
    type: "General",
    address: "102 Healthcare Avenue, Medical District",
    emergencyContact: "+1 (555) 999-1122",
    workingHoursFrom: "08:00",
    workingHoursTo: "20:00",
  });

  // Step 2: Campuses
  const [campuses, setCampuses] = useState<any[]>([
    { id: "c-1", name: "Main Campus", location: "102 Healthcare Avenue", type: "Main" }
  ]);
  const [campusName, setCampusName] = useState("");
  const [campusLoc, setCampusLoc] = useState("");
  const [campusType, setCampusType] = useState("Main");

  // Step 3: Buildings
  const [buildings, setBuildings] = useState<any[]>([
    { id: "b-1", campusId: "c-1", name: "Block A", floors: 4, wing: "West Wing" },
    { id: "b-2", campusId: "c-1", name: "Block B", floors: 3, wing: "East Wing" }
  ]);
  const [bName, setBName] = useState("");
  const [bFloors, setBFloors] = useState(2);
  const [bWing, setBWing] = useState("");
  const [bCampusId, setBCampusId] = useState("");

  // Step 4: Departments
  const deptSuggestions = [
    "Emergency", "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "ENT", 
    "ICU", "NICU", "PICU", "Dialysis", "Radiology", "Pharmacy", "Laboratory", 
    "Blood Bank", "Billing", "Reception", "Administration", "Housekeeping", 
    "Maintenance", "Cafeteria", "Mortuary", "Operation Theatre"
  ];
  const [selectedDepts, setSelectedDepts] = useState<string[]>([
    "Emergency", "Cardiology", "ICU", "Neurology", "Pharmacy", "Laboratory", "Operation Theatre"
  ]);
  const [customDept, setCustomDept] = useState("");

  // Step 5: Wards
  const wardSuggestions = [
    "Male Ward", "Female Ward", "Private Ward", "General Ward", "Isolation Ward", 
    "Burn Ward", "Cancer Ward", "COVID Ward", "Children Ward", "VIP Ward", 
    "Maternity Ward", "Psychiatric Ward"
  ];
  const [selectedWards, setSelectedWards] = useState<string[]>([
    "General Ward", "ICU Ward", "Private Ward", "Maternity Ward"
  ]);
  const [customWard, setCustomWard] = useState("");

  // Step 6: Room Configuration
  const roomTypes = [
    "General", "Semi Private", "Private", "Deluxe", "Suite", "Isolation", 
    "Negative Pressure", "ICU", "NICU", "PICU", "Recovery Room", "OT", 
    "Lab Room", "Consultation Room", "Procedure Room", "Emergency Room"
  ];
  const [roomConfigs, setRoomConfigs] = useState<Record<string, { selected: boolean; capacity: number; prefix: string }>>({
    General: { selected: true, capacity: 6, prefix: "2" },
    "Semi Private": { selected: true, capacity: 2, prefix: "2" },
    Private: { selected: true, capacity: 1, prefix: "B" },
    Deluxe: { selected: true, capacity: 1, prefix: "B" },
    ICU: { selected: true, capacity: 8, prefix: "3" },
    NICU: { selected: true, capacity: 4, prefix: "3" },
    OT: { selected: true, capacity: 1, prefix: "4" },
    "Lab Room": { selected: true, capacity: 2, prefix: "B" },
    "Emergency Room": { selected: true, capacity: 5, prefix: "1" },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation functions
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!profile.name.trim()) errs.name = "Hospital Name is required.";
    if (!profile.address.trim()) errs.address = "Address is required.";
    if (!profile.emergencyContact.trim()) errs.emergencyContact = "Emergency Contact is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (campuses.length === 0) {
      errs.campuses = "At least one campus is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    // Check if every campus has at least one building
    const errs: Record<string, string> = {};
    campuses.forEach((camp) => {
      const campBuildings = buildings.filter((b) => b.campusId === camp.id);
      if (campBuildings.length === 0) {
        errs[camp.id] = `Building config missing: Add at least one building for campus "${camp.name}".`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSkip = () => {
    skipSetup();
    router.replace("/facility/overview");
  };

  const handleComplete = () => {
    // Generate the rooms list dynamically from step 6 configs & buildings/floors
    const generatedRooms: any[] = [];
    let roomIdCounter = 1;

    buildings.forEach((building) => {
      // Loop over floors: 0 = Ground, 1 = Floor 1, etc.
      for (let floorIdx = 0; floorIdx < building.floors; floorIdx++) {
        const floorName = floorIdx === 0 ? "Ground" : `Floor ${floorIdx}`;
        
        // Let's create rooms for selected configs
        Object.entries(roomConfigs).forEach(([type, cfg]) => {
          if (!cfg.selected) return;

          // For the sake of wizard config, generate 1 room of this type per floor if prefix matches
          // e.g. prefix "2" matches Floor 1 rooms, etc.
          let shouldCreate = false;
          if (cfg.prefix === "1" && floorName === "Ground") shouldCreate = true;
          if (cfg.prefix === "2" && floorName === "Floor 1") shouldCreate = true;
          if (cfg.prefix === "3" && floorName === "Floor 2") shouldCreate = true;
          if (cfg.prefix === "4" && floorName === "Floor 3") shouldCreate = true;
          if (cfg.prefix === "B" && building.name.includes("B")) shouldCreate = true;

          if (shouldCreate) {
            const roomNum = `${cfg.prefix}-${100 + roomIdCounter}`;
            // Find a matching department/ward
            const dept = selectedDepts.find((d) => d.toLowerCase().includes(type.toLowerCase())) || selectedDepts[0];
            const ward = selectedWards.find((w) => w.toLowerCase().includes(type.toLowerCase())) || selectedWards[0];

            generatedRooms.push({
              id: `r-${roomIdCounter}`,
              name: roomNum,
              type,
              floor: floorName,
              wardId: "w1", // Default to w1 (General) or matching
              departmentId: "d1", // Default
              capacity: cfg.capacity,
              occupancy: 0,
              cleaningStatus: "Clean",
            });
            roomIdCounter++;
          }
        });
      }
    });

    const parsedCampuses = campuses.map((c) => ({
      id: c.id,
      name: c.name,
      location: c.location,
      type: c.type as "Main" | "Satellite" | "Annex"
    }));

    const parsedBuildings = buildings.map((b) => ({
      id: b.id,
      campusId: b.campusId,
      name: b.name,
      floors: b.floors,
      wing: b.wing
    }));

    const parsedDepts = selectedDepts.map((d, index) => ({
      id: `d-${index + 1}`,
      name: d
    }));

    const parsedWards = selectedWards.map((w, index) => ({
      id: `w-${index + 1}`,
      name: w
    }));

    completeSetup(
      profile,
      parsedCampuses,
      parsedBuildings,
      parsedDepts,
      parsedWards,
      generatedRooms.length > 0 ? generatedRooms : state.rooms
    );

    router.replace("/facility/overview");
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#e2e8f0]">
        <div>
          <h1 className="text-xl font-[800] text-[#0f172a] tracking-tight">Facility Setup Wizard</h1>
          <p className="text-xs text-[#64748b]">Configure your campuses, layout, departments, and rooms</p>
        </div>
        <button
          onClick={handleSkip}
          className="text-xs font-[600] text-[#4CAF72] hover:text-[#3e9c5f] transition-all"
        >
          Skip Setup (Load Demo Data)
        </button>
      </div>

      {/* Progress Steps Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#e2e8f0] -translate-y-1/2 z-0" />
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <button
              key={step}
              onClick={() => {
                if (step < currentStep) setCurrentStep(step);
              }}
              disabled={step > currentStep}
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-[700] border transition-all ${
                currentStep === step
                  ? "bg-[#4CAF72] text-white border-[#4CAF72]"
                  : currentStep > step
                  ? "bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]"
                  : "bg-white text-[#94a3b8] border-[#e2e8f0] cursor-not-allowed"
              }`}
            >
              {currentStep > step ? <Check className="w-4 h-4" /> : step}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[#64748b] font-[700] uppercase tracking-wider mt-2 px-1">
          <span>Profile</span>
          <span>Campuses</span>
          <span>Buildings</span>
          <span>Depts</span>
          <span>Wards</span>
          <span>Rooms</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step Contents */}
      <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-6 shadow-sm min-h-[400px] flex flex-col justify-between">
        
        {/* STEP 1: Profile */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-[14px] font-[800] text-[#0f172a] border-b border-[#f1f5f9] pb-2 uppercase tracking-wider">STEP 1: Hospital Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Hospital Name *</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Metapharsic General Hospital"
                />
                {errors.name && <span className="text-[11px] text-[#dc2626]">{errors.name}</span>}
              </div>

              <div>
                <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Logo URL (Optional)</label>
                <Input
                  value={profile.logoUrl}
                  onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                  placeholder="e.g. https://domain.com/logo.png"
                />
              </div>

              <div>
                <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Registration Number</label>
                <Input
                  value={profile.registrationNumber}
                  onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                  placeholder="e.g. REG-12345"
                />
              </div>

              <div>
                <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">NABH Accreditation Status</label>
                <select
                  value={profile.nabhAccreditation}
                  onChange={(e: any) => setProfile({ ...profile, nabhAccreditation: e.target.value })}
                  className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-3 text-[13.5px]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Hospital Type</label>
                <select
                  value={profile.type}
                  onChange={(e) => setProfile({ ...profile, type: e.target.value })}
                  className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-3 text-[13.5px]"
                >
                  <option value="General">General</option>
                  <option value="Multi Specialty">Multi Specialty</option>
                  <option value="Super Specialty">Super Specialty</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Trauma Center">Trauma Center</option>
                  <option value="Children's Hospital">Children's Hospital</option>
                  <option value="Teaching Hospital">Teaching Hospital</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Address *</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows={2}
                  className="w-full rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white p-3 text-[13.5px] focus:outline-none focus:border-[#4CAF72]"
                  placeholder="Full address of the hospital"
                />
                {errors.address && <span className="text-[11px] text-[#dc2626]">{errors.address}</span>}
              </div>

              <div>
                <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Emergency Contact *</label>
                <Input
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  placeholder="e.g. +1 (555) 999-1122"
                />
                {errors.emergencyContact && <span className="text-[11px] text-[#dc2626]">{errors.emergencyContact}</span>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Working From</label>
                  <input
                    type="time"
                    value={profile.workingHoursFrom}
                    onChange={(e) => setProfile({ ...profile, workingHoursFrom: e.target.value })}
                    className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] px-3 text-[13.5px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Working To</label>
                  <input
                    type="time"
                    value={profile.workingHoursTo}
                    onChange={(e) => setProfile({ ...profile, workingHoursTo: e.target.value })}
                    className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] px-3 text-[13.5px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Campuses */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-[14px] font-[800] text-[#0f172a] border-b border-[#f1f5f9] pb-2 uppercase tracking-wider">STEP 2: Configure Campuses</h3>
            
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-[6px] grid grid-cols-3 gap-3">
              <div className="col-span-3"><h4 className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-wider">Add New Campus</h4></div>
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Campus Name</label>
                <Input value={campusName} onChange={(e) => setCampusName(e.target.value)} placeholder="Main / North Annex" />
              </div>
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Location/Address</label>
                <Input value={campusLoc} onChange={(e) => setCampusLoc(e.target.value)} placeholder="Address or block location" />
              </div>
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Campus Type</label>
                <select value={campusType} onChange={(e) => setCampusType(e.target.value)} className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2 text-[13px]">
                  <option value="Main">Main</option>
                  <option value="Satellite">Satellite</option>
                  <option value="Annex">Annex</option>
                </select>
              </div>
              <div className="col-span-3 flex justify-end">
                <Button
                  onClick={() => {
                    if (!campusName.trim()) return;
                    setCampuses([...campuses, { id: `c-${Date.now()}`, name: campusName, location: campusLoc, type: campusType }]);
                    setCampusName("");
                    setCampusLoc("");
                  }}
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Campus
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block">Campuses List</label>
              {campuses.length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed border-[#e2e8f0] rounded-[6px] text-xs text-[#94a3b8]">
                  No campuses added yet. Add at least 1 campus.
                </div>
              ) : (
                <div className="border border-[#e2e8f0] rounded-[6px] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
                        <th className="p-3">Name</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Type</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
                      {campuses.map((c) => (
                        <tr key={c.id}>
                          <td className="p-3">{c.name}</td>
                          <td className="p-3">{c.location || "—"}</td>
                          <td className="p-3">
                            <span className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded-[4px] font-[700]">
                              {c.type}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setCampuses(campuses.filter((x) => x.id !== c.id));
                                setBuildings(buildings.filter((b) => b.campusId !== c.id));
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {errors.campuses && <span className="text-[11px] text-[#dc2626] font-bold block">{errors.campuses}</span>}
            </div>
          </div>
        )}

        {/* STEP 3: Buildings */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-[14px] font-[800] text-[#0f172a] border-b border-[#f1f5f9] pb-2 uppercase tracking-wider">STEP 3: Configure Buildings per Campus</h3>
            
            <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-[6px] grid grid-cols-4 gap-3">
              <div className="col-span-4"><h4 className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-wider">Add New Building</h4></div>
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Campus</label>
                <select
                  value={bCampusId || (campuses[0]?.id || "")}
                  onChange={(e) => setBCampusId(e.target.value)}
                  className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Building Name</label>
                <Input value={bName} onChange={(e) => setBName(e.target.value)} placeholder="e.g. Block A / Main Building" />
              </div>
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Floors Count</label>
                <Input type="number" min={1} value={bFloors} onChange={(e) => setBFloors(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Wing Label (Optional)</label>
                <Input value={bWing} onChange={(e) => setBWing(e.target.value)} placeholder="e.g. East Wing" />
              </div>
              <div className="col-span-4 flex justify-end">
                <Button
                  onClick={() => {
                    if (!bName.trim()) return;
                    const cId = bCampusId || campuses[0]?.id;
                    if (!cId) return;
                    setBuildings([...buildings, { id: `b-${Date.now()}`, campusId: cId, name: bName, floors: bFloors, wing: bWing }]);
                    setBName("");
                    setBWing("");
                  }}
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Building
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {campuses.map((camp) => {
                const campB = buildings.filter((b) => b.campusId === camp.id);
                return (
                  <div key={camp.id} className="border border-[#e2e8f0] rounded-[6px] p-3 space-y-2">
                    <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-1.5">
                      <h4 className="text-[12px] font-[800] text-[#0f172a] flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#4CAF72]" /> {camp.name} <span className="text-[10px] text-[#64748b] font-[600]">({camp.type})</span>
                      </h4>
                      <span className="text-[10px] text-[#64748b] font-[700]">{campB.length} Buildings</span>
                    </div>

                    {campB.length === 0 ? (
                      <div className="text-center py-4 text-xs text-[#94a3b8] italic">
                        No buildings configured for this campus.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {campB.map((b) => (
                          <div key={b.id} className="flex justify-between items-center p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] text-[13px] font-[600]">
                            <div>
                              <p className="text-[#0f172a]">{b.name}</p>
                              <p className="text-[10px] text-[#64748b] font-[500]">{b.floors} Floors {b.wing ? `• ${b.wing}` : ""}</p>
                            </div>
                            <button
                              onClick={() => setBuildings(buildings.filter((x) => x.id !== b.id))}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {errors[camp.id] && <p className="text-[11px] text-[#dc2626] font-bold">{errors[camp.id]}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Departments */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-[14px] font-[800] text-[#0f172a] border-b border-[#f1f5f9] pb-2 uppercase tracking-wider">STEP 4: Select/Add Departments</h3>
            
            <div className="flex gap-2">
              <Input
                value={customDept}
                onChange={(e) => setCustomDept(e.target.value)}
                placeholder="Enter custom department name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customDept.trim()) {
                    if (!selectedDepts.includes(customDept.trim())) {
                      setSelectedDepts([...selectedDepts, customDept.trim()]);
                    }
                    setCustomDept("");
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (!customDept.trim()) return;
                  if (!selectedDepts.includes(customDept.trim())) {
                    setSelectedDepts([...selectedDepts, customDept.trim()]);
                  }
                  setCustomDept("");
                }}
                className="flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>

            <div>
              <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-2">Departments List ({selectedDepts.length} Selected)</label>
              <div className="flex flex-wrap gap-1.5 max-h-[250px] overflow-y-auto p-1.5 border border-[#e2e8f0] rounded-[6px]">
                {deptSuggestions.map((dept) => {
                  const isSelected = selectedDepts.includes(dept);
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDepts(selectedDepts.filter((d) => d !== dept));
                        } else {
                          setSelectedDepts([...selectedDepts, dept]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-[4px] text-[12px] font-[600] border transition-all ${
                        isSelected
                          ? "bg-[#f0fdf4] text-[#16a34a] border-[#22c55e] font-[700]"
                          : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f8fafc]"
                      }`}
                    >
                      {dept}
                    </button>
                  );
                })}
                {/* Render any additional custom depts not in standard list */}
                {selectedDepts.filter(x => !deptSuggestions.includes(x)).map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDepts(selectedDepts.filter((d) => d !== dept))}
                    className="px-3 py-1.5 rounded-[4px] text-[12px] font-[700] border bg-[#f0fdf4] text-[#16a34a] border-[#22c55e] flex items-center gap-1.5"
                  >
                    {dept} <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Wards */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-[14px] font-[800] text-[#0f172a] border-b border-[#f1f5f9] pb-2 uppercase tracking-wider">STEP 5: Select/Add Wards</h3>
            
            <div className="flex gap-2">
              <Input
                value={customWard}
                onChange={(e) => setCustomWard(e.target.value)}
                placeholder="Enter custom ward name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customWard.trim()) {
                    if (!selectedWards.includes(customWard.trim())) {
                      setSelectedWards([...selectedWards, customWard.trim()]);
                    }
                    setCustomWard("");
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (!customWard.trim()) return;
                  if (!selectedWards.includes(customWard.trim())) {
                    setSelectedWards([...selectedWards, customWard.trim()]);
                  }
                  setCustomWard("");
                }}
                className="flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>

            <div>
              <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-2">Wards List ({selectedWards.length} Selected)</label>
              <div className="flex flex-wrap gap-1.5 max-h-[250px] overflow-y-auto p-1.5 border border-[#e2e8f0] rounded-[6px]">
                {wardSuggestions.map((ward) => {
                  const isSelected = selectedWards.includes(ward);
                  return (
                    <button
                      key={ward}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedWards(selectedWards.filter((w) => w !== ward));
                        } else {
                          setSelectedWards([...selectedWards, ward]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-[4px] text-[12px] font-[600] border transition-all ${
                        isSelected
                          ? "bg-[#f0fdf4] text-[#16a34a] border-[#22c55e] font-[700]"
                          : "bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f8fafc]"
                      }`}
                    >
                      {ward}
                    </button>
                  );
                })}
                {/* Custom wards */}
                {selectedWards.filter(x => !wardSuggestions.includes(x)).map((ward) => (
                  <button
                    key={ward}
                    type="button"
                    onClick={() => setSelectedWards(selectedWards.filter((w) => w !== ward))}
                    className="px-3 py-1.5 rounded-[4px] text-[12px] font-[700] border bg-[#f0fdf4] text-[#16a34a] border-[#22c55e] flex items-center gap-1.5"
                  >
                    {ward} <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Room Configuration */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-[14px] font-[800] text-[#0f172a] border-b border-[#f1f5f9] pb-2 uppercase tracking-wider">STEP 6: Room Configuration & Default Capacities</h3>
            
            <div className="border border-[#e2e8f0] rounded-[6px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
                    <th className="p-3">Select</th>
                    <th className="p-3">Room Type</th>
                    <th className="p-3">Default Capacity (Beds)</th>
                    <th className="p-3">Starting Room Number Prefix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
                  {roomTypes.map((type) => {
                    const cfg = roomConfigs[type] || { selected: false, capacity: 2, prefix: "1" };
                    return (
                      <tr key={type} className={cfg.selected ? "bg-[#f8fafc]/50" : ""}>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={cfg.selected}
                            onChange={(e) => setRoomConfigs({
                              ...roomConfigs,
                              [type]: { ...cfg, selected: e.target.checked }
                            })}
                            className="rounded border-slate-300 text-[#4CAF72] focus:ring-[#4CAF72]"
                          />
                        </td>
                        <td className="p-3 font-[700] text-[#0f172a]">{type}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            min={0}
                            disabled={!cfg.selected}
                            value={cfg.capacity}
                            onChange={(e) => setRoomConfigs({
                              ...roomConfigs,
                              [type]: { ...cfg, capacity: Number(e.target.value) }
                            })}
                            className="w-20 px-2 py-1 rounded border border-[#e2e8f0] bg-white text-[13px] disabled:opacity-50 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            disabled={!cfg.selected}
                            value={cfg.prefix}
                            onChange={(e) => setRoomConfigs({
                              ...roomConfigs,
                              [type]: { ...cfg, prefix: e.target.value }
                            })}
                            className="w-20 px-2 py-1 rounded border border-[#e2e8f0] bg-white text-[13px] disabled:opacity-50 disabled:bg-slate-100"
                            placeholder="Prefix"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 7: Review & Confirm */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <h3 className="text-[14px] font-[800] text-[#0f172a] border-b border-[#f1f5f9] pb-2 uppercase tracking-wider">STEP 7: Review & Complete Setup</h3>
            
            <div className="grid grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-1">
              
              {/* Profile Card */}
              <div className="border border-[#e2e8f0] rounded-[6px] p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-1.5">
                  <h4 className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-wider">Hospital Profile</h4>
                  <button onClick={() => setCurrentStep(1)} className="text-[10px] text-[#4CAF72] font-[700] hover:underline">Edit</button>
                </div>
                <div className="text-[13px] space-y-1 text-[#475569]">
                  <p><strong className="text-[#0f172a]">Name:</strong> {profile.name}</p>
                  <p><strong className="text-[#0f172a]">Accreditation:</strong> {profile.nabhAccreditation}</p>
                  <p><strong className="text-[#0f172a]">Type:</strong> {profile.type}</p>
                  <p><strong className="text-[#0f172a]">Emergency:</strong> {profile.emergencyContact}</p>
                  <p><strong className="text-[#0f172a]">Working Hours:</strong> {profile.workingHoursFrom} to {profile.workingHoursTo}</p>
                  <p className="text-[11px] leading-tight truncate"><strong className="text-[#0f172a]">Address:</strong> {profile.address}</p>
                </div>
              </div>

              {/* Campus & Buildings Card */}
              <div className="border border-[#e2e8f0] rounded-[6px] p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-1.5">
                  <h4 className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-wider">Campuses & Buildings</h4>
                  <button onClick={() => setCurrentStep(2)} className="text-[10px] text-[#4CAF72] font-[700] hover:underline">Edit</button>
                </div>
                <div className="text-[13px] space-y-2 text-[#475569]">
                  <p><strong className="text-[#0f172a]">Campuses count:</strong> {campuses.length}</p>
                  <div className="pl-2 border-l-2 border-[#e2e8f0] space-y-1">
                    {campuses.map(c => {
                      const cBuildings = buildings.filter(b => b.campusId === c.id);
                      return (
                        <p key={c.id} className="text-[11px]">
                          <strong>{c.name}:</strong> {cBuildings.map(b => b.name).join(", ") || "No buildings"}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Departments Card */}
              <div className="border border-[#e2e8f0] rounded-[6px] p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-1.5">
                  <h4 className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-wider">Departments Selected</h4>
                  <button onClick={() => setCurrentStep(4)} className="text-[10px] text-[#4CAF72] font-[700] hover:underline">Edit</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedDepts.map(d => (
                    <span key={d} className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded-[4px] font-[600]">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Wards Card */}
              <div className="border border-[#e2e8f0] rounded-[6px] p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-1.5">
                  <h4 className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-wider">Wards Configured</h4>
                  <button onClick={() => setCurrentStep(5)} className="text-[10px] text-[#4CAF72] font-[700] hover:underline">Edit</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedWards.map(w => (
                    <span key={w} className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded-[4px] font-[600]">
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rooms Card */}
              <div className="col-span-2 border border-[#e2e8f0] rounded-[6px] p-4 space-y-2">
                <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-1.5">
                  <h4 className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-wider">Room Configurations</h4>
                  <button onClick={() => setCurrentStep(6)} className="text-[10px] text-[#4CAF72] font-[700] hover:underline">Edit</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(roomConfigs).filter(([_, cfg]) => cfg.selected).map(([type, cfg]) => (
                    <div key={type} className="bg-[#f8fafc] border border-[#e2e8f0] p-2 rounded-[4px] text-[12px]">
                      <strong className="text-[#0f172a]">{type}</strong>
                      <div className="text-[10px] text-[#64748b] mt-0.5">
                        Capacity: {cfg.capacity} Beds • Prefix: {cfg.prefix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#e2e8f0]">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" size="sm" onClick={prevStep} className="flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            )}
          </div>
          <div>
            {currentStep < 7 ? (
              <Button size="sm" onClick={nextStep} className="flex items-center gap-1">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleComplete} className="flex items-center gap-1.5 bg-[#4CAF72] text-white">
                Complete Setup <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
