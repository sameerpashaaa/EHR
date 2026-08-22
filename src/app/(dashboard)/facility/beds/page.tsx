"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Search, List, Grid, X, Save, RefreshCw, AlertTriangle
} from "lucide-react";

export default function BedManagementPage() {
  const { state, updateBed, addBed, removeBed } = useFacility();
  const searchParams = useSearchParams();
  const initialWardFilter = searchParams.get("wardId") || "";

  // View States
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [wardFilter, setWardFilter] = useState(initialWardFilter);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  // Selected Bed for Detail Drawer
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  
  // Add Bed Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newBedForm, setNewBedForm] = useState({
    name: "",
    roomId: "",
    status: "available" as any,
    wardId: "",
    cleaningStatus: "Clean" as any,
    equipmentAttached: [] as string[],
    nurseId: "",
    doctorId: "",
    notes: "",
  });

  const [addBedErrors, setAddBedErrors] = useState<Record<string, string>>({});

  // Status color codes
  const statusColors = {
    available: { bg: "bg-[#e8f5e9]", text: "text-[#2e7d32]", border: "border-[#c8e6c9]", dot: "#4CAF72" },
    reserved: { bg: "bg-[#e3f2fd]", text: "text-[#1565c0]", border: "border-[#bbdefb]", dot: "#2196F3" },
    cleaning: { bg: "bg-[#fff3e0]", text: "text-[#ef6c00]", border: "border-[#ffe0b2]", dot: "#FF9800" },
    occupied: { bg: "bg-[#ffebee]", text: "text-[#c62828]", border: "border-[#ffcdd2]", dot: "#F44336" },
    maintenance: { bg: "bg-[#efebe9]", text: "text-[#4e342e]", border: "border-[#d7ccc8]", dot: "#757575" },
    isolation: { bg: "bg-[#f3e5f5]", text: "text-[#6a1b9a]", border: "border-[#e1bee7]", dot: "#9C27B0" },
  };

  const statusLabels = {
    available: "Available",
    reserved: "Reserved",
    cleaning: "Cleaning",
    occupied: "Occupied",
    maintenance: "Maintenance",
    isolation: "Isolation",
  };

  // Summaries
  const totalBeds = state.beds.length;
  const availableBeds = state.beds.filter((b) => b.status === "available").length;
  const occupiedBeds = state.beds.filter((b) => b.status === "occupied").length;
  const reservedBeds = state.beds.filter((b) => b.status === "reserved").length;
  const cleaningBeds = state.beds.filter((b) => b.status === "cleaning").length;
  const maintenanceBeds = state.beds.filter((b) => b.status === "maintenance").length;
  const isolationBeds = state.beds.filter((b) => b.status === "isolation").length;

  // Selected Bed details for drawer
  const selectedBed = useMemo(() => {
    return state.beds.find((b) => b.id === selectedBedId) || null;
  }, [state.beds, selectedBedId]);

  // For editable fields in drawer
  const [drawerForm, setDrawerForm] = useState<any>(null);

  React.useEffect(() => {
    if (selectedBed) {
      setDrawerForm({
        status: selectedBed.status,
        patientName: selectedBed.patientName || "",
        cleaningStatus: selectedBed.cleaningStatus,
        equipmentAttached: selectedBed.equipmentAttached,
        nurseId: selectedBed.nurseId || "",
        doctorId: selectedBed.doctorId || "",
        notes: selectedBed.notes || "",
      });
    } else {
      setDrawerForm(null);
    }
  }, [selectedBed]);

  // Unique floors/ward/roomtypes/depts for dropdowns
  const uniqueFloors = useMemo(() => {
    return Array.from(new Set(state.rooms.map((r) => r.floor)));
  }, [state.rooms]);

  const uniqueRoomTypes = useMemo(() => {
    return Array.from(new Set(state.rooms.map((r) => r.type)));
  }, [state.rooms]);

  // Filtered beds
  const filteredBeds = useMemo(() => {
    return state.beds.filter((b) => {
      // Find room details
      const room = state.rooms.find((r) => r.id === b.roomId);
      if (!room) return false;

      // Floor filter
      if (floorFilter && room.floor !== floorFilter) return false;
      // Ward filter
      if (wardFilter && b.wardId !== wardFilter) return false;
      // Room Type filter
      if (typeFilter && room.type !== typeFilter) return false;
      // Status filter
      if (statusFilter && b.status !== statusFilter) return false;
      // Dept filter
      if (deptFilter && room.departmentId !== deptFilter) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = b.name.toLowerCase().includes(query);
        const matchesPatient = b.patientName?.toLowerCase().includes(query) || false;
        return matchesName || matchesPatient;
      }

      return true;
    });
  }, [state.beds, state.rooms, floorFilter, wardFilter, typeFilter, statusFilter, deptFilter, searchQuery]);

  const handleSaveDrawer = () => {
    if (!selectedBed || !drawerForm) return;
    updateBed({
      ...selectedBed,
      status: drawerForm.status,
      patientName: drawerForm.status === "occupied" ? drawerForm.patientName : undefined,
      cleaningStatus: drawerForm.cleaningStatus,
      equipmentAttached: drawerForm.equipmentAttached,
      nurseId: drawerForm.nurseId || undefined,
      doctorId: drawerForm.doctorId || undefined,
      notes: drawerForm.notes,
    });
    setSelectedBedId(null);
  };

  const handleAddBed = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newBedForm.name.trim()) errs.name = "Bed ID is required.";
    if (!newBedForm.roomId) errs.roomId = "Room is required.";
    
    // Find room to assign ward details
    const room = state.rooms.find((r) => r.id === newBedForm.roomId);
    if (!room) errs.roomId = "Invalid room selected.";

    if (Object.keys(errs).length > 0) {
      setAddBedErrors(errs);
      return;
    }

    addBed({
      name: newBedForm.name,
      roomId: newBedForm.roomId,
      status: newBedForm.status,
      patientName: newBedForm.status === "occupied" ? "New Patient" : undefined,
      wardId: room!.wardId,
      cleaningStatus: newBedForm.cleaningStatus,
      equipmentAttached: newBedForm.equipmentAttached,
      nurseId: newBedForm.nurseId || undefined,
      doctorId: newBedForm.doctorId || undefined,
      notes: newBedForm.notes,
    });

    setAddModalOpen(false);
    setNewBedForm({
      name: "",
      roomId: "",
      status: "available",
      wardId: "",
      cleaningStatus: "Clean",
      equipmentAttached: [],
      nurseId: "",
      doctorId: "",
      notes: "",
    });
    setAddBedErrors({});
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">Bed Management</h2>
          <p className="text-xs text-[#64748b]">Track, assign, and manage hospital bed allocations</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-[#e2e8f0] rounded-[6px] p-0.5 bg-white">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-[4px] ${viewMode === "grid" ? "bg-[#f0fdf4] text-[#16a34a]" : "text-[#64748b] hover:text-[#0f172a]"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-[4px] ${viewMode === "list" ? "bg-[#f0fdf4] text-[#16a34a]" : "text-[#64748b] hover:text-[#0f172a]"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button size="sm" onClick={() => setAddModalOpen(true)} className="flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Bed
          </Button>
        </div>
      </div>

      {/* Stats Chips Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total Beds", count: totalBeds, status: "normal" },
          { label: "Available", count: availableBeds, status: "available" },
          { label: "Occupied", count: occupiedBeds, status: "occupied" },
          { label: "Reserved", count: reservedBeds, status: "reserved" },
          { label: "Cleaning", count: cleaningBeds, status: "cleaning" },
          { label: "Maintenance", count: maintenanceBeds, status: "maintenance" },
          { label: "Isolation", count: isolationBeds, status: "isolation" },
        ].map((s, idx) => {
          const config = s.status === "normal" ? { bg: "bg-white", text: "text-[#0f172a]", border: "border-[#e2e8f0]", dot: "#0f172a" } : statusColors[s.status as keyof typeof statusColors];
          return (
            <div key={idx} className={`bg-white border ${config.border} p-3 rounded-[6px] shadow-sm flex flex-col justify-between`}>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.dot }} />
                <span className="text-[10px] uppercase font-[800] text-[#64748b] tracking-wider leading-none">{s.label}</span>
              </div>
              <span className="text-xl font-[800] text-[#0f172a] mt-2 block">{s.count}</span>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#e2e8f0] p-3 rounded-[6px] flex flex-wrap gap-2 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Bed ID or Patient name..."
            className="w-full h-[36px] pl-9 pr-3 rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white text-[13px] outline-none focus:border-[#4CAF72]"
          />
        </div>

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

        <select
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Wards</option>
          {state.wards.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Room Types</option>
          {uniqueRoomTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Statuses</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-[36px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-2.5 text-[13px] outline-none"
        >
          <option value="">All Depts</option>
          {state.departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        {(searchQuery || floorFilter || wardFilter || typeFilter || statusFilter || deptFilter) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setFloorFilter("");
              setWardFilter("");
              setTypeFilter("");
              setStatusFilter("");
              setDeptFilter("");
            }}
            className="text-xs text-[#dc2626] font-[600] hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredBeds.map((bed) => {
            const config = statusColors[bed.status] || statusColors.available;
            const ward = state.wards.find((w) => w.id === bed.wardId);
            return (
              <div
                key={bed.id}
                onClick={() => setSelectedBedId(bed.id)}
                className={`bg-white border border-[#e2e8f0] hover:border-[#4CAF72] p-2.5 rounded-[6px] shadow-sm cursor-pointer transition-all flex flex-col justify-between h-[85px] active:scale-95`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[12px] font-[800] text-[#0f172a] truncate">{bed.name}</span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.dot }} />
                </div>
                <div className="text-[11px] font-[700] text-[#64748b] truncate mt-1">
                  {bed.patientName || "—"}
                </div>
                <div className="text-[9px] uppercase tracking-wider font-[700] text-[#94a3b8] mt-2 truncate">
                  {ward?.name || "Ward"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
                <th className="p-3">Bed ID</th>
                <th className="p-3">Floor</th>
                <th className="p-3">Ward</th>
                <th className="p-3">Room</th>
                <th className="p-3">Status</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Nurse</th>
                <th className="p-3">Doctor</th>
                <th className="p-3">Cleaning</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
              {filteredBeds.map((bed) => {
                const config = statusColors[bed.status] || statusColors.available;
                const room = state.rooms.find((r) => r.id === bed.roomId);
                const ward = state.wards.find((w) => w.id === bed.wardId);
                const assignedNurse = state.staff.find((s) => s.id === bed.nurseId);
                const assignedDoctor = state.staff.find((s) => s.id === bed.doctorId);
                return (
                  <tr key={bed.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-[800] text-[#0f172a]">{bed.name}</td>
                    <td className="p-3">{room?.floor || "—"}</td>
                    <td className="p-3">{ward?.name || "—"}</td>
                    <td className="p-3">{room?.name || "—"}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[10px] uppercase font-[800] ${config.bg} ${config.text} border ${config.border}`}>
                        {statusLabels[bed.status]}
                      </span>
                    </td>
                    <td className="p-3">{bed.patientName || "—"}</td>
                    <td className="p-3">{assignedNurse?.name || "—"}</td>
                    <td className="p-3">{assignedDoctor?.name || "—"}</td>
                    <td className="p-3">
                      <Badge variant={bed.cleaningStatus === "Clean" ? "success" : bed.cleaningStatus === "In Progress" ? "warning" : "destructive"}>
                        {bed.cleaningStatus}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedBedId(bed.id)}
                        className="text-xs text-[#4CAF72] font-[700] hover:underline mr-3"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => removeBed(bed.id)}
                        className="text-xs text-red-500 font-[700] hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bed Detail Drawer (slide-in from right) */}
      {selectedBed && drawerForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelectedBedId(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-5 z-10 flex flex-col justify-between border-l border-[#e2e8f0]">
            <div className="space-y-4 overflow-y-auto max-h-[85vh]">
              <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
                <div>
                  <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider">Bed Detail Drawer</h3>
                  <p className="text-[11px] text-[#64748b]">Configure bed parameters & clinical assignment</p>
                </div>
                <button onClick={() => setSelectedBedId(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[13px] font-[600] text-[#475569] bg-slate-50 p-3 rounded-[6px] border border-[#e2e8f0]">
                <div>
                  <span className="text-[10px] uppercase font-[700] text-[#94a3b8] block">Bed ID</span>
                  <span className="text-[#0f172a] font-[800]">{selectedBed.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-[700] text-[#94a3b8] block">Ward / Floor</span>
                  <span className="text-[#0f172a]">
                    {state.wards.find((w) => w.id === selectedBed.wardId)?.name || "Ward"} / 
                    {state.rooms.find((r) => r.id === selectedBed.roomId)?.floor || "Floor"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={drawerForm.status}
                    onChange={(e: any) => setDrawerForm({ ...drawerForm, status: e.target.value })}
                    className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
                  >
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                {drawerForm.status === "occupied" && (
                  <div>
                    <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Assigned Patient Name</label>
                    <Input
                      value={drawerForm.patientName}
                      onChange={(e) => setDrawerForm({ ...drawerForm, patientName: e.target.value })}
                      placeholder="Search or enter patient name..."
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Cleaning Status</label>
                  <select
                    value={drawerForm.cleaningStatus}
                    onChange={(e: any) => setDrawerForm({ ...drawerForm, cleaningStatus: e.target.value })}
                    className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
                  >
                    <option value="Clean">Clean</option>
                    <option value="Dirty">Dirty</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Equipment Attached</label>
                  <div className="grid grid-cols-2 gap-2 p-2 border border-[#e2e8f0] rounded-[6px] bg-white">
                    {["Ventilator", "Patient Monitor", "Infusion Pump", "Oxygen", "Suction"].map((item) => {
                      const attached = drawerForm.equipmentAttached.includes(item);
                      return (
                        <label key={item} className="flex items-center gap-2 text-[12px] font-[600] text-[#475569] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attached}
                            onChange={(e) => {
                              const list = e.target.checked
                                ? [...drawerForm.equipmentAttached, item]
                                : drawerForm.equipmentAttached.filter((x: any) => x !== item);
                              setDrawerForm({ ...drawerForm, equipmentAttached: list });
                            }}
                            className="rounded text-[#4CAF72] focus:ring-[#4CAF72]"
                          />
                          {item}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Assigned Nurse</label>
                  <select
                    value={drawerForm.nurseId}
                    onChange={(e) => setDrawerForm({ ...drawerForm, nurseId: e.target.value })}
                    className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
                  >
                    <option value="">Select Nurse...</option>
                    {state.staff.filter(s => s.role === "Nurse").map((n) => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Assigned Doctor</label>
                  <select
                    value={drawerForm.doctorId}
                    onChange={(e) => setDrawerForm({ ...drawerForm, doctorId: e.target.value })}
                    className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
                  >
                    <option value="">Select Doctor...</option>
                    {state.staff.filter(s => s.role === "Doctor").map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Notes</label>
                  <textarea
                    value={drawerForm.notes}
                    onChange={(e) => setDrawerForm({ ...drawerForm, notes: e.target.value })}
                    rows={3}
                    placeholder="Enter any notes, issue logs or maintenance schedules..."
                    className="w-full rounded-[6px] border border-[#e2e8f0] bg-white p-2.5 text-[13px] focus:outline-none focus:border-[#4CAF72]"
                  />
                </div>

                <div className="text-[10px] text-[#94a3b8] font-[700] uppercase tracking-wider">
                  Last Updated: {new Date(selectedBed.lastUpdated).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-[#f1f5f9] mt-4">
              <Button onClick={handleSaveDrawer} className="flex-1 flex items-center justify-center gap-1.5">
                <Save className="w-4 h-4" /> Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setDrawerForm({ ...drawerForm, cleaningStatus: "In Progress", status: "cleaning" })}
                className="flex items-center gap-1 text-[#ef6c00] border-[#ffe0b2] hover:bg-[#fff3e0]"
              >
                <RefreshCw className="w-4 h-4" /> Mark Clean
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bed Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setAddModalOpen(false)} />
          <form onSubmit={handleAddBed} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4 shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">Add New Bed</h3>
            
            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Bed ID / Name *</label>
              <Input
                value={newBedForm.name}
                onChange={(e) => setNewBedForm({ ...newBedForm, name: e.target.value })}
                placeholder="e.g. ICU-01-C or BED-201-C"
                required
              />
              {addBedErrors.name && <span className="text-[11px] text-red-500 font-bold block">{addBedErrors.name}</span>}
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Assign Room *</label>
              <select
                value={newBedForm.roomId}
                onChange={(e) => setNewBedForm({ ...newBedForm, roomId: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
                required
              >
                <option value="">Select Room...</option>
                {state.rooms.map((r) => {
                  const wardName = state.wards.find(w => w.id === r.wardId)?.name || "General";
                  return (
                    <option key={r.id} value={r.id}>
                      Room {r.name} ({r.type} - {wardName} Floor {r.floor})
                    </option>
                  );
                })}
              </select>
              {addBedErrors.roomId && <span className="text-[11px] text-red-500 font-bold block">{addBedErrors.roomId}</span>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Initial Status</label>
                <select
                  value={newBedForm.status}
                  onChange={(e: any) => setNewBedForm({ ...newBedForm, status: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Cleaning Status</label>
                <select
                  value={newBedForm.cleaningStatus}
                  onChange={(e: any) => setNewBedForm({ ...newBedForm, cleaningStatus: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  <option value="Clean">Clean</option>
                  <option value="Dirty">Dirty</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Assigned Nurse</label>
              <select
                value={newBedForm.nurseId}
                onChange={(e) => setNewBedForm({ ...newBedForm, nurseId: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
              >
                <option value="">Select Nurse...</option>
                {state.staff.filter(s => s.role === "Nurse").map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Add Bed</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
