"use client";

import React, { useState, useMemo } from "react";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, AlertTriangle, AlertCircle, CheckCircle, Flame, ShieldAlert, Cpu
} from "lucide-react";

export default function ICUManagementPage() {
  const { state } = useFacility();
  const [activeTab, setActiveTab] = useState<string>("Medical ICU");

  const icuTabs = [
    "Medical ICU", "Surgical ICU", "Cardiac ICU", "NICU", "PICU", "Burn ICU", "COVID ICU"
  ];

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

  // Filter beds for the active ICU type
  const activeICUBeds = useMemo(() => {
    return state.beds.filter((b) => {
      // Find room
      const room = state.rooms.find((r) => r.id === b.roomId);
      if (!room) return false;

      // Map activeTab to room types & notes
      if (activeTab === "NICU") return room.type === "NICU" || b.name.includes("NICU");
      if (activeTab === "PICU") return room.type === "PICU" || b.name.includes("PICU");
      
      // ICU Room types
      if (room.type === "ICU" || b.name.startsWith("ICU")) {
        if (activeTab === "Medical ICU") return room.notes?.includes("Medical") || b.id.charCodeAt(0) % 2 === 0;
        if (activeTab === "Surgical ICU") return b.id.charCodeAt(0) % 3 === 0;
        if (activeTab === "Cardiac ICU") return b.id.charCodeAt(0) % 4 === 0;
        if (activeTab === "Burn ICU") return b.id.charCodeAt(0) % 5 === 0;
        if (activeTab === "COVID ICU") return b.id.charCodeAt(0) % 6 === 0;
      }

      return false;
    });
  }, [state.beds, state.rooms, activeTab]);

  const occupancyStats = useMemo(() => {
    const total = activeICUBeds.length;
    const occupied = activeICUBeds.filter((b) => b.status === "occupied").length;
    const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, pct };
  }, [activeICUBeds]);

  // Critical equipment assigned to this ICU unit
  const unitEquipment = useMemo(() => {
    // Find all equipment matching department ICU ('d3') or general biomedical equipment
    const criticalTypes = ["Ventilator", "Patient Monitor", "Infusion Pump", "Defibrillator", "Syringe Pump", "Oximeter"];
    return state.equipment.filter((eq) => {
      const isCriticalType = criticalTypes.includes(eq.type);
      const isICU = eq.departmentId === "d3" || eq.location.includes("ICU");
      // Distribute to activeTab based on location/name
      if (activeTab === "NICU") return isCriticalType && (eq.location.includes("NICU") || eq.name.includes("Newborn"));
      if (activeTab === "Medical ICU") return isCriticalType && isICU && !eq.location.includes("NICU") && eq.id.charCodeAt(3) % 2 === 0;
      return isCriticalType && isICU && !eq.location.includes("NICU");
    });
  }, [state.equipment, activeTab]);

  // Alerts calculations
  const alerts = useMemo(() => {
    const list = [];
    
    // 1. Capacity warnings
    if (occupancyStats.pct >= 90) {
      list.push({ type: "high", text: `⚠ ${activeTab} is at ${occupancyStats.pct}% capacity (${occupancyStats.occupied}/${occupancyStats.total} beds occupied)` });
    } else if (occupancyStats.pct >= 75) {
      list.push({ type: "medium", text: `⚠ ${activeTab} at ${occupancyStats.pct}% capacity` });
    }

    // 2. Calibration warnings
    const calibrationNeeded = unitEquipment.filter(e => e.status === "In Calibration").length;
    if (calibrationNeeded > 0) {
      list.push({ type: "high", text: `⚠ ${calibrationNeeded} ventilator(s)/pump(s) in ${activeTab} due for calibration` });
    }

    return list;
  }, [occupancyStats, unitEquipment, activeTab]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">ICU Management Dashboard</h2>
        <p className="text-xs text-[#64748b]">Real-time ICU ward status, alerts, and critical care diagnostics</p>
      </div>

      {/* Alert Strip */}
      {alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={`text-xs px-4 py-2 rounded-[6px] border flex items-center gap-2 font-[600] ${
                alert.type === "high" 
                  ? "bg-[#fef2f2] border-[#fecaca] text-[#dc2626]" 
                  : "bg-[#fffbeb] border-[#fef3c7] text-[#b45309]"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{alert.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ICU Type Tabs */}
      <div className="flex border-b border-[#e2e8f0] bg-white rounded-t-[6px] p-1.5 gap-1">
        {icuTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-[4px] text-[13px] font-[700] uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-[#f0fdf4] text-[#16a34a] border-b-2 border-[#22c55e]"
                  : "text-[#64748b] hover:text-[#0f172a] hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Contents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left/Middle panel: ICU Live Bed Grid */}
        <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-[6px] p-4 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2">
            <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider">Live Bed status map</h3>
            <div className="flex items-center gap-2 text-xs font-[600] text-[#64748b]">
              <span>Occupancy:</span>
              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#9C27B0] h-full" style={{ width: `${occupancyStats.pct}%` }} />
              </div>
              <span>{occupancyStats.occupied} / {occupancyStats.total} ({occupancyStats.pct}%)</span>
            </div>
          </div>

          {activeICUBeds.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-[#e2e8f0] rounded-[6px] text-xs text-[#94a3b8] italic">
              No beds assigned to this ICU type. Configure ICU rooms in Layout Manager first.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {activeICUBeds.map((bed) => {
                const config = statusColors[bed.status] || statusColors.available;
                return (
                  <div
                    key={bed.id}
                    className={`bg-white border border-[#e2e8f0] p-3 rounded-[6px] shadow-sm flex flex-col justify-between h-[85px]`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[12px] font-[800] text-[#0f172a] truncate">{bed.name}</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.dot }} />
                    </div>
                    <div className="text-[11px] font-[700] text-[#64748b] truncate mt-1">
                      {bed.patientName || "—"}
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider font-[800] px-1.5 py-0.5 rounded-[4px] mt-2 self-start ${config.bg} ${config.text} border ${config.border}`}>
                      {statusLabels[bed.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right panel: Critical Equipment Panel */}
        <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-4 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2">
            <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#4CAF72]" /> Critical Equipment
            </h3>
            <span className="text-[10px] uppercase font-[700] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-[4px]">
              {unitEquipment.length} Devices
            </span>
          </div>

          <div className="space-y-3">
            {unitEquipment.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#94a3b8] italic">
                No active critical devices mapped to this ICU ward.
              </div>
            ) : (
              <div className="divide-y divide-[#e2e8f0] border border-[#e2e8f0] rounded-[6px] overflow-hidden">
                {unitEquipment.map((eq) => {
                  return (
                    <div key={eq.id} className="p-3 bg-[#f8fafc]/50 hover:bg-slate-50 flex justify-between items-center text-[12px] font-[600]">
                      <div>
                        <p className="text-[#0f172a] font-[700]">{eq.name}</p>
                        <p className="text-[10px] text-[#64748b] font-[500]">ID: {eq.id} • Type: {eq.type}</p>
                        <p className="text-[9px] text-[#94a3b8] mt-1 font-[700] uppercase tracking-wider">Checked: {eq.lastMaintenance}</p>
                      </div>
                      <Badge variant={eq.status === "Active" ? "success" : eq.status === "In Calibration" ? "warning" : "destructive"}>
                        {eq.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
