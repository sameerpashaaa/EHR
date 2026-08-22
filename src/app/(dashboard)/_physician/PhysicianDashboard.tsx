"use client";

import React, { useState } from "react";
import { SessionUser } from "@/types";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Pill,
  FileText,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { RefillQueue } from "./RefillQueue";

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
};

const MOCK_QUEUE = [
  { id: "1", time: "09:00 AM", patientName: "Sarah Johnson", type: "Follow-up", status: "WAITING", urgency: "NORMAL" },
  { id: "2", time: "09:30 AM", patientName: "Michael Chen", type: "Annual Physical", status: "IN_PROGRESS", urgency: "NORMAL" },
  { id: "3", time: "10:00 AM", patientName: "Emma Davis", type: "Lab Results", status: "PLANNED", urgency: "HIGH" },
  { id: "4", time: "11:00 AM", patientName: "James Wilson", type: "Sick Visit", status: "PLANNED", urgency: "NORMAL" },
];

export function PhysicianDashboard({ user }: { user: SessionUser }) {
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <div className="min-h-screen p-6 relative overflow-hidden bg-[#f5f7fb]">
      {/* Decorative Orbs */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(76,175,114,0.15)", zIndex: 0 }}
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Good Morning, Dr. {user.name?.split(' ')[1] || 'Physician'}
            </h1>
            <p className="text-slate-500 mt-2">Here's what you need to do today.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/prescribe" className="flex items-center gap-2 bg-[#4CAF72] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#3d915b] transition-all shadow-sm">
              <Pill className="w-4 h-4" /> e-Prescribe
            </Link>
            <Link href="/reports" className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm">
              <FileText className="w-4 h-4" /> Notes
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column: Queue & Active Chart */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Active / Next Patient */}
            <div style={CARD_STYLE} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Currently Seeing</h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  In Progress
                </span>
              </div>
              
              <div className="flex gap-6">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-10 h-10 text-slate-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">Michael Chen</h3>
                  <div className="flex gap-4 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 09:30 AM - 10:00 AM</span>
                    <span className="flex items-center gap-1"><Stethoscope className="w-4 h-4" /> Annual Physical</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Last BP</p>
                      <p className="font-semibold text-slate-800">120/80</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Heart Rate</p>
                      <p className="font-semibold text-slate-800">72 bpm</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Allergies</p>
                      <p className="font-semibold text-red-600">Penicillin</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-slate-900 text-white rounded-xl py-2.5 font-medium hover:bg-slate-800 transition-colors">
                      Open Chart
                    </button>
                    <button className="flex-1 bg-white border border-slate-200 text-slate-700 rounded-xl py-2.5 font-medium hover:bg-slate-50 transition-colors">
                      Start AI Scribe
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Queue */}
            <div style={CARD_STYLE} className="flex-1 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Today's Schedule</h2>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button 
                    onClick={() => setActiveTab('schedule')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    All (12)
                  </button>
                  <button 
                    onClick={() => setActiveTab('waiting')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'waiting' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Waiting (3)
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="flex flex-col gap-3">
                  {MOCK_QUEUE.map((apt) => (
                    <div key={apt.id} className={`p-4 rounded-xl border flex items-center justify-between ${
                      apt.status === 'IN_PROGRESS' ? 'border-blue-200 bg-blue-50/50' : 
                      apt.status === 'WAITING' ? 'border-[#4CAF72]/30 bg-[#4CAF72]/5' : 'border-slate-100 bg-white'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="text-center w-16">
                          <p className="text-sm font-bold text-slate-900">{apt.time.split(' ')[0]}</p>
                          <p className="text-xs text-slate-500">{apt.time.split(' ')[1]}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div>
                          <h4 className="font-semibold text-slate-800">{apt.patientName}</h4>
                          <p className="text-sm text-slate-500">{apt.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {apt.urgency === 'HIGH' && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md">
                            <AlertCircle className="w-3 h-3" /> High Priority
                          </span>
                        )}
                        {apt.status === 'WAITING' && (
                          <span className="text-xs font-semibold text-[#4CAF72] bg-[#4CAF72]/10 px-2 py-1 rounded-md">
                            Ready in Room 2
                          </span>
                        )}
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Insights & Tasks */}
          <div className="flex flex-col gap-6">
            <RefillQueue />
            
            <div style={CARD_STYLE} className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Pending Tasks</h2>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="mt-0.5 text-amber-500"><AlertCircle className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Sign Lab Results</p>
                    <p className="text-xs text-slate-500">4 patients</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="mt-0.5 text-blue-500"><FileText className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Incomplete Notes</p>
                    <p className="text-xs text-slate-500">2 encounters from yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
