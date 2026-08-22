"use client";

import React, { useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { 
  Calendar, 
  FlaskConical, 
  Pill, 
  FileText, 
  ChevronRight,
  Clock,
  Activity,
  CreditCard
} from "lucide-react";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
};

const MOCK_APPOINTMENTS = [
  { id: "1", doctor: "Dr. Sarah Johnson", date: "Oct 15, 2026", time: "09:00 AM", type: "Follow-up", status: "Upcoming" },
  { id: "2", doctor: "Dr. Michael Chen", date: "Sep 01, 2026", time: "10:30 AM", type: "Annual Physical", status: "Past" },
];

const MOCK_RECORDS = [
  { id: "1", title: "Visit Summary", date: "Sep 01, 2026", doctor: "Dr. Michael Chen" },
  { id: "2", title: "Vaccination Record", date: "Jan 12, 2026", doctor: "Clinic Nurse" },
];

const MOCK_LABS = [
  { id: "1", test: "Comprehensive Metabolic Panel", date: "Sep 01, 2026", status: "Normal" },
  { id: "2", test: "Lipid Panel", date: "Sep 01, 2026", status: "Borderline" },
];

export default function PatientPortalHome() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className={`space-y-6 ${plusJakarta.className}`}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Here's a summary of your health information.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 rounded-t-lg font-medium transition-colors ${activeTab === "overview" ? "bg-white border-t border-l border-r border-slate-200 text-[#4CAF72] mb-[-1px] shadow-sm relative top-[1px]" : "text-slate-500 hover:text-slate-800"}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab("appointments")}
          className={`px-5 py-2.5 rounded-t-lg font-medium transition-colors ${activeTab === "appointments" ? "bg-white border-t border-l border-r border-slate-200 text-[#4CAF72] mb-[-1px] shadow-sm relative top-[1px]" : "text-slate-500 hover:text-slate-800"}`}
        >
          Appointments
        </button>
        <button 
          onClick={() => setActiveTab("records")}
          className={`px-5 py-2.5 rounded-t-lg font-medium transition-colors ${activeTab === "records" ? "bg-white border-t border-l border-r border-slate-200 text-[#4CAF72] mb-[-1px] shadow-sm relative top-[1px]" : "text-slate-500 hover:text-slate-800"}`}
        >
          Health Records
        </button>
        <button 
          onClick={() => setActiveTab("labs")}
          className={`px-5 py-2.5 rounded-t-lg font-medium transition-colors ${activeTab === "labs" ? "bg-white border-t border-l border-r border-slate-200 text-[#4CAF72] mb-[-1px] shadow-sm relative top-[1px]" : "text-slate-500 hover:text-slate-800"}`}
        >
          Lab Results
        </button>
      </div>

      <div className="pt-4">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div style={CARD_STYLE} className="p-6 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Next Appointment</h3>
                <p className="text-slate-500 mt-1">Oct 15, 2026 at 09:00 AM</p>
              </div>
              <button onClick={() => setActiveTab('appointments')} className="text-blue-600 font-medium hover:text-blue-700 transition-colors mt-auto pt-2 flex items-center gap-1">
                View Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div style={CARD_STYLE} className="p-6 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Recent Lab Results</h3>
                <p className="text-slate-500 mt-1">Metabolic Panel (Sep 01)</p>
              </div>
              <button onClick={() => setActiveTab('labs')} className="text-purple-600 font-medium hover:text-purple-700 transition-colors mt-auto pt-2 flex items-center gap-1">
                View Results <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div style={CARD_STYLE} className="p-6 flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#4CAF72]/10 text-[#4CAF72] flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Active Medications</h3>
                <p className="text-slate-500 mt-1">You have 1 active prescription.</p>
              </div>
              <button className="text-[#4CAF72] font-medium hover:text-[#3d915b] transition-colors mt-auto pt-2 flex items-center gap-1">
                Request Refill <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div style={CARD_STYLE} className="p-6 md:col-span-2 lg:col-span-3 flex flex-col lg:flex-row justify-between items-center gap-6 mt-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Current Balance</h3>
                  <p className="text-slate-500">You have an outstanding balance of $45.00</p>
                </div>
              </div>
              <button className="w-full lg:w-auto bg-[#4CAF72] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#3d915b] transition-all shadow-sm">
                Make a Payment
              </button>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div style={CARD_STYLE} className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Your Appointments</h2>
              <button className="bg-[#4CAF72] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3d915b] transition-all">
                Schedule New
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {MOCK_APPOINTMENTS.map(apt => (
                <div key={apt.id} className="p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#4CAF72]/50 transition-colors bg-white">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-center min-w-[80px]">
                      <p className="text-xs text-slate-500 font-semibold">{apt.date.split(' ')[0]}</p>
                      <p className="text-lg font-bold text-slate-900">{apt.date.split(' ')[1].replace(',', '')}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{apt.type}</h3>
                      <p className="text-slate-500">{apt.doctor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Clock className="w-4 h-4" /> {apt.time}
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${apt.status === 'Upcoming' ? 'bg-[#4CAF72]/10 text-[#4CAF72]' : 'bg-slate-100 text-slate-600'}`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "records" && (
          <div style={CARD_STYLE} className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Health Records</h2>
            <div className="flex flex-col gap-4">
              {MOCK_RECORDS.map(record => (
                <div key={record.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors bg-white cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{record.title}</h3>
                      <p className="text-slate-500 text-sm">{record.date} • {record.doctor}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "labs" && (
          <div style={CARD_STYLE} className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Lab Results</h2>
            <div className="flex flex-col gap-4">
              {MOCK_LABS.map(lab => (
                <div key={lab.id} className="p-4 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-200 hover:bg-purple-50/20 transition-colors bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{lab.test}</h3>
                      <p className="text-slate-500 text-sm">Collected on: {lab.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${lab.status === 'Normal' ? 'bg-[#4CAF72]/10 text-[#4CAF72]' : 'bg-amber-100 text-amber-700'}`}>
                      {lab.status}
                    </span>
                    <button className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
