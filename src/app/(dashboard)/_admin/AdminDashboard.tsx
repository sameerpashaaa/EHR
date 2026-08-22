"use client";

import React from "react";
import { SessionUser } from "@/types";
import {
  Users,
  Settings,
  Shield,
  Activity,
  BarChart3,
  TrendingUp,
  Server
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
};

const STATS = [
  { label: "Total Patients", value: "1,245", trend: "+12%", color: "text-blue-600" },
  { label: "Active Staff", value: "48", trend: "+2%", color: "text-[#4CAF72]" },
  { label: "Today's Appts", value: "156", trend: "-5%", color: "text-amber-500" },
  { label: "System Uptime", value: "99.9%", trend: "0%", color: "text-purple-600" },
];

export function AdminDashboard({ user }: { user: SessionUser }) {
  return (
    <div className="min-h-screen p-6 relative overflow-hidden bg-[#f5f7fb]">
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(168,85,247,0.15)", zIndex: 0 }}
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Administrator Console
            </h1>
            <p className="text-slate-500 mt-2">System overview and facility management.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/settings" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-sm">
              <Settings className="w-4 h-4" /> System Settings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {STATS.map((stat, i) => (
            <div key={i} style={CARD_STYLE} className="p-6">
              <p className="text-sm font-medium text-slate-500 mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
                <span className={`text-sm font-semibold flex items-center gap-1 ${
                  stat.trend.startsWith('+') ? 'text-[#4CAF72]' : stat.trend.startsWith('-') ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {stat.trend.startsWith('+') && <TrendingUp className="w-4 h-4" />}
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Links Zone */}
          <div style={CARD_STYLE} className="p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" />
              Management Modules
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/users" className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-purple-200 hover:bg-purple-50/50 transition-all group">
                <Users className="w-8 h-8 text-slate-400 group-hover:text-purple-600 mb-3 transition-colors" />
                <h3 className="font-semibold text-slate-800">User Management</h3>
                <p className="text-xs text-slate-500 mt-1">Add or remove staff accounts</p>
              </Link>
              <Link href="/admin/practitioners" className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-purple-200 hover:bg-purple-50/50 transition-all group">
                <Activity className="w-8 h-8 text-slate-400 group-hover:text-purple-600 mb-3 transition-colors" />
                <h3 className="font-semibold text-slate-800">Practitioners</h3>
                <p className="text-xs text-slate-500 mt-1">Manage clinical credentials</p>
              </Link>
              <Link href="/facility/overview" className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-purple-200 hover:bg-purple-50/50 transition-all group">
                <Server className="w-8 h-8 text-slate-400 group-hover:text-purple-600 mb-3 transition-colors" />
                <h3 className="font-semibold text-slate-800">Facility Resources</h3>
                <p className="text-xs text-slate-500 mt-1">Beds, rooms, and equipment</p>
              </Link>
              <Link href="/reports" className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-purple-200 hover:bg-purple-50/50 transition-all group">
                <BarChart3 className="w-8 h-8 text-slate-400 group-hover:text-purple-600 mb-3 transition-colors" />
                <h3 className="font-semibold text-slate-800">System Reports</h3>
                <p className="text-xs text-slate-500 mt-1">Analytics and audit logs</p>
              </Link>
            </div>
          </div>

          {/* System Health Zone */}
          <div style={CARD_STYLE} className="p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#4CAF72]" />
              System Status
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="font-semibold text-slate-800">Database</h4>
                  <p className="text-sm text-slate-500">PostgreSQL Primary Cluster</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF72] animate-pulse" />
                  <span className="text-sm font-semibold text-[#4CAF72]">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="font-semibold text-slate-800">FHIR API</h4>
                  <p className="text-sm text-slate-500">Interoperability Gateway</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF72] animate-pulse" />
                  <span className="text-sm font-semibold text-[#4CAF72]">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="font-semibold text-slate-800">AI Services</h4>
                  <p className="text-sm text-slate-500">Voice Scribe & Diagnostic AI</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm font-semibold text-amber-600">Degraded</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
