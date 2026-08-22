"use client";

import React from "react";
import { Pill, Check, X } from "lucide-react";

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
};

const MOCK_REFILLS = [
  { id: "1", patient: "Robert Smith", med: "Lisinopril 10mg", time: "2h ago" },
  { id: "2", patient: "Maria Garcia", med: "Metformin 500mg", time: "4h ago" },
];

export function RefillQueue() {
  return (
    <div style={CARD_STYLE} className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Pill className="w-5 h-5 text-[#4CAF72]" />
          Refill Requests
        </h2>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">
          {MOCK_REFILLS.length} New
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        {MOCK_REFILLS.map((refill) => (
          <div key={refill.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-[#4CAF72]/30 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-bold text-slate-900">{refill.patient}</p>
                <p className="text-xs text-slate-500">{refill.time}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-700 mb-3">{refill.med}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-[#4CAF72]/10 text-[#4CAF72] hover:bg-[#4CAF72]/20 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                <Check className="w-3 h-3" /> Approve
              </button>
              <button className="flex-1 bg-slate-100 text-slate-600 hover:bg-slate-200 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                <X className="w-3 h-3" /> Deny
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 text-sm text-[#4CAF72] font-semibold hover:bg-[#4CAF72]/5 rounded-lg transition-colors">
        View All Requests
      </button>
    </div>
  );
}
