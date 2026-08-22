"use client";

import React, { useState, useMemo } from "react";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Calendar, Clock, User, Check, X, ShieldAlert, Heart
} from "lucide-react";

export default function OperationTheatrePage() {
  const { state, updateOT } = useFacility();
  const [selectedOtId, setSelectedOtId] = useState<string | null>(null);
  
  // Schedule surgery modal form
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [surgeryForm, setSurgeryForm] = useState({
    time: "10:00 - 11:30",
    procedure: "",
    patient: "",
    surgeon: "",
  });

  const selectedOt = useMemo(() => {
    return state.otList.find((ot) => ot.id === selectedOtId) || null;
  }, [state.otList, selectedOtId]);

  const handleToggleAvailability = (ot: any) => {
    updateOT({
      ...ot,
      isAvailable: !ot.isAvailable,
      sterilizationStatus: !ot.isAvailable ? "Sterile" : "Pending",
    });
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOt || !surgeryForm.procedure.trim() || !surgeryForm.patient.trim() || !surgeryForm.surgeon.trim()) return;

    // Add to schedule list
    const updatedSchedule = [...selectedOt.schedule, surgeryForm];
    
    // Sort schedule roughly by time prefix
    updatedSchedule.sort((a, b) => a.time.localeCompare(b.time));

    // Update OT state
    updateOT({
      ...selectedOt,
      schedule: updatedSchedule,
      nextSurgery: {
        time: surgeryForm.time.split(" ")[0] || "09:00",
        procedure: surgeryForm.procedure,
      },
    });

    setScheduleModalOpen(false);
    setSurgeryForm({
      time: "10:00 - 11:30",
      procedure: "",
      patient: "",
      surgeon: "",
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">Operation Theatre (OT) Management</h2>
        <p className="text-xs text-[#64748b]">Monitor operating schedules, sterilization cycles, and surgery logs</p>
      </div>

      {/* OT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {state.otList.map((ot) => {
          const isSterile = ot.sterilizationStatus === "Sterile";
          const isInUse = ot.sterilizationStatus === "In Use";
          
          return (
            <div 
              key={ot.id}
              className={`bg-white border ${selectedOtId === ot.id ? "border-[#4CAF72] ring-2 ring-[#4CAF72]/15" : "border-[#e2e8f0]"} rounded-[6px] p-4 flex flex-col justify-between space-y-4 shadow-sm hover:border-[#4CAF72] transition-all`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[14px] font-[800] text-[#0f172a]">{ot.name}</h3>
                  <span className="text-[10px] text-[#64748b] font-[600]">Sterilization Check</span>
                </div>
                <Badge variant={isSterile ? "success" : isInUse ? "destructive" : "warning"}>
                  {ot.sterilizationStatus}
                </Badge>
              </div>

              {/* Current Surgery Info */}
              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-[4px] text-[13px] font-[600]">
                <span className="text-[10px] uppercase font-[700] text-[#94a3b8] block">Current Status</span>
                {ot.currentSurgery ? (
                  <div className="text-[#0f172a] mt-1 space-y-0.5">
                    <p className="font-[800] text-[#dc2626] flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 animate-pulse" /> {ot.currentSurgery.procedureName}
                    </p>
                    <p className="text-[#64748b] text-[11px]">Patient: {ot.currentSurgery.patientName}</p>
                    <p className="text-[#64748b] text-[11px]">Surgeon: {ot.assignedSurgeon || "—"}</p>
                  </div>
                ) : (
                  <p className="text-[#64748b] italic mt-1">Vacant / Available</p>
                )}
              </div>

              {/* Next Surgery */}
              <div className="text-[12px] font-[600] text-[#475569] space-y-1">
                <span className="text-[10px] uppercase font-[700] text-[#94a3b8] block">Next Scheduled</span>
                {ot.nextSurgery ? (
                  <p className="text-[#0f172a]">
                    <strong>{ot.nextSurgery.time}</strong> — {ot.nextSurgery.procedure}
                  </p>
                ) : (
                  <p className="text-slate-400 italic">No further surgeries scheduled</p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-[#f1f5f9] gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-[700] text-[#64748b]">Active:</span>
                  <button
                    onClick={() => handleToggleAvailability(ot)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      ot.isAvailable ? "bg-[#4CAF72]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        ot.isAvailable ? "translate-x-4.5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                
                <button
                  onClick={() => setSelectedOtId(ot.id)}
                  className="text-xs font-[700] text-[#4CAF72] hover:underline"
                >
                  Manage OT
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Expanded OT Details & Timeline */}
      {selectedOt && (
        <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 space-y-5 shadow-sm">
          <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
            <div>
              <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider">{selectedOt.name} Daily Schedule</h3>
              <p className="text-xs text-[#64748b]">Schedule procedures, sterilize OT, or check active equipment checklists</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setScheduleModalOpen(true)} className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Schedule Surgery
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  updateOT({
                    ...selectedOt,
                    sterilizationStatus: "Sterile",
                    cleaningStatus: "Clean",
                  });
                  alert("Sterilization cycle completed!");
                }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-green-600" /> Mark Sterile
              </Button>
              <button onClick={() => setSelectedOtId(null)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Surgery Timeline View */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-[11px] font-[800] uppercase tracking-wider text-[#64748b] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#4CAF72]" /> Surgery Schedule Log
              </h4>

              {selectedOt.schedule.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-[#e2e8f0] rounded-[6px] text-xs text-[#94a3b8] italic">
                  No surgeries scheduled for today. Click "Schedule Surgery" to book.
                </div>
              ) : (
                <div className="relative border-l border-[#e2e8f0] ml-3 pl-5 space-y-4">
                  {selectedOt.schedule.map((item, idx) => (
                    <div key={idx} className="relative text-[13px] font-[600] text-[#475569]">
                      {/* Timeline dot */}
                      <span className="absolute -left-[25.5px] top-1 w-2.5 h-2.5 rounded-full bg-[#4CAF72] border-2 border-white ring-2 ring-[#4CAF72]/20" />
                      
                      <div className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-[6px] space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-[700]">
                          <span className="text-[#0f172a]">{item.procedure}</span>
                          <span className="text-[#64748b] flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.time}</span>
                        </div>
                        <div className="text-[11px] text-[#64748b] flex gap-4">
                          <span>Patient: {item.patient}</span>
                          <span>Surgeon: {item.surgeon}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Equipment Checklist */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-[800] uppercase tracking-wider text-[#64748b] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#4CAF72]" /> Pre-Op Equipment Checklist
              </h4>

              <div className="p-3 bg-slate-50 border border-[#e2e8f0] rounded-[6px] space-y-2">
                {[
                  "Anesthesia Machine",
                  "Defibrillator",
                  "Electro-Surgical Unit (ESU)",
                  "Operating Lights Calibration",
                  "Suction Pumps Checked",
                  "Backup Power Online",
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-xs font-[600] text-[#475569] cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={idx < 4}
                      className="rounded text-[#4CAF72] focus:ring-[#4CAF72]"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Schedule Surgery Modal */}
      {scheduleModalOpen && selectedOt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setScheduleModalOpen(false)} />
          <form onSubmit={handleScheduleSubmit} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4 shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">
              Book Operating Slot — {selectedOt.name}
            </h3>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Operating Time Slot *</label>
              <Input
                value={surgeryForm.time}
                onChange={(e) => setSurgeryForm({ ...surgeryForm, time: e.target.value })}
                placeholder="e.g. 10:00 - 11:30"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Surgery / Procedure *</label>
              <Input
                value={surgeryForm.procedure}
                onChange={(e) => setSurgeryForm({ ...surgeryForm, procedure: e.target.value })}
                placeholder="e.g. Laparoscopic Appendectomy"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Patient Name *</label>
              <Input
                value={surgeryForm.patient}
                onChange={(e) => setSurgeryForm({ ...surgeryForm, patient: e.target.value })}
                placeholder="e.g. Nancy Robinson"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Assigned Surgeon *</label>
              <Input
                value={surgeryForm.surgeon}
                onChange={(e) => setSurgeryForm({ ...surgeryForm, surgeon: e.target.value })}
                placeholder="e.g. Dr. Adrian Miller"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setScheduleModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Book Slot</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
