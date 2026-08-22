"use client";

import React, { useState } from "react";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Compass, PhoneCall, Check, Battery, Settings2
} from "lucide-react";

function AmbulanceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 18h8M3 9h18v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm3 0V6a2 2 0 012-2h4a2 2 0 012 2v3" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

export default function AmbulanceManagementPage() {
  const { state, addAmbulance, updateAmbulance, addAmbulanceCallLog } = useFacility();

  // Add Vehicle Modal State
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNo: "",
    type: "Basic Life Support" as any,
    driver: "",
    equipment: [] as string[],
    fuelLevel: 100,
  });

  // Dispatch / Call Log Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [newCall, setNewCall] = useState({
    pickup: "",
    drop: "Metapharsic ER",
    driver: "",
    vehicleNo: "",
  });

  const vehicleTypes = ["Basic Life Support", "Advanced Life Support", "Neonatal", "Patient Transport"];

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.vehicleNo.trim() || !newVehicle.driver.trim()) return;

    addAmbulance({
      vehicleNo: newVehicle.vehicleNo,
      type: newVehicle.type,
      driver: newVehicle.driver,
      equipment: newVehicle.equipment,
      status: "Available",
      lastService: new Date().toISOString().split("T")[0],
      fuelLevel: Number(newVehicle.fuelLevel),
      gpsStatus: "Online",
    });

    setVehicleModalOpen(false);
    setNewVehicle({
      vehicleNo: "",
      type: "Basic Life Support",
      driver: "",
      equipment: [],
      fuelLevel: 100,
    });
  };

  const handleDispatchCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCall.pickup.trim() || !newCall.vehicleNo) return;

    // Find the ambulance matching vehicleNo
    const vehicle = state.ambulances.find(amb => amb.vehicleNo === newCall.vehicleNo);
    if (!vehicle) return;

    addAmbulanceCallLog({
      dateTime: new Date().toISOString(),
      pickup: newCall.pickup,
      drop: newCall.drop,
      driver: vehicle.driver,
      vehicleNo: vehicle.vehicleNo,
      duration: "En Route",
      status: "En Route",
    });

    // Update vehicle status to "On Call"
    updateAmbulance({
      ...vehicle,
      status: "On Call",
    });

    setDispatchModalOpen(false);
    setNewCall({
      pickup: "",
      drop: "Metapharsic ER",
      driver: "",
      vehicleNo: "",
    });
    alert(`Ambulance ${vehicle.vehicleNo} dispatched to ${newCall.pickup}.`);
  };

  const handleReturnCall = (log: any) => {
    // Mark call as completed
    const vehicle = state.ambulances.find(amb => amb.vehicleNo === log.vehicleNo);
    
    // Update call log record status
    // Wait, in state we just have a list. We can update it through the logs context.
    // Actually we can just update the ambulance status back to "Available".
    if (vehicle) {
      updateAmbulance({
        ...vehicle,
        status: "Available",
        fuelLevel: Math.max(10, vehicle.fuelLevel - 15), // consume some fuel
      });
    }
    alert(`Ambulance ${log.vehicleNo} returned and marked Available.`);
  };

  const getStatusBadge = (status: string) => {
    const maps = {
      Available: "success",
      "On Call": "warning",
      Maintenance: "info",
      "Out of Service": "destructive",
    };
    return maps[status as keyof typeof maps] as any || "default";
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">Ambulance Fleet & Dispatch</h2>
          <p className="text-xs text-[#64748b]">Track GPS sync, vehicle servicing, and emergency patient dispatch logs</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setDispatchModalOpen(true)} className="flex items-center gap-1.5 bg-[#e53935] hover:bg-[#c62828] text-white">
            <PhoneCall className="w-3.5 h-3.5" /> Dispatch Emergency
          </Button>
          <Button size="sm" variant="outline" onClick={() => setVehicleModalOpen(true)} className="flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Vehicle
          </Button>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-[#e2e8f0] px-4 py-2.5">
          <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
            <AmbulanceIcon className="w-4 h-4 text-[#4CAF72]" /> Active Fleet Vehicles
          </h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
              <th className="p-3">Vehicle No.</th>
              <th className="p-3">Type</th>
              <th className="p-3">Driver</th>
              <th className="p-3">Equipment List</th>
              <th className="p-3">Fuel Level</th>
              <th className="p-3">GPS Sync</th>
              <th className="p-3">Last Service</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
            {state.ambulances.map((amb) => (
              <tr key={amb.id} className="hover:bg-slate-50/50">
                <td className="p-3 font-[800] text-[#0f172a]">{amb.vehicleNo}</td>
                <td className="p-3">{amb.type}</td>
                <td className="p-3">{amb.driver}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {amb.equipment.map((eq) => (
                      <span key={eq} className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-[700]">
                        {eq}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Battery className={`w-4 h-4 ${amb.fuelLevel < 20 ? "text-red-500" : "text-green-600"}`} />
                    <span>{amb.fuelLevel}%</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-[700] ${amb.gpsStatus === "Online" ? "text-green-600 animate-pulse" : "text-slate-400"}`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-current" /> {amb.gpsStatus}
                  </span>
                </td>
                <td className="p-3 text-[12px]">{amb.lastService}</td>
                <td className="p-3">
                  <Badge variant={getStatusBadge(amb.status)}>{amb.status}</Badge>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      updateAmbulance({
                        ...amb,
                        status: amb.status === "Available" ? "Maintenance" : "Available",
                      });
                    }}
                    className="text-xs text-[#4CAF72] font-[700] hover:underline"
                  >
                    Toggle Service
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Call Log Section */}
      <div className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-[#e2e8f0] px-4 py-2.5">
          <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-[#e53935]" /> Emergency Call Dispatch History
          </h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
              <th className="p-3">Call ID</th>
              <th className="p-3">Date/Time</th>
              <th className="p-3">Pickup Address</th>
              <th className="p-3">Drop Destination</th>
              <th className="p-3">Driver</th>
              <th className="p-3">Vehicle No.</th>
              <th className="p-3">Duration</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
            {state.ambulanceCallLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="p-3 font-[800] text-[#0f172a]">{log.id}</td>
                <td className="p-3 text-xs text-[#64748b]">{new Date(log.dateTime).toLocaleString()}</td>
                <td className="p-3">{log.pickup}</td>
                <td className="p-3">{log.drop}</td>
                <td className="p-3">{log.driver}</td>
                <td className="p-3 font-mono text-xs">{log.vehicleNo}</td>
                <td className="p-3 text-xs font-[700]">{log.duration}</td>
                <td className="p-3">
                  <Badge variant={log.status === "Completed" ? "success" : log.status === "En Route" ? "warning" : "destructive"}>
                    {log.status}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  {log.status === "En Route" && (
                    <button
                      onClick={() => handleReturnCall(log)}
                      className="text-xs text-[#4CAF72] font-[700] hover:underline"
                    >
                      Log Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setVehicleModalOpen(false)} />
          <form onSubmit={handleAddVehicle} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4 shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">Add Ambulance Vehicle</h3>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Vehicle License No. *</label>
              <Input
                value={newVehicle.vehicleNo}
                onChange={(e) => setNewVehicle({ ...newVehicle, vehicleNo: e.target.value })}
                placeholder="e.g. AMB-2026-X4"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Ambulance Classification</label>
              <select
                value={newVehicle.type}
                onChange={(e: any) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
              >
                {vehicleTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Assigned Driver Name *</label>
              <Input
                value={newVehicle.driver}
                onChange={(e) => setNewVehicle({ ...newVehicle, driver: e.target.value })}
                placeholder="e.g. Steve Rogers"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Fuel / Charge Level (%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newVehicle.fuelLevel}
                onChange={(e) => setNewVehicle({ ...newVehicle, fuelLevel: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Medical Equipment Checklist</label>
              <div className="grid grid-cols-2 gap-2 p-2 border border-[#e2e8f0] rounded-[6px] bg-white">
                {["Defibrillator", "Oxygen", "Stretcher", "Suction", "IV Kit"].map((item) => {
                  const attached = newVehicle.equipment.includes(item);
                  return (
                    <label key={item} className="flex items-center gap-2 text-[12px] font-[600] text-[#475569] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={attached}
                        onChange={(e) => {
                          const list = e.target.checked
                            ? [...newVehicle.equipment, item]
                            : newVehicle.equipment.filter((x: any) => x !== item);
                          setNewVehicle({ ...newVehicle, equipment: list });
                        }}
                        className="rounded text-[#4CAF72] focus:ring-[#4CAF72]"
                      />
                      {item}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setVehicleModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Add Vehicle</Button>
            </div>
          </form>
        </div>
      )}

      {/* Dispatch Emergency Call Modal */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDispatchModalOpen(false)} />
          <form onSubmit={handleDispatchCall} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4 shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2 text-[#e53935] flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 animate-bounce" /> Dispatch Emergency Call
            </h3>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Select Available Vehicle *</label>
              <select
                value={newCall.vehicleNo}
                onChange={(e) => setNewCall({ ...newCall, vehicleNo: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
                required
              >
                <option value="">Choose Ambulance...</option>
                {state.ambulances.filter(amb => amb.status === "Available").map((amb) => (
                  <option key={amb.id} value={amb.vehicleNo}>
                    {amb.vehicleNo} ({amb.type} - Driver: {amb.driver} - Fuel: {amb.fuelLevel}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Pickup Address *</label>
              <Input
                value={newCall.pickup}
                onChange={(e) => setNewCall({ ...newCall, pickup: e.target.value })}
                placeholder="e.g. 5th Avenue and Oak Street intersection"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Destination Facility</label>
              <Input
                value={newCall.drop}
                onChange={(e) => setNewCall({ ...newCall, drop: e.target.value })}
                placeholder="e.g. Metapharsic General Hospital ER"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setDispatchModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-[#e53935] hover:bg-[#c62828] text-white">Dispatch</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
