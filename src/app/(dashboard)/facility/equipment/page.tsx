"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Search, Filter, Wrench, Calendar, FileText
} from "lucide-react";

export default function EquipmentPage() {
  const router = useRouter();
  const { state, addEquipment } = useFacility();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [maintenanceDueFilter, setMaintenanceDueFilter] = useState(false);

  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEq, setNewEq] = useState({
    id: "",
    name: "",
    type: "Ventilator",
    departmentId: "d1",
    location: "Floor 1, Room 201",
    vendor: "General Medical Corp",
    purchaseDate: new Date().toISOString().split("T")[0],
    warrantyExpiry: new Date(Date.now() + 31536000000).toISOString().split("T")[0], // 1 year out
    amcProvider: "Biomedical Partners Inc.",
    amcExpiry: new Date(Date.now() + 31536000000).toISOString().split("T")[0],
    lastCalibration: new Date().toISOString().split("T")[0],
    maintenanceInterval: "Quarterly" as any,
  });

  const equipmentTypes = [
    "MRI", "CT", "ECG", "Ventilator", "Ultrasound", "X-Ray", "Defibrillator", 
    "Infusion Pump", "Wheelchair", "Hospital Bed", "Other"
  ];

  const uniqueDepartments = useMemo(() => {
    return state.departments;
  }, [state.departments]);

  const uniqueStatuses = ["Active", "Under Repair", "Retired", "In Calibration"];

  // Filtered Equipment List
  const filteredEquipment = useMemo(() => {
    return state.equipment.filter((eq) => {
      // Dept
      if (deptFilter && eq.departmentId !== deptFilter) return false;
      // Status
      if (statusFilter && eq.status !== statusFilter) return false;
      // Type
      if (typeFilter && eq.type !== typeFilter) return false;
      // Maintenance Due (due date is in the past or within 7 days)
      if (maintenanceDueFilter) {
        const nextDueTime = new Date(eq.nextDue).getTime();
        const triggerTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days out
        if (nextDueTime > triggerTime) return false;
      }
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = eq.name.toLowerCase().includes(query);
        const matchesId = eq.id.toLowerCase().includes(query);
        return matchesName || matchesId;
      }
      return true;
    });
  }, [state.equipment, deptFilter, statusFilter, typeFilter, maintenanceDueFilter, searchQuery]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEq.name.trim()) return;

    // Auto generate ID if not specified
    const eqId = newEq.id.trim() || `EQ-${Math.floor(1000 + Math.random() * 9000)}`;

    addEquipment({
      name: newEq.name,
      type: newEq.type,
      departmentId: newEq.departmentId,
      location: newEq.location,
      status: "Active",
      warrantyExpiry: newEq.warrantyExpiry,
      amcProvider: newEq.amcProvider,
      amcExpiry: newEq.amcExpiry,
      lastMaintenance: newEq.lastCalibration,
      nextDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // +90 days
      purchaseDate: newEq.purchaseDate,
      vendor: newEq.vendor,
      lastCalibration: newEq.lastCalibration,
      maintenanceInterval: newEq.maintenanceInterval,
    });

    setAddModalOpen(false);
    setNewEq({
      id: "",
      name: "",
      type: "Ventilator",
      departmentId: "d1",
      location: "Floor 1, Room 201",
      vendor: "General Medical Corp",
      purchaseDate: new Date().toISOString().split("T")[0],
      warrantyExpiry: new Date(Date.now() + 31536000000).toISOString().split("T")[0],
      amcProvider: "Biomedical Partners Inc.",
      amcExpiry: new Date(Date.now() + 31536000000).toISOString().split("T")[0],
      lastCalibration: new Date().toISOString().split("T")[0],
      maintenanceInterval: "Quarterly",
    });
  };

  const getStatusBadge = (status: string) => {
    const maps = {
      Active: "success",
      "Under Repair": "destructive",
      Retired: "neutral",
      "In Calibration": "warning",
    };
    return maps[status as keyof typeof maps] as any || "default";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">Equipment & Asset Management</h2>
          <p className="text-xs text-[#64748b]">Track biomedical instruments, hospital machinery, and warranty contracts</p>
        </div>
        <Button size="sm" onClick={() => setAddModalOpen(true)} className="flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Equipment
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#e2e8f0] p-3 rounded-[6px] flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Equipment ID or Name..."
            className="w-full h-[36px] pl-9 pr-3 rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white text-[13px] outline-none focus:border-[#4CAF72]"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Departments</option>
          {uniqueDepartments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Types</option>
          {equipmentTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Statuses</option>
          {uniqueStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-xs font-[700] text-[#475569] cursor-pointer bg-slate-50 border border-[#e2e8f0] h-[36px] px-3 rounded-[6px]">
          <input
            type="checkbox"
            checked={maintenanceDueFilter}
            onChange={(e) => setMaintenanceDueFilter(e.target.checked)}
            className="rounded text-[#4CAF72] focus:ring-[#4CAF72]"
          />
          Maintenance Due
        </label>
      </div>

      {/* Equipment Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
              <th className="p-3">Equipment ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Department</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              <th className="p-3">Warranty Expiry</th>
              <th className="p-3">AMC Provider</th>
              <th className="p-3">Last Check</th>
              <th className="p-3">Next Due</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
            {filteredEquipment.map((eq) => {
              const dept = state.departments.find((d) => d.id === eq.departmentId);
              return (
                <tr 
                  key={eq.id} 
                  className="hover:bg-slate-50/50 cursor-pointer"
                  onClick={() => router.push(`/facility/equipment/${eq.id}`)}
                >
                  <td className="p-3 font-[800] text-[#0f172a]">{eq.id}</td>
                  <td className="p-3">{eq.name}</td>
                  <td className="p-3">{eq.type}</td>
                  <td className="p-3">{dept?.name || "—"}</td>
                  <td className="p-3">{eq.location}</td>
                  <td className="p-3">
                    <Badge variant={getStatusBadge(eq.status)}>
                      {eq.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-[12px]">{eq.warrantyExpiry}</td>
                  <td className="p-3 text-[12px]">{eq.amcProvider || "—"}</td>
                  <td className="p-3 text-[12px]">{eq.lastMaintenance}</td>
                  <td className="p-3 text-[12px] font-[700]">{eq.nextDue}</td>
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => router.push(`/facility/equipment/${eq.id}`)}
                      className="text-xs text-[#4CAF72] font-[700] hover:underline"
                    >
                      Configure
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Equipment Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setAddModalOpen(false)} />
          <form onSubmit={handleAddSubmit} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-lg w-full relative z-10 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">Add New Equipment</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Equipment ID (Optional)</label>
                <Input
                  value={newEq.id}
                  onChange={(e) => setNewEq({ ...newEq, id: e.target.value })}
                  placeholder="Leave blank for auto-generation"
                />
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Equipment Name *</label>
                <Input
                  value={newEq.name}
                  onChange={(e) => setNewEq({ ...newEq, name: e.target.value })}
                  placeholder="e.g. Siemens MRI Scanner"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Type</label>
                <select
                  value={newEq.type}
                  onChange={(e) => setNewEq({ ...newEq, type: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  {equipmentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Department</label>
                <select
                  value={newEq.departmentId}
                  onChange={(e) => setNewEq({ ...newEq, departmentId: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  {uniqueDepartments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Current Location (Floor/Room)</label>
                <Input
                  value={newEq.location}
                  onChange={(e) => setNewEq({ ...newEq, location: e.target.value })}
                  placeholder="e.g. Block A, Floor 2, Room 301"
                />
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Vendor / Provider</label>
                <Input
                  value={newEq.vendor}
                  onChange={(e) => setNewEq({ ...newEq, vendor: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={newEq.purchaseDate}
                  onChange={(e) => setNewEq({ ...newEq, purchaseDate: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] px-2 text-[13px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Warranty Expiry Date</label>
                <input
                  type="date"
                  value={newEq.warrantyExpiry}
                  onChange={(e) => setNewEq({ ...newEq, warrantyExpiry: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] px-2 text-[13px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">AMC Provider</label>
                <Input
                  value={newEq.amcProvider}
                  onChange={(e) => setNewEq({ ...newEq, amcProvider: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Calibration Interval</label>
                <select
                  value={newEq.maintenanceInterval}
                  onChange={(e: any) => setNewEq({ ...newEq, maintenanceInterval: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Last Calibration Date</label>
                <input
                  type="date"
                  value={newEq.lastCalibration}
                  onChange={(e) => setNewEq({ ...newEq, lastCalibration: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border-[#e2e8f0] px-2 text-[13px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Add Asset</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
