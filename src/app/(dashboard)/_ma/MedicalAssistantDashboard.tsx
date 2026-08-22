"use client";

import React, { useState } from "react";
import { SessionUser } from "@/types";
import {
  ClipboardList,
  Activity,
  UserCheck,
  FileText,
  CheckCircle,
  Clock,
  ChevronRight
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
  { id: "1", patient: "James Wilson", task: "Rooming", type: "rooming", time: "10:00 AM", status: "PENDING" },
  { id: "2", patient: "Emma Davis", task: "Vitals Capture", type: "vitals", time: "10:15 AM", status: "PENDING" },
  { id: "3", patient: "Sarah Johnson", task: "Intake Questionnaire", type: "docs", time: "10:30 AM", status: "PENDING" },
  { id: "4", patient: "Michael Chen", task: "Rooming", type: "rooming", time: "09:30 AM", status: "COMPLETED" },
];

export function MedicalAssistantDashboard({ user }: { user: SessionUser }) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredWorklist = MOCK_WORKLIST.filter(task => {
    if (activeTab === "all") return task.status === "PENDING";
    if (activeTab === "completed") return task.status === "COMPLETED";
    return task.type === activeTab && task.status === "PENDING";
  });

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
            <p className="text-slate-500 mt-2">Here is your daily worklist.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/clinical/vitals" className="flex items-center gap-2 bg-[#4CAF72] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#3d915b] transition-all shadow-sm">
              <Activity className="w-4 h-4" /> Capture Vitals
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Worklist Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div style={CARD_STYLE} className="p-6 flex flex-col min-h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#4CAF72]" />
                  MA Worklist
                </h2>
              </div>
              
              <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  All Tasks
                </button>
                <button 
                  onClick={() => setActiveTab('rooming')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'rooming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <UserCheck className="w-4 h-4" /> Rooming
                </button>
                <button 
                  onClick={() => setActiveTab('vitals')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'vitals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Activity className="w-4 h-4" /> Vitals
                </button>
                <button 
                  onClick={() => setActiveTab('docs')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'docs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FileText className="w-4 h-4" /> Docs
                </button>
                <button 
                  onClick={() => setActiveTab('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Completed
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-3">
                  {filteredWorklist.map((task) => (
                    <div key={task.id} className={`p-4 rounded-xl border flex items-center justify-between ${
                      task.status === 'COMPLETED' ? 'border-slate-100 bg-slate-50 opacity-70' : 'border-slate-200 bg-white hover:border-[#4CAF72]/50 transition-colors'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          task.type === 'rooming' ? 'bg-blue-100 text-blue-600' :
                          task.type === 'vitals' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {task.type === 'rooming' && <UserCheck className="w-5 h-5" />}
                          {task.type === 'vitals' && <Activity className="w-5 h-5" />}
                          {task.type === 'docs' && <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800">{task.patient}</h4>
                          <p className="text-sm font-medium text-slate-500">{task.task}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1 text-sm font-medium text-slate-600">
                          <Clock className="w-4 h-4" /> {task.time}
                        </span>
                        {task.status !== 'COMPLETED' ? (
                          <button className="flex items-center gap-1 text-sm font-semibold text-[#4CAF72] hover:bg-[#4CAF72]/10 px-3 py-1.5 rounded-lg transition-colors">
                            Start <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-sm font-bold text-[#4CAF72]">
                            <CheckCircle className="w-5 h-5" /> Done
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredWorklist.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                      <CheckCircle className="w-12 h-12 mb-3 text-slate-200" />
                      <p>No tasks found in this category.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Side Column */}
          <div className="flex flex-col gap-6">
            <div style={CARD_STYLE} className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Summary</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-500"/> Roomed</span>
                  <span className="font-bold text-slate-900">4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2"><Activity className="w-4 h-4 text-red-500"/> Vitals Pending</span>
                  <span className="font-bold text-slate-900">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center gap-2"><FileText className="w-4 h-4 text-amber-500"/> Intakes Pending</span>
                  <span className="font-bold text-slate-900">1</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
