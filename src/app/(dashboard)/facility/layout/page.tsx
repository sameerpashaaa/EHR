"use client";

import React, { useState, useMemo } from "react";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Trash2, Edit3, ChevronRight, ChevronDown, Compass, 
  Building2, Layers, Shield, FolderHeart, Hotel, ChevronRightSquare, Save, X
} from "lucide-react";

export default function LayoutManagerPage() {
  const { 
    state, 
    addCampus, removeCampus, updateCampus,
    addBuilding, removeBuilding, updateBuilding,
    addRoom, removeRoom, updateRoom 
  } = useFacility();

  // Selected node state
  // Format: { type: 'campus' | 'building' | 'floor' | 'department' | 'ward' | 'room', id: string, extra?: any }
  const [selectedNode, setSelectedNode] = useState<{
    type: "campus" | "building" | "floor" | "department" | "ward" | "room";
    id: string;
    extra?: any; // e.g. campusId, buildingId, floorName, deptId, wardId
  }>({ type: "campus", id: "c1" });

  // Tree Collapsed/Expanded states
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "campus-c1": true,
    "building-b1": true,
  });

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };

  // Add / Edit Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<string>("");
  const [addForm, setAddForm] = useState<any>({ name: "", location: "", type: "Main", floors: 2, wing: "", typeSelect: "General", capacity: 2 });
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  // Cascading Tree calculation
  // Building list per campus
  // Floor list dynamically calculated for each building (e.g. Ground, Floor 1, etc.)
  // Departments per floor: all departments from state.departments
  // Wards per department: all wards from state.wards
  // Rooms per ward: state.rooms filtered by floor, dept, ward

  const treeData = useMemo(() => {
    return state.campuses.map(campus => {
      const campusBuildings = state.buildings.filter(b => b.campusId === campus.id);
      return {
        ...campus,
        key: `campus-${campus.id}`,
        buildings: campusBuildings.map(b => {
          // Generate floor list based on floors count
          const floorsList = [];
          for (let f = 0; f < b.floors; f++) {
            const floorName = f === 0 ? "Ground" : `Floor ${f}`;
            floorsList.push({
              name: floorName,
              key: `floor-${b.id}-${floorName}`,
              buildingId: b.id,
            });
          }
          return {
            ...b,
            key: `building-${b.id}`,
            floors: floorsList,
          };
        }),
      };
    });
  }, [state.campuses, state.buildings]);

  // Selected Node Details
  const nodeDetails = useMemo(() => {
    const { type, id, extra } = selectedNode;

    switch (type) {
      case "campus": {
        const campus = state.campuses.find(c => c.id === id);
        if (!campus) return null;
        const children = state.buildings.filter(b => b.campusId === campus.id);
        return {
          title: campus.name,
          subtitle: `Campus Type: ${campus.type} | Location: ${campus.location}`,
          childType: "building",
          children: children.map(c => ({ id: c.id, name: c.name, subtitle: `${c.floors} Floors` })),
          data: campus,
        };
      }
      case "building": {
        const building = state.buildings.find(b => b.id === id);
        if (!building) return null;
        
        // Children are floors
        const floors = [];
        for (let f = 0; f < building.floors; f++) {
          const name = f === 0 ? "Ground" : `Floor ${f}`;
          floors.push({ id: `${building.id}-${name}`, name, subtitle: `Floor Level ${f}` });
        }

        return {
          title: building.name,
          subtitle: building.wing ? `Wing: ${building.wing}` : "Main Block",
          childType: "floor",
          children: floors,
          data: building,
        };
      }
      case "floor": {
        // id is buildingId-floorName
        const [buildingId, floorName] = id.split("-");
        const building = state.buildings.find(b => b.id === buildingId);
        
        // Children are departments
        return {
          title: `${building?.name || ""} — ${floorName}`,
          subtitle: `Building Floor Operations`,
          childType: "department",
          children: state.departments.map(d => ({ id: `${id}-${d.id}`, name: d.name, subtitle: "Department" })),
          data: { buildingId, floorName },
        };
      }
      case "department": {
        // id is buildingId-floorName-deptId
        const [buildingId, floorName, deptId] = id.split("-");
        const dept = state.departments.find(d => d.id === deptId);

        // Children are wards
        return {
          title: dept?.name || "Department",
          subtitle: `Operational Wing on Floor ${floorName}`,
          childType: "ward",
          children: state.wards.map(w => ({ id: `${id}-${w.id}`, name: w.name, subtitle: "Ward" })),
          data: { buildingId, floorName, deptId },
        };
      }
      case "ward": {
        // id is buildingId-floorName-deptId-wardId
        const [buildingId, floorName, deptId, wardId] = id.split("-");
        const ward = state.wards.find(w => w.id === wardId);

        // Children are rooms on this building-floor-dept-ward
        const rooms = state.rooms.filter(
          r => r.floor === floorName && r.wardId === wardId && r.departmentId === deptId
        );

        return {
          title: ward?.name || "Ward",
          subtitle: `Bed Allocation Unit`,
          childType: "room",
          children: rooms.map(r => ({ id: r.id, name: `Room ${r.name}`, subtitle: `${r.type} (${r.capacity} Beds)` })),
          data: { buildingId, floorName, deptId, wardId },
        };
      }
      case "room": {
        const room = state.rooms.find(r => r.id === id);
        return room ? { data: room, isRoom: true } : null;
      }
      default:
        return null;
    }
  }, [selectedNode, state]);

  // Room details editable form state
  const [roomForm, setRoomForm] = useState<any>(null);

  React.useEffect(() => {
    if (nodeDetails?.isRoom && nodeDetails.data) {
      setRoomForm({ ...nodeDetails.data });
    } else {
      setRoomForm(null);
    }
  }, [nodeDetails]);

  const handleSaveRoom = () => {
    if (!roomForm) return;
    updateRoom(roomForm);
    alert("Room layout updated successfully!");
  };

  const handleAddChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { type, id } = selectedNode;

    if (type === "campus") {
      addBuilding({
        campusId: id,
        name: addForm.name,
        floors: Number(addForm.floors),
        wing: addForm.wing || undefined,
      });
    } else if (type === "building" || type === "floor" || type === "department" || type === "ward") {
      // Add room configuration cascading
      let campusId = "", bId = "", floorName = "Ground", deptId = "d1", wardId = "w1";
      
      if (type === "building") {
        bId = id;
        floorName = "Ground";
      } else if (type === "floor") {
        const parts = id.split("-");
        bId = parts[0];
        floorName = parts[1];
      } else if (type === "department") {
        const parts = id.split("-");
        bId = parts[0];
        floorName = parts[1];
        deptId = parts[2];
      } else if (type === "ward") {
        const parts = id.split("-");
        bId = parts[0];
        floorName = parts[1];
        deptId = parts[2];
        wardId = parts[3];
      }

      addRoom({
        name: addForm.name,
        type: addForm.typeSelect,
        floor: floorName,
        wardId,
        departmentId: deptId,
        capacity: Number(addForm.capacity),
        cleaningStatus: "Clean",
        notes: "",
      });
    }

    setAddModalOpen(false);
    setAddForm({ name: "", location: "", type: "Main", floors: 2, wing: "", typeSelect: "General", capacity: 2 });
  };

  const handleDeleteNode = () => {
    const { type, id } = selectedNode;
    if (window.confirm(`Are you sure you want to delete this ${type}? This action will cascade delete child elements.`)) {
      if (type === "campus") {
        removeCampus(id);
        setSelectedNode({ type: "campus", id: state.campuses[0]?.id || "" });
      } else if (type === "building") {
        removeBuilding(id);
        setSelectedNode({ type: "campus", id: state.campuses[0]?.id || "" });
      } else if (type === "room") {
        removeRoom(id);
        setSelectedNode({ type: "campus", id: state.campuses[0]?.id || "" });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* Left panel: Tree View */}
      <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-4 space-y-4 max-h-[80vh] overflow-y-auto shadow-sm">
        <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-2">
          <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider">Hospital Layout Tree</h3>
          <Button
            size="sm"
            onClick={() => {
              addCampus({ name: "New Campus Annex", location: "Hospital Blvd", type: "Annex" });
            }}
            className="h-7 px-2 text-[10px] uppercase font-[700] flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Campus
          </Button>
        </div>

        {/* Campuses Loop */}
        <div className="space-y-2 text-[13px] font-[600] text-[#475569]">
          {treeData.map(campus => {
            const isCampusOpen = expandedNodes[campus.key];
            const isCampusSelected = selectedNode.type === "campus" && selectedNode.id === campus.id;

            return (
              <div key={campus.id} className="space-y-1">
                {/* Campus Node */}
                <div 
                  onClick={() => setSelectedNode({ type: "campus", id: campus.id })}
                  className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all ${isCampusSelected ? "bg-[#f0fdf4] text-[#16a34a] font-[700]" : "hover:bg-slate-50"}`}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(campus.key);
                    }}
                    className="p-0.5 hover:bg-slate-200 rounded"
                  >
                    {isCampusOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <Compass className="w-4 h-4 text-[#4CAF72]" />
                  <span>{campus.name}</span>
                </div>

                {/* Buildings Loop */}
                {isCampusOpen && (
                  <div className="pl-4 space-y-1 border-l border-slate-100 ml-3">
                    {campus.buildings.map(building => {
                      const isBuildingOpen = expandedNodes[building.key];
                      const isBuildingSelected = selectedNode.type === "building" && selectedNode.id === building.id;

                      return (
                        <div key={building.id} className="space-y-1">
                          <div 
                            onClick={() => setSelectedNode({ type: "building", id: building.id })}
                            className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all ${isBuildingSelected ? "bg-[#f0fdf4] text-[#16a34a] font-[700]" : "hover:bg-slate-50"}`}
                          >
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleNode(building.key);
                              }}
                              className="p-0.5 hover:bg-slate-200 rounded"
                            >
                              {isBuildingOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            </button>
                            <Building2 className="w-3.5 h-3.5 text-[#2196F3]" />
                            <span>{building.name}</span>
                          </div>

                          {/* Floors Loop */}
                          {isBuildingOpen && (
                            <div className="pl-4 space-y-1 border-l border-slate-100 ml-3">
                              {building.floors.map(floor => {
                                const isFloorOpen = expandedNodes[floor.key];
                                const isFloorSelected = selectedNode.type === "floor" && selectedNode.id === `${building.id}-${floor.name}`;

                                return (
                                  <div key={floor.key} className="space-y-1">
                                    <div 
                                      onClick={() => setSelectedNode({ type: "floor", id: `${building.id}-${floor.name}` })}
                                      className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-all ${isFloorSelected ? "bg-[#f0fdf4] text-[#16a34a] font-[700]" : "hover:bg-slate-50"}`}
                                    >
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleNode(floor.key);
                                        }}
                                        className="p-0.5 hover:bg-slate-200 rounded"
                                      >
                                        {isFloorOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                      </button>
                                      <Layers className="w-3.5 h-3.5 text-[#9C27B0]" />
                                      <span>{floor.name}</span>
                                    </div>

                                    {/* Department Loop */}
                                    {isFloorOpen && (
                                      <div className="pl-4 space-y-1 border-l border-slate-100 ml-3">
                                        {state.departments.map(dept => {
                                          const deptKey = `${floor.key}-${dept.id}`;
                                          const isDeptOpen = expandedNodes[deptKey];
                                          const isDeptSelected = selectedNode.type === "department" && selectedNode.id === `${building.id}-${floor.name}-${dept.id}`;

                                          return (
                                            <div key={dept.id} className="space-y-1">
                                              <div 
                                                onClick={() => setSelectedNode({ type: "department", id: `${building.id}-${floor.name}-${dept.id}` })}
                                                className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-all ${isDeptSelected ? "bg-[#f0fdf4] text-[#16a34a] font-[700]" : "hover:bg-slate-50"}`}
                                              >
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleNode(deptKey);
                                                  }}
                                                  className="p-0.5 hover:bg-slate-200 rounded"
                                                >
                                                  {isDeptOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                </button>
                                                <Shield className="w-3.5 h-3.5 text-[#e53935]" />
                                                <span>{dept.name}</span>
                                              </div>

                                              {/* Wards Loop */}
                                              {isDeptOpen && (
                                                <div className="pl-4 space-y-1 border-l border-slate-100 ml-3">
                                                  {state.wards.map(ward => {
                                                    const wardKey = `${deptKey}-${ward.id}`;
                                                    const isWardOpen = expandedNodes[wardKey];
                                                    const isWardSelected = selectedNode.type === "ward" && selectedNode.id === `${building.id}-${floor.name}-${dept.id}-${ward.id}`;
                                                    
                                                    const wardRooms = state.rooms.filter(
                                                      r => r.floor === floor.name && r.wardId === ward.id && r.departmentId === dept.id
                                                    );

                                                    return (
                                                      <div key={ward.id} className="space-y-1">
                                                        <div 
                                                          onClick={() => setSelectedNode({ type: "ward", id: `${building.id}-${floor.name}-${dept.id}-${ward.id}` })}
                                                          className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-all ${isWardSelected ? "bg-[#f0fdf4] text-[#16a34a] font-[700]" : "hover:bg-slate-50"}`}
                                                        >
                                                          <button 
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              toggleNode(wardKey);
                                                            }}
                                                            className="p-0.5 hover:bg-slate-200 rounded"
                                                          >
                                                            {isWardOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                          </button>
                                                          <FolderHeart className="w-3.5 h-3.5 text-[#fb8c00]" />
                                                          <span>{ward.name}</span>
                                                        </div>

                                                        {/* Rooms Loop */}
                                                        {isWardOpen && (
                                                          <div className="pl-4 space-y-1 border-l border-slate-100 ml-3">
                                                            {wardRooms.map(room => {
                                                              const isRoomSelected = selectedNode.type === "room" && selectedNode.id === room.id;
                                                              return (
                                                                <div 
                                                                  key={room.id}
                                                                  onClick={() => setSelectedNode({ type: "room", id: room.id })}
                                                                  className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-all ${isRoomSelected ? "bg-[#f0fdf4] text-[#16a34a] font-[700]" : "hover:bg-slate-50"}`}
                                                                >
                                                                  <Hotel className="w-3.5 h-3.5 text-slate-500" />
                                                                  <span>Room {room.name}</span>
                                                                </div>
                                                              );
                                                            })}
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel: Details View */}
      <div className="lg:col-span-2 space-y-4">
        {nodeDetails ? (
          nodeDetails.isRoom ? (
            /* ROOM DETAIL VIEW */
            roomForm && (
              <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
                  <div>
                    <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider">Room Detail Configuration</h3>
                    <p className="text-xs text-[#64748b]">Configure capacity, nurses, and status indicators</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveRoom} className="flex items-center gap-1.5">
                      <Save className="w-4 h-4" /> Save changes
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDeleteNode} className="flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4" /> Delete Room
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Room Number</label>
                    <Input
                      value={roomForm.name}
                      onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Room Type</label>
                    <Input
                      value={roomForm.type}
                      onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Floor Level</label>
                    <Input
                      value={roomForm.floor}
                      onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Assigned Nurse</label>
                    <select
                      value={roomForm.assignedNurse || ""}
                      onChange={(e) => setRoomForm({ ...roomForm, assignedNurse: e.target.value })}
                      className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-3 text-[13.5px]"
                    >
                      <option value="">Select Nurse...</option>
                      {state.staff.filter(s => s.role === "Nurse").map(n => (
                        <option key={n.id} value={n.name}>{n.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Cleaning Status</label>
                    <select
                      value={roomForm.cleaningStatus}
                      onChange={(e: any) => setRoomForm({ ...roomForm, cleaningStatus: e.target.value })}
                      className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-3 text-[13.5px]"
                    >
                      <option value="Clean">Clean</option>
                      <option value="Dirty">Dirty</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Capacity</label>
                      <Input
                        type="number"
                        min={0}
                        value={roomForm.capacity}
                        onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Current Occupancy</label>
                      <Input
                        disabled
                        value={roomForm.occupancy}
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Notes</label>
                    <textarea
                      value={roomForm.notes || ""}
                      onChange={(e) => setRoomForm({ ...roomForm, notes: e.target.value })}
                      rows={3}
                      placeholder="Add layout descriptions or specific room criteria..."
                      className="w-full rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white p-3 text-[13.5px] focus:outline-none focus:border-[#4CAF72]"
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            /* STANDARD NODE DETAILS & DIRECT CHILDREN */
            <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#f1f5f9] pb-3">
                <div>
                  <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider">{nodeDetails.title}</h3>
                  <p className="text-xs text-[#64748b] font-[600]">{nodeDetails.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setAddModalType(nodeDetails.childType || "");
                      setAddModalOpen(true);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Child
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteNode} className="flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>

              {/* Children Table */}
              <div className="space-y-2">
                <label className="text-[10px] font-[800] uppercase tracking-wider text-[#64748b]">Direct Layout Children</label>
                {(!nodeDetails.children || nodeDetails.children.length === 0) ? (
                  <div className="text-center p-8 border-2 border-dashed border-[#e2e8f0] rounded-[6px] text-xs text-[#94a3b8]">
                    No children nodes configured. Click "Add Child" to create layout components.
                  </div>
                ) : (
                  <div className="border border-[#e2e8f0] rounded-[6px] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[10px] uppercase text-[#64748b] font-[700] tracking-wider">
                          <th className="p-3">Child Name</th>
                          <th className="p-3">Description</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e2e8f0] text-[13px] font-[600]">
                        {(nodeDetails.children || []).map((child: any) => (
                          <tr key={child.id} className="hover:bg-slate-50/50">
                            <td className="p-3 text-[#0f172a] font-[700]">{child.name}</td>
                            <td className="p-3 text-[#64748b]">{child.subtitle}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedNode({
                                    type: nodeDetails.childType as any,
                                    id: child.id,
                                  });
                                }}
                                className="text-xs text-[#4CAF72] font-[700] hover:underline"
                              >
                                Configure Tree
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="bg-white border border-[#e2e8f0] rounded-[6px] p-6 text-center text-xs text-[#94a3b8] italic">
            Select a node from the layout tree to begin configuration.
          </div>
        )}
      </div>

      {/* Add Child Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setAddModalOpen(false)} />
          <form onSubmit={handleAddChildSubmit} className="bg-white border border-[#e2e8f0] rounded-[6px] p-5 max-w-md w-full relative z-10 space-y-4 shadow-xl">
            <h3 className="text-sm font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">
              Add New {addModalType === "building" ? "Building" : "Room"}
            </h3>

            <div>
              <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Name / Number *</label>
              <Input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder={addModalType === "building" ? "e.g. Block C" : "e.g. Room 104"}
                required
              />
            </div>

            {addModalType === "building" ? (
              <>
                <div>
                  <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Floors Count *</label>
                  <Input
                    type="number"
                    min={1}
                    value={addForm.floors}
                    onChange={(e) => setAddForm({ ...addForm, floors: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Wing (Optional)</label>
                  <Input
                    value={addForm.wing}
                    onChange={(e) => setAddForm({ ...addForm, wing: e.target.value })}
                    placeholder="e.g. South Wing"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Room Type</label>
                    <select
                      value={addForm.typeSelect}
                      onChange={(e) => setAddForm({ ...addForm, typeSelect: e.target.value })}
                      className="w-full h-[36px] rounded-[6px] border border-[#e2e8f0] bg-white px-2.5 text-[13px]"
                    >
                      {["General", "Semi Private", "Private", "Deluxe", "Suite", "Isolation", "OT", "Lab Room", "Emergency Room"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Bed Capacity</label>
                    <Input
                      type="number"
                      min={0}
                      value={addForm.capacity}
                      onChange={(e) => setAddForm({ ...addForm, capacity: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm">Create</Button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
