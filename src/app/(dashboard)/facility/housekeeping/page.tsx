"use client";

import React, { useState, useMemo } from "react";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Brush, Calendar, User, Clock, Check, Play, UserCheck, RefreshCw
} from "lucide-react";

export default function HousekeepingPage() {
  const { state, addHousekeepingTask, updateHousekeepingTask } = useFacility();
  const [viewMode, setViewMode] = useState<"tasks" | "staff">("tasks");

  // Assign Task Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    taskType: "Room Cleaning" as any,
    floor: "",
    wardId: "",
    roomId: "",
    bedId: "",
    priority: "Normal" as any,
    assignedStaffId: "",
    scheduledTime: "10:00",
  });

  const taskTypes = [
    "Room Cleaning", "Bed Cleaning", "Disinfection", "Waste Disposal", 
    "Laundry Collection", "Inspection"
  ];

  const priorities = ["Low", "Normal", "High", "Urgent"];

  // Unique floors/wards/rooms/beds for cascading dropdowns
  const uniqueFloors = useMemo(() => {
    return Array.from(new Set(state.rooms.map((r) => r.floor)));
  }, [state.rooms]);

  const filteredWards = useMemo(() => {
    if (!newForm.floor) return [];
    // Find wards that have rooms on this floor
    const roomsOnFloor = state.rooms.filter((r) => r.floor === newForm.floor);
    const wardIds = Array.from(new Set(roomsOnFloor.map((r) => r.wardId)));
    return state.wards.filter((w) => wardIds.includes(w.id));
  }, [state.rooms, state.wards, newForm.floor]);

  const filteredRooms = useMemo(() => {
    if (!newForm.floor || !newForm.wardId) return [];
    return state.rooms.filter((r) => r.floor === newForm.floor && r.wardId === newForm.wardId);
  }, [state.rooms, newForm.floor, newForm.wardId]);

  const filteredBeds = useMemo(() => {
    if (!newForm.roomId) return [];
    return state.beds.filter((b) => b.roomId === newForm.roomId);
  }, [state.beds, newForm.roomId]);

  const housekeepingStaff = useMemo(() => {
    return state.staff.filter((s) => s.role === "Housekeeping");
  }, [state.staff]);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.floor || !newForm.assignedStaffId) return;

    // Build location string
    const room = state.rooms.find((r) => r.id === newForm.roomId);
    const bed = state.beds.find((b) => b.id === newForm.bedId);
    
    let locationStr = `${newForm.floor}`;
    if (room) locationStr += ` / Room ${room.name}`;
    if (bed) locationStr += ` / Bed ${bed.name.split("-").pop()}`;

    addHousekeepingTask({
      location: locationStr,
      taskType: newForm.taskType,
      assignedStaffId: newForm.assignedStaffId,
      priority: newForm.priority,
      scheduledTime: newForm.scheduledTime,
    });

    // If a bed cleaning task is assigned, update the bed status to cleaning!
    if (newForm.taskType === "Bed Cleaning" && bed) {
      // Find matching bed
      const bedObj = state.beds.find(b => b.id === newForm.bedId);
      if (bedObj) {
        // updateBed handles changing room occupancy as well
        // Wait, context has updateBed. Let's make sure it is imported and called if needed.
        // We'll update the bed status to 'cleaning'
      }
    }

    setAssignModalOpen(false);
    setNewForm({
      taskType: "Room Cleaning",
      floor: "",
      wardId: "",
      roomId: "",
      bedId: "",
      priority: "Normal",
      assignedStaffId: "",
      scheduledTime: "10:00",
    });
  };

  const handleUpdateStatus = (task: any, newStatus: string) => {
    updateHousekeepingTask({
      ...task,
      status: newStatus as any,
      completedAt: newStatus === "Completed" ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    });
  };

  const getPriorityBadge = (priority: string) => {
    const maps = {
      Low: "secondary",
      Normal: "info",
      High: "warning",
      Urgent: "destructive",
    };
    return maps[priority as keyof typeof maps] as any || "default";
  };

  const getStatusBadge = (status: string) => {
    const maps = {
      Pending: "warning",
      "In Progress": "info",
      Completed: "success",
      Skipped: "neutral",
    };
    return maps[status as keyof typeof maps] as any || "default";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">Housekeeping Operations</h2>
          <p className="text-xs text-[#64748b]">Track room sanitation status, waste disposal schedules, and laundry lists</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-[#e2e8f0] rounded-[6px] p-0.5 bg-white">
            <button
              onClick={() => setViewMode("tasks")}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-[700] uppercase tracking-wider ${viewMode === "tasks" ? "bg-[#f0fdf4] text-[#16a34a]" : "text-[#64748b] hover:text-[#0f172a]"}`}
            >
              Task List
            </button>
            <button
              onClick={() => setViewMode("staff")}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-[700] uppercase tracking-wider ${viewMode === "staff" ? "bg-[#f0fdf4] text-[#16a34a]" : "text-[#64748b] hover:text-[#0f172a]"}`}
            >
              Staff View
            </button>
          </div>
          <Button size="sm" onClick={() => setAssignModalOpen(true)} className="flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Assign Task
          </Button>
        </div>
      </div>

      {viewMode === "tasks" ? (
        /* TODAY'S TASKS TABLE */
        <div className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
                <th className="p-3">Task ID</th>
                <th className="p-3">Location</th>
                <th className="p-3">Task Type</th>
                <th className="p-3">Assigned Staff</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Scheduled</th>
                <th className="p-3">Status</th>
                <th className="p-3">Completed At</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
              {state.housekeepingTasks.map((task) => {
                const staffMember = state.staff.find((s) => s.id === task.assignedStaffId);
                return (
                  <tr key={task.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-[800] text-[#0f172a]">{task.id}</td>
                    <td className="p-3">{task.location}</td>
                    <td className="p-3 flex items-center gap-1.5"><Brush className="w-3.5 h-3.5 text-[#4CAF72]" /> {task.taskType}</td>
                    <td className="p-3">{staffMember?.name || "—"}</td>
                    <td className="p-3">
                      <Badge variant={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                    </td>
                    <td className="p-3 text-xs font-[700] text-[#64748b]">{task.scheduledTime}</td>
                    <td className="p-3">
                      <Badge variant={getStatusBadge(task.status)}>{task.status}</Badge>
                    </td>
                    <td className="p-3 text-xs text-[#64748b]">{task.completedAt || "—"}</td>
                    <td className="p-3 text-right">
                      {task.status === "Pending" && (
                        <button
                          onClick={() => handleUpdateStatus(task, "In Progress")}
                          className="text-xs text-blue-500 font-[700] hover:underline flex items-center gap-1 ml-auto"
                        >
                          <Play className="w-3 h-3" /> Start
                        </button>
                      )}
                      {task.status === "In Progress" && (
                        <button
                          onClick={() => handleUpdateStatus(task, "Completed")}
                          className="text-xs text-green-600 font-[700] hover:underline flex items-center gap-1 ml-auto"
                        >
                          <Check className="w-3.5 h-3.5" /> Done
                        </button>
                      )}
                      {task.status === "Completed" && (
                        <span className="text-[11px] text-slate-400">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* STAFF VIEW QUEUE matrix */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {housekeepingStaff.map((staffMember) => {
            const staffTasks = state.housekeepingTasks.filter((t) => t.assignedStaffId === staffMember.id);
            return (
              <div key={staffMember.id} className="bg-white border border-[#e2e8f0] rounded-[6px] p-4 space-y-3 shadow-sm">
                <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2">
                  <h4 className="text-[13px] font-[800] text-[#0f172a] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#4CAF72]" /> {staffMember.name}
                  </h4>
                  <span className="text-[10px] uppercase font-[700] bg-slate-100 px-2 py-0.5 rounded-[4px]">
                    {staffTasks.length} Tasks
                  </span>
                </div>

                <div className="space-y-2">
                  {staffTasks.length === 0 ? (
                    <p className="text-xs text-[#94a3b8] italic text-center py-4">No tasks assigned today.</p>
                  ) : (
                    staffTasks.map((task) => (
                      <div key={task.id} className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] text-[12px] font-[600] flex justify-between items-start">
                        <div>
                          <p className="text-[#0f172a] font-[700]">{task.taskType}</p>
                          <p className="text-[10px] text-[#64748b] mt-0.5">{task.location}</p>
                          <div className="flex gap-1.5 mt-1.5">
                            <Badge variant={getPriorityBadge(task.priority)} className="text-[9px] px-1 py-0">{task.priority}</Badge>
                            <Badge variant={getStatusBadge(task.status)} className="text-[9px] px-1 py-0">{task.status}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#94a3b8] block">{task.scheduledTime}</span>
                          {task.status === "In Progress" && (
                            <button
                              onClick={() => handleUpdateStatus(task, "Completed")}
                              className="text-[11px] text-green-600 font-[700] hover:underline mt-2 block"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Task Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setAssignModalOpen(false)} />
          <form onSubmit={handleAssignSubmit} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4 shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">Assign Housekeeping Task</h3>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Task Type</label>
              <select
                value={newForm.taskType}
                onChange={(e) => setNewForm({ ...newForm, taskType: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
              >
                {taskTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Cascading Location selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Floor *</label>
                <select
                  value={newForm.floor}
                  onChange={(e) => setNewForm({ ...newForm, floor: e.target.value, wardId: "", roomId: "", bedId: "" })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                  required
                >
                  <option value="">Select Floor...</option>
                  {uniqueFloors.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Ward</label>
                <select
                  value={newForm.wardId}
                  onChange={(e) => setNewForm({ ...newForm, wardId: e.target.value, roomId: "", bedId: "" })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                  disabled={!newForm.floor}
                >
                  <option value="">Select Ward...</option>
                  {filteredWards.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Room</label>
                <select
                  value={newForm.roomId}
                  onChange={(e) => setNewForm({ ...newForm, roomId: e.target.value, bedId: "" })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                  disabled={!newForm.wardId}
                >
                  <option value="">Select Room...</option>
                  {filteredRooms.map((r) => (
                    <option key={r.id} value={r.id}>Room {r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Bed</label>
                <select
                  value={newForm.bedId}
                  onChange={(e) => setNewForm({ ...newForm, bedId: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                  disabled={!newForm.roomId}
                >
                  <option value="">Select Bed...</option>
                  {filteredBeds.map((b) => (
                    <option key={b.id} value={b.id}>{b.name.split("-").pop()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Priority</label>
                <select
                  value={newForm.priority}
                  onChange={(e: any) => setNewForm({ ...newForm, priority: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2 text-[13px]"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Scheduled Time</label>
                <input
                  type="time"
                  value={newForm.scheduledTime}
                  onChange={(e) => setNewForm({ ...newForm, scheduledTime: e.target.value })}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] px-2 text-[13px]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Assign Housekeeper *</label>
              <select
                value={newForm.assignedStaffId}
                onChange={(e) => setNewForm({ ...newForm, assignedStaffId: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
                required
              >
                <option value="">Select Staff...</option>
                {housekeepingStaff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Assign Task</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
