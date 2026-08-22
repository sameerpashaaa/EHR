"use client";

import React, { useState } from "react";
import { SessionUser } from "@/types";
import {
  Stethoscope,
  Activity,
  CheckCircle,
  Clock,
  ClipboardList,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
};

const MOCK_WORKLIST = [
  { id: "1", patient: "Sarah Johnson", room: "Room 1", task: "Vitals Capture", time: "10 min ago", priority: "NORMAL", status: "PENDING" },
  { id: "2", patient: "Emma Davis", room: "Room 3", task: "Blood Draw", time: "Just now", priority: "HIGH", status: "PENDING" },
  { id: "3", patient: "Michael Chen", room: "Waiting", task: "Rooming", time: "15 min ago", priority: "NORMAL", status: "IN_PROGRESS" },
  { id: "4", patient: "James Wilson", room: "Room 2", task: "Medication Admin", time: "1h ago", priority: "NORMAL", status: "COMPLETED" },
];

export function NurseDashboard({ user }: { user: SessionUser }) {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="min-h-screen p-6 relative overflow-hidden bg-[#f5f7fb]">
      <motion.div
        className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(76,175,114,0.15)", zIndex: 0 }}
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Welcome back, {user.name}
            </h1>
            <p className="text-slate-500 mt-2">Here is your clinical worklist for today.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/clinical/vitals" className="flex items-center gap-2 bg-[#4CAF72] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#3d915b] transition-all shadow-sm">
              <Activity className="w-4 h-4" /> Quick Vitals
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Worklist Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div style={CARD_STYLE} className="p-6 flex flex-col min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#4CAF72]" />
                  Task Worklist
                </h2>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button 
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Pending (2)
                  </button>
                  <button 
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Completed
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-3">
                  {MOCK_WORKLIST.filter(t => activeTab === 'pending' ? t.status !== 'COMPLETED' : t.status === 'COMPLETED').map((task) => (
                    <div key={task.id} className={`p-4 rounded-xl border flex items-center justify-between ${
                      task.status === 'IN_PROGRESS' ? 'border-blue-200 bg-blue-50/50' : 
                      task.priority === 'HIGH' && task.status === 'PENDING' ? 'border-red-200 bg-red-50/30' : 
                      'border-slate-100 bg-white hover:border-slate-200 transition-colors'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          {task.patient.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-800">{task.patient}</h4>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{task.room}</span>
                          </div>
                          <p className="text-sm font-medium text-[#4CAF72] mt-0.5">{task.task}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {task.priority === 'HIGH' && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                            <AlertCircle className="w-3 h-3" /> STAT
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" /> {task.time}
                        </span>
                        {task.status !== 'COMPLETED' ? (
                          <button className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                            Start
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-sm font-medium text-[#4CAF72]">
                            <CheckCircle className="w-4 h-4" /> Done
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {MOCK_WORKLIST.filter(t => activeTab === 'pending' ? t.status !== 'COMPLETED' : t.status === 'COMPLETED').length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                      <CheckCircle className="w-12 h-12 mb-3 text-slate-200" />
                      <p>All caught up!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Side Column */}
          <div className="flex flex-col gap-6">
            <div style={CARD_STYLE} className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Floor Status</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                  <p className="text-2xl font-bold text-slate-800">4</p>
                  <p className="text-xs text-slate-500 mt-1">Rooms Full</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                  <p className="text-2xl font-bold text-slate-800">2</p>
                  <p className="text-xs text-slate-500 mt-1">Waiting</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
