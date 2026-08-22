"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Wrench, ShieldCheck, HeartCrack, ClipboardList, Trash2, CalendarClock
} from "lucide-react";

interface Props {
  params: {
    id: string;
  };
}

export default function EquipmentDetailPage({ params }: Props) {
  const router = useRouter();
  const { state, updateEquipment, removeEquipment } = useFacility();
  const eqId = decodeURIComponent(params.id);

  // Find target equipment
  const eq = useMemo(() => {
    return state.equipment.find((e) => e.id === eqId) || null;
  }, [state.equipment, eqId]);

  // Log Maintenance state
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    type: "Preventative",
    doneBy: "Isaac Clarke",
    notes: "Completed standard calibration, replaced filters, and ran diagnostic tests.",
  });

  // Mock maintenance history seeded on first load
  const [history, setHistory] = useState<any[]>([
    { date: "2026-03-10", type: "Calibration", doneBy: "Isaac Clarke", notes: "Regular calibration and firmware update.", nextDue: "2026-06-10" },
    { date: "2025-12-10", type: "Preventative", doneBy: "Dave Davis", notes: "Filter replacement and power adapter test.", nextDue: "2026-03-10" },
    { date: "2025-09-10", type: "Repair", doneBy: "Isaac Clarke", notes: "Replaced main logic board fuse after power fluctuation.", nextDue: "2025-12-10" },
  ]);

  if (!eq) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.push("/facility/equipment")} className="flex items-center gap-1 text-xs font-[700] text-[#64748b] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Equipment
        </button>
        <div className="bg-white border border-[#e2e8f0] p-6 text-center text-xs text-[#94a3b8] italic">
          Equipment with ID "{eqId}" not found.
        </div>
      </div>
    );
  }

  const handleRetire = () => {
    if (window.confirm("Are you sure you want to retire this equipment? This action is permanent.")) {
      updateEquipment({
        ...eq,
        status: "Retired",
      });
      alert("Asset marked as Retired.");
      router.push("/facility/equipment");
    }
  };

  const handleReportIssue = () => {
    updateEquipment({
      ...eq,
      status: "Under Repair",
    });
    alert("Equipment status updated to Under Repair.");
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    
    // 90 days from now
    const nextDue = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const newRecord = {
      date: today,
      type: logForm.type,
      doneBy: logForm.doneBy,
      notes: logForm.notes,
      nextDue,
    };

    setHistory([newRecord, ...history]);
    
    // Update equipment in context
    updateEquipment({
      ...eq,
      status: "Active",
      lastMaintenance: today,
      nextDue,
    });

    setLogModalOpen(false);
    alert("Maintenance logged. Asset calibration status marked as Active.");
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

  const dept = state.departments.find(d => d.id === eq.departmentId);

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button 
        onClick={() => router.push("/facility/equipment")} 
        className="flex items-center gap-1 text-xs font-[700] text-[#64748b] hover:text-[#0f172a] transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Equipment
      </button>

      {/* Main card */}
      <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 space-y-5 shadow-sm">
        
        {/* Detail Title */}
        <div className="flex justify-between items-start border-b border-[#f1f5f9] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-[800] text-[#0f172a]">{eq.name}</h2>
              <Badge variant={getStatusBadge(eq.status)}>{eq.status}</Badge>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">Asset ID: {eq.id} • Category: {eq.type}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setLogModalOpen(true)} className="flex items-center gap-1.5">
              <Wrench className="w-4 h-4" /> Log Maintenance
            </Button>
            <Button size="sm" variant="outline" onClick={handleReportIssue} className="flex items-center gap-1.5 text-[#dc2626] border-[#fecaca] hover:bg-[#fef2f2]">
              <HeartCrack className="w-4 h-4" /> Report Issue
            </Button>
            <Button size="sm" variant="outline" onClick={handleRetire} className="flex items-center gap-1.5 text-slate-600">
              <Trash2 className="w-4 h-4" /> Retire Asset
            </Button>
          </div>
        </div>

        {/* Technical Data grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="border border-[#e2e8f0] rounded-[6px] p-4 space-y-3">
            <h4 className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-1.5 flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4 text-[#4CAF72]" /> Asset Information
            </h4>
            <div className="text-[13px] font-[600] space-y-1.5 text-[#475569]">
              <p><strong className="text-[#0f172a]">Location:</strong> {eq.location}</p>
              <p><strong className="text-[#0f172a]">Department:</strong> {dept?.name || "—"}</p>
              <p><strong className="text-[#0f172a]">Vendor:</strong> {eq.vendor || "—"}</p>
              <p><strong className="text-[#0f172a]">Purchase Date:</strong> {eq.purchaseDate}</p>
            </div>
          </div>

          <div className="border border-[#e2e8f0] rounded-[6px] p-4 space-y-3">
            <h4 className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4CAF72]" /> Warranty & AMC Contracts
            </h4>
            <div className="text-[13px] font-[600] space-y-1.5 text-[#475569]">
              <p><strong className="text-[#0f172a]">Warranty Expiry:</strong> {eq.warrantyExpiry}</p>
              <p><strong className="text-[#0f172a]">AMC Provider:</strong> {eq.amcProvider || "—"}</p>
              <p><strong className="text-[#0f172a]">AMC Expiry:</strong> {eq.amcExpiry || "—"}</p>
            </div>
          </div>

          <div className="border border-[#e2e8f0] rounded-[6px] p-4 space-y-3">
            <h4 className="text-[11px] font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-1.5 flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-[#4CAF72]" /> Calibration Schedule
            </h4>
            <div className="text-[13px] font-[600] space-y-1.5 text-[#475569]">
              <p><strong className="text-[#0f172a]">Interval:</strong> {eq.maintenanceInterval}</p>
              <p><strong className="text-[#0f172a]">Last Check:</strong> {eq.lastMaintenance}</p>
              <p className="text-red-600"><strong className="text-[#0f172a]">Next Due:</strong> {eq.nextDue}</p>
            </div>
          </div>

        </div>

        {/* Maintenance Log Table */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-[800] uppercase tracking-wider text-[#64748b]">Maintenance History log</h4>
          
          <div className="border border-[#e2e8f0] rounded-[6px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
                  <th className="p-3">Log Date</th>
                  <th className="p-3">Log Type</th>
                  <th className="p-3">Technician / Analyst</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Next Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
                {history.map((log, idx) => (
                  <tr key={idx} className="hover:bg-[#f8fafc]/50">
                    <td className="p-3 font-[800] text-[#0f172a]">{log.date}</td>
                    <td className="p-3">{log.type}</td>
                    <td className="p-3">{log.doneBy}</td>
                    <td className="p-3 text-[#64748b] truncate max-w-[250px]">{log.notes}</td>
                    <td className="p-3">{log.nextDue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Log Maintenance Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setLogModalOpen(false)} />
          <form onSubmit={handleLogSubmit} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4 shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">Log Maintenance Event</h3>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Check Type</label>
              <select
                value={logForm.type}
                onChange={(e) => setLogForm({ ...logForm, type: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
              >
                <option value="Preventative">Preventative</option>
                <option value="Calibration">Calibration</option>
                <option value="Emergency Repair">Emergency Repair</option>
                <option value="Upgrade">Software Upgrade</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Technician / Inspector *</label>
              <Input
                value={logForm.doneBy}
                onChange={(e) => setLogForm({ ...logForm, doneBy: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Notes / Action Completed *</label>
              <textarea
                value={logForm.notes}
                onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                rows={3}
                className="w-full rounded-[6px] border border-[#e2e8f0] bg-white p-2.5 text-[13px] focus:outline-none focus:border-[#4CAF72]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setLogModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Save Log</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
