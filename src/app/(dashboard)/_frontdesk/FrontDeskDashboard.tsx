"use client";

import React, { useState } from "react";
import { SessionUser } from "@/types";
import {
  Calendar as CalendarIcon,
  MessageSquare,
  UserCheck,
  CreditCard,
  Phone,
  Search,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
};

const MOCK_SCHEDULE = [
  { id: "1", patient: "James Wilson", doctor: "Dr. Smith", time: "09:00 AM", status: "CHECKED_IN", type: "Follow-up" },
  { id: "2", patient: "Emma Davis", doctor: "Dr. Johnson", time: "09:30 AM", status: "SCHEDULED", type: "New Patient" },
  { id: "3", patient: "Michael Chen", doctor: "Dr. Smith", time: "10:00 AM", status: "LATE", type: "Annual Physical" },
];

const MOCK_COMMS = [
  { id: "1", type: "message", sender: "Dr. Smith", text: "Please call Emma Davis to reschedule.", time: "10m ago" },
  { id: "2", type: "verification", sender: "System", text: "Insurance verification failed for James Wilson.", time: "1h ago" },
];

export function FrontDeskDashboard({ user }: { user: SessionUser }) {
  return (
    <div className="min-h-screen p-6 relative overflow-hidden bg-[#f5f7fb]">
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(59,130,246,0.15)", zIndex: 0 }}
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Welcome back, {user.name}
            </h1>
            <p className="text-slate-500 mt-2">Manage today's schedule and communications.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/patients/new" className="flex items-center gap-2 bg-[#4CAF72] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#3d915b] transition-all shadow-sm">
              <UserCheck className="w-4 h-4" /> Register Patient
            </Link>
            <Link href="/schedule" className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm">
              <Plus className="w-4 h-4" /> New Appointment
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Schedule Panel */}
          <div style={CARD_STYLE} className="p-6 flex flex-col min-h-[600px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
                Today's Schedule
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search patient..." 
                  className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              <div className="flex flex-col gap-3">
                {MOCK_SCHEDULE.map((apt) => (
                  <div key={apt.id} className="p-4 rounded-xl border border-slate-100 bg-white flex items-center justify-between hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className="text-center w-16">
                        <p className="text-sm font-bold text-slate-900">{apt.time}</p>
                      </div>
                      <div className="w-px h-8 bg-slate-200" />
                      <div>
                        <h4 className="font-semibold text-slate-800">{apt.patient}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-medium text-slate-700">{apt.doctor}</span>
                          <span>•</span>
                          <span>{apt.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        apt.status === 'CHECKED_IN' ? 'bg-[#4CAF72]/10 text-[#4CAF72]' :
                        apt.status === 'LATE' ? 'bg-red-100 text-red-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                      {apt.status === 'SCHEDULED' && (
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comms & Tasks Panel */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/insurance" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group">
                <CreditCard className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-slate-800">Insurance</h3>
                <p className="text-sm text-slate-500 mt-1">Verify eligibility & claims</p>
              </Link>
              <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                <Phone className="w-8 h-8 text-[#4CAF72] mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-slate-800">Calls</h3>
                <p className="text-sm text-slate-500 mt-1">3 missed calls</p>
              </div>
            </div>

            <div style={CARD_STYLE} className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  Communications & Alerts
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-4">
                  {MOCK_COMMS.map((comm) => (
                    <div key={comm.id} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        comm.type === 'message' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {comm.type === 'message' ? <MessageSquare className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-semibold text-slate-800 text-sm">{comm.sender}</h4>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {comm.time}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{comm.text}</p>
                        {comm.type === 'verification' && (
                          <button className="mt-3 text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                            Review Policy
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
