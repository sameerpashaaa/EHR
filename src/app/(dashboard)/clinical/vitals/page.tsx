"use client";

import React from "react";
import { Activity, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
};

export default function VitalsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-6 relative overflow-hidden bg-[#f5f7fb]">
      <div className="max-w-[800px] mx-auto w-full relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Capture Vitals
            </h1>
          </div>
          <button className="flex items-center gap-2 bg-[#4CAF72] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#3d915b] transition-all shadow-sm">
            <Save className="w-4 h-4" /> Save Record
          </button>
        </div>

        <div style={CARD_STYLE} className="p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xl">
              S
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Sarah Johnson</h2>
              <p className="text-sm text-slate-500">DOB: 1985-04-12 • Room 1</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Blood Pressure (mmHg)</label>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="120" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF72]/50" />
                <span className="text-xl text-slate-400">/</span>
                <input type="text" placeholder="80" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF72]/50" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Heart Rate (bpm)</label>
              <input type="number" placeholder="72" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF72]/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Temperature (°F)</label>
              <input type="number" placeholder="98.6" step="0.1" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF72]/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Respiratory Rate (breaths/min)</label>
              <input type="number" placeholder="16" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF72]/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">O2 Saturation (%)</label>
              <input type="number" placeholder="99" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF72]/50" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Weight (lbs)</label>
              <input type="number" placeholder="150" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF72]/50" />
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Clinical Notes</label>
            <textarea rows={3} placeholder="Add any relevant observations..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF72]/50"></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
