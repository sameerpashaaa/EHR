"use client";

import React from "react";
import { CreditCard, ArrowLeft, Search, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
};

const MOCK_INSURANCE = [
  { id: "1", patient: "James Wilson", provider: "Blue Cross", status: "VERIFIED", expiry: "2026-12-31" },
  { id: "2", patient: "Emma Davis", provider: "Medicare", status: "PENDING", expiry: "2026-12-31" },
  { id: "3", patient: "Michael Chen", provider: "Aetna", status: "REJECTED", expiry: "2025-01-01" },
];

export default function InsurancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-6 relative overflow-hidden bg-[#f5f7fb]">
      <div className="max-w-[1200px] mx-auto w-full relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Insurance Verification
            </h1>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients or policies..." 
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 bg-white"
            />
          </div>
        </div>

        <div style={CARD_STYLE} className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="pb-4 font-semibold">Patient Name</th>
                  <th className="pb-4 font-semibold">Insurance Provider</th>
                  <th className="pb-4 font-semibold">Status</th>
                  <th className="pb-4 font-semibold">Expiry Date</th>
                  <th className="pb-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INSURANCE.map((ins) => (
                  <tr key={ins.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-900">{ins.patient}</td>
                    <td className="py-4 text-slate-600">{ins.provider}</td>
                    <td className="py-4">
                      {ins.status === 'VERIFIED' && <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-[#4CAF72]/10 text-[#4CAF72]"><CheckCircle className="w-3 h-3" /> {ins.status}</span>}
                      {ins.status === 'PENDING' && <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-700"><AlertCircle className="w-3 h-3" /> {ins.status}</span>}
                      {ins.status === 'REJECTED' && <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> {ins.status}</span>}
                    </td>
                    <td className="py-4 text-slate-600">{ins.expiry}</td>
                    <td className="py-4 text-right">
                      <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
