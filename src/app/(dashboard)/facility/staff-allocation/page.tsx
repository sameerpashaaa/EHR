"use client";

import React, { useState, useMemo } from "react";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Users, Calendar, Clock, MapPin, UserCheck, Shield
} from "lucide-react";

export default function StaffAllocationPage() {
  const { state, addStaff, updateStaff } = useFacility();
  const [viewMode, setViewMode] = useState<"table" | "matrix">("table");

  // Filters
  const [deptFilter, setDeptFilter] = useState("");
  const [shiftFilter, setShiftFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");

  // Allocate Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [allocForm, setAllocForm] = useState({
    staffId: "",
    departmentId: "d1",
    floor: "Ground",
    wardId: "w1",
    shift: "Morning" as any,
    effectiveDate: new Date().toISOString().split("T")[0],
  });

  const roles = [
    "Doctor", "Nurse", "Technician", "Housekeeping", "Receptionist", "Security", 
    "Maintenance", "Pharmacist"
  ];

  const shifts = ["Morning", "Afternoon", "Night"];

  // Unique floors from layout data
  const uniqueFloors = useMemo(() => {
    return Array.from(new Set(state.rooms.map((r) => r.floor)));
  }, [state.rooms]);

  const filteredWards = useMemo(() => {
    if (!allocForm.floor) return [];
    const roomsOnFloor = state.rooms.filter((r) => r.floor === allocForm.floor);
    const wardIds = Array.from(new Set(roomsOnFloor.map((r) => r.wardId)));
    return state.wards.filter((w) => wardIds.includes(w.id));
  }, [state.rooms, state.wards, allocForm.floor]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return state.staff.filter((s) => {
      if (deptFilter && s.departmentId !== deptFilter) return false;
      if (shiftFilter && s.shift !== shiftFilter) return false;
      if (roleFilter && s.role !== roleFilter) return false;
      if (floorFilter && s.floor !== floorFilter) return false;
      return true;
    });
  }, [state.staff, deptFilter, shiftFilter, roleFilter, floorFilter]);

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocForm.staffId) return;

    // Find the staff member
    const staffMember = state.staff.find((s) => s.id === allocForm.staffId);
    if (!staffMember) return;

    // Update their allocation
    updateStaff({
      ...staffMember,
      departmentId: allocForm.departmentId,
      floor: allocForm.floor,
      wardId: allocForm.wardId,
      shift: allocForm.shift,
      status: "On Duty",
    });

    setModalOpen(false);
    setAllocForm({
      staffId: "",
      departmentId: "d1",
      floor: "Ground",
      wardId: "w1",
      shift: "Morning",
      effectiveDate: new Date().toISOString().split("T")[0],
    });
  };

  const getStatusBadge = (status: string) => {
    const maps = {
      "On Duty": "success",
      "Off Duty": "neutral",
      "On Leave": "warning",
    };
    return maps[status as keyof typeof maps] as any || "default";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">Staff Shift Allocations</h2>
          <p className="text-xs text-[#64748b]">Configure floor rosters, physician schedules, and ward nurse allocations</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-[#e2e8f0] rounded-[6px] p-0.5 bg-white">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-[700] uppercase tracking-wider ${viewMode === "table" ? "bg-[#f0fdf4] text-[#16a34a]" : "text-[#64748b] hover:text-[#0f172a]"}`}
            >
              Roster Table
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-[700] uppercase tracking-wider ${viewMode === "matrix" ? "bg-[#f0fdf4] text-[#16a34a]" : "text-[#64748b] hover:text-[#0f172a]"}`}
            >
              Shift Matrix
            </button>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)} className="flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Allocate Staff
          </Button>
        </div>
      </div>

      {/* Roster Filters */}
      <div className="bg-white border border-[#e2e8f0] p-3 rounded-[6px] flex flex-wrap gap-2 items-center">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Departments</option>
          {state.departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={shiftFilter}
          onChange={(e) => setShiftFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Shifts</option>
          {shifts.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={floorFilter}
          onChange={(e) => setFloorFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Floors</option>
          {uniqueFloors.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {(deptFilter || shiftFilter || roleFilter || floorFilter) && (
          <button
            onClick={() => {
              setDeptFilter("");
              setShiftFilter("");
              setRoleFilter("");
              setFloorFilter("");
            }}
            className="text-xs text-[#dc2626] font-[600] hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {viewMode === "table" ? (
        /* ALLOCATION TABLE */
        <div className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
                <th className="p-3">Staff Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Department</th>
                <th className="p-3">Floor</th>
                <th className="p-3">Ward</th>
                <th className="p-3">Shift</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
              {filteredStaff.map((staffMember) => {
                const dept = state.departments.find((d) => d.id === staffMember.departmentId);
                const ward = state.wards.find((w) => w.id === staffMember.wardId);
                return (
                  <tr key={staffMember.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-[800] text-[#0f172a] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#4CAF72]" /> {staffMember.name}
                    </td>
                    <td className="p-3 text-[12px]">{staffMember.role}</td>
                    <td className="p-3">{dept?.name || "—"}</td>
                    <td className="p-3">{staffMember.floor || "—"}</td>
                    <td className="p-3">{ward?.name || "—"}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded-[4px] font-[700]">
                        {staffMember.shift}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant={getStatusBadge(staffMember.status)}>{staffMember.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* SHIFT VIEW MATRIX */
        <div className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
                <th className="p-3">Staff Member</th>
                <th className="p-3">Role</th>
                {shifts.map((s) => (
                  <th key={s} className="p-3">{s} Shift</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
              {state.staff.map((staffMember) => {
                const dept = state.departments.find((d) => d.id === staffMember.departmentId);
                const ward = state.wards.find((w) => w.id === staffMember.wardId);
                
                return (
                  <tr key={staffMember.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-[800] text-[#0f172a]">{staffMember.name}</td>
                    <td className="p-3 text-[12px]">{staffMember.role}</td>
                    {shifts.map((s) => {
                      const isAssignedToThisShift = staffMember.shift === s && staffMember.status === "On Duty";
                      return (
                        <td key={s} className="p-3">
                          {isAssignedToThisShift ? (
                            <div className="bg-[#f0fdf4] border border-[#dcfce7] p-2 rounded-[4px] text-[11px] font-[700] text-[#16a34a] space-y-0.5">
                              <p className="flex items-center gap-1"><Shield className="w-3 h-3" /> {dept?.name}</p>
                              <p className="text-[10px] text-[#64748b] flex items-center gap-1"><MapPin className="w-3 h-3" /> {staffMember.floor} / {ward?.name}</p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#94a3b8] italic">Off</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Allocate Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <form onSubmit={handleAllocateSubmit} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4 shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">Allocate Staff Roster</h3>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Select Staff Member *</label>
              <select
                value={allocForm.staffId}
                onChange={(e) => setAllocForm({ ...allocForm, staffId: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
                required
              >
                <option value="">Choose Staff...</option>
                {state.staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Department</label>
                <select
                  value={allocForm.departmentId}
                  onChange={(e) => setAllocForm({ ...allocForm, departmentId: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  {state.departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Shift</label>
                <select
                  value={allocForm.shift}
                  onChange={(e: any) => setAllocForm({ ...allocForm, shift: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  {shifts.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Floor Level</label>
                <select
                  value={allocForm.floor}
                  onChange={(e) => setAllocForm({ ...allocForm, floor: e.target.value, wardId: "" })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  {uniqueFloors.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Ward Assignment</label>
                <select
                  value={allocForm.wardId}
                  onChange={(e) => setAllocForm({ ...allocForm, wardId: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                  disabled={!allocForm.floor}
                >
                  <option value="">Choose Ward...</option>
                  {filteredWards.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Effective Date</label>
              <input
                type="date"
                value={allocForm.effectiveDate}
                onChange={(e) => setAllocForm({ ...allocForm, effectiveDate: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] px-2.5 text-[13px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Allocate Shift</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
