"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2, Users, Bed, Activity, Wrench, ShieldAlert, 
  CalendarClock, Plus, ArrowUpRight, CheckCircle2, AlertTriangle
} from "lucide-react";

export default function FacilityOverviewPage() {
  const router = useRouter();
  const { state, addMaintenanceTicket } = useFacility();

  // Dialog State
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    category: "Electrical" as any,
    description: "",
    location: "",
    priority: "Medium" as any,
    assignedTeam: "Maintenance Crew A",
    raisedBy: "Dr. Adrian Miller",
  });

  // Calculate metrics
  const totalBeds = state.beds.length;
  const availableBeds = state.beds.filter((b) => b.status === "available").length;
  const occupiedBeds = state.beds.filter((b) => b.status === "occupied").length;
  const reservedBeds = state.beds.filter((b) => b.status === "reserved").length;
  const cleaningBeds = state.beds.filter((b) => b.status === "cleaning").length;
  const maintenanceBeds = state.beds.filter((b) => b.status === "maintenance").length;
  const isolationBeds = state.beds.filter((b) => b.status === "isolation").length;

  const icuBeds = state.beds.filter((b) => b.name.startsWith("ICU"));
  const icuTotal = icuBeds.length;
  const icuOccupied = icuBeds.filter((b) => b.status === "occupied").length;
  const icuOccupancyPercent = icuTotal > 0 ? Math.round((icuOccupied / icuTotal) * 100) : 0;

  const otTotal = state.otList.length;
  const otInUse = state.otList.filter((o) => o.sterilizationStatus === "In Use").length;
  const otUtilizationPercent = otTotal > 0 ? Math.round((otInUse / otTotal) * 100) : 0;

  const emergencyBeds = state.beds.filter((b) => b.name.includes("101") || b.name.includes("ER"));
  const emergencyQueueCount = emergencyBeds.filter((b) => b.status === "occupied").length;

  const staffOnDuty = state.staff.filter((s) => s.status === "On Duty").length;

  const criticalTickets = state.maintenanceTickets.filter((t) => t.priority === "Critical" && t.status !== "Resolved").length;
  const calibrationDue = state.equipment.filter((e) => e.status === "In Calibration" || e.nextDue < new Date().toISOString().split('T')[0]).length;

  // Ward occupancies
  const wardStats = state.wards.map((ward) => {
    const wardBeds = state.beds.filter((b) => b.wardId === ward.id);
    const total = wardBeds.length;
    const occupied = wardBeds.filter((b) => b.status === "occupied").length;
    const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { ...ward, total, occupied, percent };
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.description.trim() || !newTicket.location.trim()) return;
    addMaintenanceTicket({ ...newTicket, status: "Open" });
    setNewTicket({
      category: "Electrical",
      description: "",
      location: "",
      priority: "Medium",
      assignedTeam: "Maintenance Crew A",
      raisedBy: "Dr. Adrian Miller",
    });
    setTicketModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Overview Title and Quick Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">Facility Live Dashboard</h2>
          <p className="text-xs text-[#64748b]">Metapharsic EHR Hospital Operations Backbone</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => router.push("/facility/beds")} className="flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Assign Bed
          </Button>
          <Button size="sm" variant="outline" onClick={() => setTicketModalOpen(true)} className="flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Raise Ticket
          </Button>
          <Button size="sm" variant="outline" onClick={() => router.push("/facility/visitors")} className="flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Issue Pass
          </Button>
        </div>
      </div>

      {/* Alert Strip if critical alerts exist */}
      {(criticalTickets > 0 || calibrationDue > 0) && (
        <div className="bg-[#fffbeb] border border-[#fef3c7] text-[#b45309] text-xs px-4 py-2 rounded-[6px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#d97706]" />
          <span>
            <strong>Warning:</strong> {criticalTickets > 0 && `${criticalTickets} critical maintenance tickets open`}
            {criticalTickets > 0 && calibrationDue > 0 && " | "}
            {calibrationDue > 0 && `${calibrationDue} equipment due for calibration/maintenance`}
          </span>
        </div>
      )}

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Total Beds", value: totalBeds, icon: Bed, color: "text-[#64748b]" },
          { label: "Available Beds", value: availableBeds, icon: Bed, color: "text-[#4CAF72]" },
          { label: "ICU Occupancy", value: `${icuOccupancyPercent}%`, icon: Activity, color: "text-[#9C27B0]" },
          { label: "OT Utilization", value: `${otUtilizationPercent}%`, icon: CalendarClock, color: "text-[#2196F3]" },
          { label: "Emergency Queue", value: emergencyQueueCount, icon: ShieldAlert, color: "text-[#F44336]" },
          { label: "Today's Admits", value: 12, icon: Users, color: "text-[#22c55e]" },
          { label: "Today's Discharges", value: 8, icon: CheckCircle2, color: "text-[#16a34a]" },
          { label: "Staff On Duty", value: staffOnDuty, icon: Users, color: "text-[#64748b]" },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white border border-[#e2e8f0] p-3 rounded-[6px] shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-[700] text-[#64748b] tracking-wider leading-tight">{m.label}</span>
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
              <div className="text-lg font-[800] text-[#0f172a] mt-2">{m.value}</div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Bed Occupancy Map by Ward */}
        <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-[6px] p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2">
            <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider">Bed Occupancy Map by Ward</h3>
            <button
              onClick={() => router.push("/facility/beds")}
              className="text-[11px] font-[700] text-[#4CAF72] flex items-center hover:underline"
            >
              View Beds <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {wardStats.map((w) => (
              <div
                key={w.id}
                onClick={() => router.push(`/facility/beds?wardId=${w.id}`)}
                className="group cursor-pointer space-y-1.5"
              >
                <div className="flex justify-between text-xs font-[600] text-[#475569]">
                  <span className="group-hover:text-[#4CAF72] transition-colors">{w.name}</span>
                  <span>{w.occupied} / {w.total} Beds Occupied ({w.percent}%)</span>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#4CAF72] h-full rounded-full transition-all duration-500"
                    style={{ width: `${w.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ICU Status Panel */}
        <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2">
            <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider">ICU Status Panel</h3>
            <button
              onClick={() => router.push("/facility/icu")}
              className="text-[11px] font-[700] text-[#4CAF72] flex items-center hover:underline"
            >
              ICU Dashboard <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { type: "Medical ICU", occupied: 5, total: 8 },
              { type: "NICU", occupied: 2, total: 4 },
              { type: "Surgical ICU", occupied: 4, total: 6 },
              { type: "Cardiac ICU", occupied: 3, total: 5 },
            ].map((icu, idx) => {
              const pct = Math.round((icu.occupied / icu.total) * 100);
              return (
                <div key={idx} className="bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-[6px] flex flex-col justify-between">
                  <span className="text-[10px] font-[800] text-[#475569] uppercase tracking-wider">{icu.type}</span>
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-lg font-[800] text-[#0f172a]">{pct}%</span>
                    <span className="text-[11px] text-[#64748b] font-[600]">{icu.occupied}/{icu.total} Beds</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#9C27B0] h-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OT Schedule Timeline */}
        <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-[6px] p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2">
            <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider">OT Surgery Schedule Today</h3>
            <button
              onClick={() => router.push("/facility/ot")}
              className="text-[11px] font-[700] text-[#4CAF72] flex items-center hover:underline"
            >
              OT Manager <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3">
            {state.otList.map((ot) => (
              <div key={ot.id} className="border border-[#e2e8f0] p-3 rounded-[6px] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-[800] text-[#0f172a]">{ot.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-[4px] font-[700] ${
                    ot.sterilizationStatus === "Sterile"
                      ? "bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]"
                      : ot.sterilizationStatus === "In Use"
                      ? "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]"
                      : "bg-[#fffbeb] text-[#b45309] border-[#fef3c7]"
                  } border`}>
                    {ot.sterilizationStatus}
                  </span>
                </div>
                {ot.schedule.length === 0 ? (
                  <p className="text-xs text-[#94a3b8] italic">No surgeries scheduled today.</p>
                ) : (
                  <div className="relative h-6 bg-[#f1f5f9] rounded flex overflow-hidden border border-[#e2e8f0]">
                    {ot.schedule.map((item, i) => (
                      <div
                        key={i}
                        className="bg-[#dbeafe] border-r border-[#3b82f6] text-[9px] font-[700] text-[#1e40af] flex items-center justify-center truncate px-1"
                        style={{ width: `${100 / ot.schedule.length}%` }}
                        title={`${item.time}: ${item.procedure} (${item.patient})`}
                      >
                        {item.procedure}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Tickets & Equipment alerts */}
        <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2">
            <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider">Maintenance Alerts</h3>
            <button
              onClick={() => router.push("/facility/maintenance")}
              className="text-[11px] font-[700] text-[#4CAF72] flex items-center hover:underline"
            >
              Ticket Board <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            <div className="flex justify-between items-center p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px]">
              <div>
                <p className="text-[13px] font-[700] text-[#0f172a]">Critical Tickets Open</p>
                <p className="text-[10px] text-[#64748b] font-[500]">Requires immediate response</p>
              </div>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-[800] text-[14px] ${criticalTickets > 0 ? "bg-[#fef2f2] text-[#dc2626]" : "bg-slate-100 text-slate-600"}`}>
                {criticalTickets}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px]">
              <div>
                <p className="text-[13px] font-[700] text-[#0f172a]">Calibration & AMC Due</p>
                <p className="text-[10px] text-[#64748b] font-[500]">Biomedical equipment checklist</p>
              </div>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-[800] text-[14px] ${calibrationDue > 0 ? "bg-[#fffbeb] text-[#b45309]" : "bg-slate-100 text-slate-600"}`}>
                {calibrationDue}
              </span>
            </div>

            {/* List of open tickets */}
            <div className="space-y-2 mt-4">
              <label className="text-[10px] font-[800] uppercase tracking-wider text-[#64748b] block">Recent Tickets</label>
              {state.maintenanceTickets.slice(0, 3).map((t) => (
                <div key={t.id} className="flex justify-between items-center text-[12px] p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] font-[600]">
                  <span className="text-[#0f172a] truncate max-w-[150px]">{t.description}</span>
                  <Badge variant={t.priority === "Critical" ? "destructive" : t.priority === "High" ? "warning" : "secondary"}>
                    {t.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setTicketModalOpen(false)} />
          <form onSubmit={handleCreateTicket} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">Raise Maintenance Ticket</h3>
            
            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Category</label>
              <select
                value={newTicket.category}
                onChange={(e: any) => setNewTicket({ ...newTicket, category: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="Biomedical">Biomedical</option>
                <option value="Furniture">Furniture</option>
                <option value="Civil">Civil</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Location</label>
              <Input
                value={newTicket.location}
                onChange={(e) => setNewTicket({ ...newTicket, location: e.target.value })}
                placeholder="e.g. Block A, Floor 1, Room 201"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Description</label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                rows={3}
                placeholder="Describe the issue in detail..."
                className="w-full rounded-[6px] border border-[#e2e8f0] bg-white p-2.5 text-[13px] focus:outline-none focus:border-[#4CAF72]"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Priority</label>
              <select
                value={newTicket.priority}
                onChange={(e: any) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setTicketModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Create Ticket</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
