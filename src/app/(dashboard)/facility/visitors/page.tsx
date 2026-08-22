"use client";

import React, { useState } from "react";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, CalendarClock, UserCheck, Clock, Check, X, ShieldAlert, Heart
} from "lucide-react";

export default function VisitorManagementPage() {
  const { state, addVisitor, updateVisitor, updateVisitingHours } = useFacility();

  // Issue Pass Modal State
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [newPass, setNewPass] = useState({
    name: "",
    contactNumber: "",
    relation: "Spouse",
    patientName: "",
    purpose: "Patient Visit",
    validFrom: "16:00",
    validTo: "19:00",
    wardRoom: "General / Room 201",
  });

  const relations = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"];

  const handleIssuePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass.name.trim() || !newPass.patientName.trim()) return;

    const passId = `PASS-${Math.floor(1000 + Math.random() * 9000)}`;

    addVisitor({
      name: newPass.name,
      relation: newPass.relation,
      patientName: newPass.patientName,
      wardRoom: newPass.wardRoom,
      entryTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      passId,
      purpose: newPass.purpose,
    });

    setPassModalOpen(false);
    setNewPass({
      name: "",
      contactNumber: "",
      relation: "Spouse",
      patientName: "",
      purpose: "Patient Visit",
      validFrom: "16:00",
      validTo: "19:00",
      wardRoom: "General / Room 201",
    });
  };

  const handleCheckOut = (visitor: any) => {
    updateVisitor({
      ...visitor,
      status: "Checked Out",
      exitTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">Visitor Pass Management</h2>
          <p className="text-xs text-[#64748b]">Issue visitor credentials, configure visiting slot allowances, and log gate entries</p>
        </div>
        <Button size="sm" onClick={() => setPassModalOpen(true)} className="flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Issue Pass
        </Button>
      </div>

      {/* Today's Visitors Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-[#e2e8f0] px-4 py-2.5">
          <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider">Today's Visitors Logs</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
              <th className="p-3">Visitor Name</th>
              <th className="p-3">Relation</th>
              <th className="p-3">Patient Name</th>
              <th className="p-3">Ward / Room</th>
              <th className="p-3">Entry Time</th>
              <th className="p-3">Exit Time</th>
              <th className="p-3">Pass ID</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
            {state.visitors.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50">
                <td className="p-3 font-[800] text-[#0f172a]">{v.name}</td>
                <td className="p-3 text-[12px]">{v.relation}</td>
                <td className="p-3">{v.patientName}</td>
                <td className="p-3">{v.wardRoom}</td>
                <td className="p-3 text-xs font-[700] text-[#64748b]">{v.entryTime}</td>
                <td className="p-3 text-xs text-[#64748b]">{v.exitTime || "—"}</td>
                <td className="p-3 font-mono text-xs">{v.passId}</td>
                <td className="p-3">
                  <Badge variant={v.status === "Active" ? "success" : "neutral"}>
                    {v.status}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  {v.status === "Active" ? (
                    <button
                      onClick={() => handleCheckOut(v)}
                      className="text-xs text-[#dc2626] font-[700] hover:underline"
                    >
                      Check Out
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Checked Out</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visiting Hours Configuration */}
      <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-4 space-y-3 shadow-sm">
        <div className="border-b border-[#f1f5f9] pb-2">
          <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
            <CalendarClock className="w-4 h-4 text-[#4CAF72]" /> Visiting Hours Schedule Slots
          </h3>
          <p className="text-[11px] text-[#64748b]">Set the default visitor opening slots for each ward classification</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {state.visitingHours.map((hour) => (
            <div key={hour.wardId} className="border border-[#e2e8f0] p-3 rounded-[6px] bg-[#f8fafc] flex justify-between items-center text-[13px] font-[600]">
              <div>
                <p className="text-[#0f172a] font-[700]">{hour.wardName}</p>
                <div className="flex gap-2 items-center mt-2">
                  <input
                    type="time"
                    value={hour.fromTime}
                    onChange={(e) => updateVisitingHours(hour.wardId, e.target.value, hour.toTime)}
                    className="px-1.5 py-0.5 rounded border border-[#e2e8f0] text-[12px] bg-white w-20"
                  />
                  <span className="text-[#94a3b8]">to</span>
                  <input
                    type="time"
                    value={hour.toTime}
                    onChange={(e) => updateVisitingHours(hour.wardId, hour.fromTime, e.target.value)}
                    className="px-1.5 py-0.5 rounded border border-[#e2e8f0] text-[12px] bg-white w-20"
                  />
                </div>
              </div>
              <Badge variant="info" className="self-start">Slot set</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Issue Pass Modal */}
      {passModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setPassModalOpen(false)} />
          <form onSubmit={handleIssuePass} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4 shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">Issue Gate Entry Pass</h3>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Visitor Full Name *</label>
              <Input
                value={newPass.name}
                onChange={(e) => setNewPass({ ...newPass, name: e.target.value })}
                placeholder="e.g. Johnathan Byers"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Contact Number</label>
                <Input
                  value={newPass.contactNumber}
                  onChange={(e) => setNewPass({ ...newPass, contactNumber: e.target.value })}
                  placeholder="e.g. (555) 019-9021"
                />
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Relationship to Patient</label>
                <select
                  value={newPass.relation}
                  onChange={(e) => setNewPass({ ...newPass, relation: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  {relations.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Patient Name *</label>
                <Input
                  value={newPass.patientName}
                  onChange={(e) => setNewPass({ ...newPass, patientName: e.target.value })}
                  placeholder="e.g. James Smith"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Destination Room / Ward</label>
                <Input
                  value={newPass.wardRoom}
                  onChange={(e) => setNewPass({ ...newPass, wardRoom: e.target.value })}
                  placeholder="e.g. General Ward / 201"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Purpose of Visit</label>
              <Input
                value={newPass.purpose}
                onChange={(e) => setNewPass({ ...newPass, purpose: e.target.value })}
                placeholder="e.g. Medical consultation check-in"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setPassModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Issue Pass</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
