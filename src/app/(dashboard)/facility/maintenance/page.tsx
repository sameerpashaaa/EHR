"use client";

import React, { useState, useMemo } from "react";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, MessageSquare, User, MapPin, Calendar, Clock, X, CheckSquare, Save
} from "lucide-react";

export default function MaintenanceTicketsPage() {
  const { state, addMaintenanceTicket, updateMaintenanceTicket } = useFacility();

  // Selected Ticket State for Detail Drawer
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Comment input state
  const [commentText, setCommentText] = useState("");

  // Raise Ticket Modal State
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    category: "Electrical" as any,
    description: "",
    location: "",
    priority: "Medium" as any,
    assignedTeam: "Electrical Team A",
    raisedBy: "Dr. Adrian Miller",
  });

  const columns = ["Open", "In Progress", "Awaiting Parts", "Resolved"];

  const categories = ["Electrical", "Plumbing", "HVAC", "Biomedical", "Furniture", "Civil"];
  const priorities = ["Low", "Medium", "High", "Critical"];

  const selectedTicket = useMemo(() => {
    return state.maintenanceTickets.find((t) => t.id === selectedTicketId) || null;
  }, [state.maintenanceTickets, selectedTicketId]);

  // Group tickets by status columns
  const ticketsByColumn = useMemo(() => {
    const map: Record<string, any[]> = {
      "Open": [],
      "In Progress": [],
      "Awaiting Parts": [],
      "Resolved": [],
    };
    state.maintenanceTickets.forEach((t) => {
      if (map[t.status]) {
        map[t.status].push(t);
      } else {
        map["Open"].push(t);
      }
    });
    return map;
  }, [state.maintenanceTickets]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.description.trim() || !newTicket.location.trim()) return;

    addMaintenanceTicket({
      category: newTicket.category,
      description: newTicket.description,
      location: newTicket.location,
      priority: newTicket.priority,
      assignedTeam: newFormTeam(newTicket.category),
      raisedBy: newTicket.raisedBy,
      status: "Open",
    });

    setNewTicket({
      category: "Electrical",
      description: "",
      location: "",
      priority: "Medium",
      assignedTeam: "Electrical Team A",
      raisedBy: "Dr. Adrian Miller",
    });
    setTicketModalOpen(false);
  };

  const newFormTeam = (category: string) => {
    switch (category) {
      case "Electrical": return "Electrical Techs";
      case "Plumbing": return "Plumbing Team A";
      case "HVAC": return "HVAC Engineers";
      case "Biomedical": return "Biomedical Service Team";
      default: return "Facility Repairs Crew";
    }
  };

  const handleUpdateStatus = (ticket: any, newStatus: string) => {
    updateMaintenanceTicket({
      ...ticket,
      status: newStatus as any,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      text: commentText.trim(),
      author: "Admin User", // current user placeholder
      timestamp: new Date().toISOString(),
    };

    updateMaintenanceTicket({
      ...selectedTicket,
      comments: [...selectedTicket.comments, newComment],
    });

    setCommentText("");
  };

  const getPriorityBadge = (priority: string) => {
    const maps = {
      Low: "secondary",
      Medium: "info",
      High: "warning",
      Critical: "destructive",
    };
    return maps[priority as keyof typeof maps] as any || "default";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">Maintenance Tickets</h2>
          <p className="text-xs text-[#64748b]">Kanban ticket board for structural, plumbing, electrical, and biomedical work orders</p>
        </div>
        <Button size="sm" onClick={() => setTicketModalOpen(true)} className="flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Raise Ticket
        </Button>
      </div>

      {/* Ticket Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[75vh]">
        {columns.map((colName) => {
          const colTickets = ticketsByColumn[colName] || [];
          return (
            <div key={colName} className="bg-slate-50 border border-[#e2e8f0] rounded-[6px] p-3 flex flex-col h-full">
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-[800] text-[#64748b] tracking-wider">{colName}</span>
                <span className="bg-white border border-[#e2e8f0] text-[11px] font-[800] px-2 py-0.5 rounded-[4px] text-[#475569]">
                  {colTickets.length}
                </span>
              </div>

              {/* Tickets Stack */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {colTickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="bg-white border border-[#e2e8f0] hover:border-[#4CAF72] p-3 rounded-[6px] shadow-sm cursor-pointer transition-all space-y-2.5 active:scale-98"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-[800] text-[#94a3b8] tracking-wider">{t.id}</span>
                      <Badge variant={getPriorityBadge(t.priority)} className="text-[9px] px-1 py-0">{t.priority}</Badge>
                    </div>

                    <p className="text-[13px] font-[700] text-[#0f172a] line-clamp-2 leading-tight">
                      {t.description}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-[#64748b]">
                      <MapPin className="w-3 h-3 text-[#4CAF72] flex-shrink-0" />
                      <span className="truncate">{t.location}</span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-[#94a3b8] font-[700] border-t border-[#f1f5f9] pt-2">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{t.category}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> {t.comments.length}
                      </span>
                    </div>
                  </div>
                ))}
                {colTickets.length === 0 && (
                  <div className="text-center py-8 text-xs text-[#94a3b8] italic border border-dashed border-[#e2e8f0] rounded-[6px]">
                    No tickets
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelectedTicketId(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-5 z-10 flex flex-col justify-between border-l border-[#e2e8f0]">
            <div className="space-y-4 overflow-y-auto max-h-[85vh] pr-1">
              <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
                <div>
                  <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider">Ticket Logs</h3>
                  <p className="text-[11px] text-[#64748b]">Ticket ID: {selectedTicket.id} • Category: {selectedTicket.category}</p>
                </div>
                <button onClick={() => setSelectedTicketId(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[13px] font-[600] text-[#475569] space-y-2 bg-[#f8fafc] border border-[#e2e8f0] p-3 rounded-[6px]">
                <p><strong className="text-[#0f172a]">Location:</strong> {selectedTicket.location}</p>
                <p><strong className="text-[#0f172a]">Raised By:</strong> {selectedTicket.raisedBy}</p>
                <p><strong className="text-[#0f172a]">Date Raised:</strong> {new Date(selectedTicket.dateRaised).toLocaleString()}</p>
                <p><strong className="text-[#0f172a]">Assigned Team:</strong> {selectedTicket.assignedTeam}</p>
                <p className="border-t border-[#e2e8f0] pt-2 mt-2 leading-relaxed">
                  <strong className="text-[#0f172a] block mb-1">Issue Description:</strong>
                  {selectedTicket.description}
                </p>
              </div>

              {/* Status Update Trigger */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider">Work Status</label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateStatus(selectedTicket, e.target.value)}
                  className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
                >
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Activity Comments Log */}
              <div className="space-y-2">
                <label className="text-[10px] font-[800] uppercase tracking-wider text-[#64748b] block">Activity Log Comments</label>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {selectedTicket.comments.map((comment) => (
                    <div key={comment.id} className="p-2.5 bg-slate-50 border border-[#e2e8f0] rounded-[4px] text-[12px] font-[600]">
                      <div className="flex justify-between items-center text-[10px] text-[#94a3b8] mb-1">
                        <span>{comment.author}</span>
                        <span>{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[#475569] leading-relaxed">{comment.text}</p>
                    </div>
                  ))}
                  {selectedTicket.comments.length === 0 && (
                    <p className="text-xs text-[#94a3b8] italic text-center py-2">No comments logged yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-[#f1f5f9]">
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add operational comment..."
                    required
                  />
                  <Button type="submit" size="sm">Add</Button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Raise Ticket Modal */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setTicketModalOpen(false)} />
          <form onSubmit={handleCreateTicket} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4 shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">Raise Maintenance Ticket</h3>
            
            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Category</label>
              <select
                value={newTicket.category}
                onChange={(e: any) => setNewTicket({ ...newTicket, category: e.target.value })}
                className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Location *</label>
              <Input
                value={newTicket.location}
                onChange={(e) => setNewTicket({ ...newTicket, location: e.target.value })}
                placeholder="e.g. Block A, Floor 1, Room 201"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Description *</label>
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
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setTicketModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Raise Ticket</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
