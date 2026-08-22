"use client";

import React, { useState, useEffect } from "react";
import { useFacility } from "@/contexts/FacilityContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Save, Award, Phone, Clock, MapPin, Building, ShieldCheck
} from "lucide-react";

export default function HospitalProfilePage() {
  const { state, updateHospitalProfile } = useFacility();
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    registrationNumber: "",
    nabhAccreditation: "Yes" as "Yes" | "No" | "In Progress",
    type: "General",
    address: "",
    emergencyContact: "",
    workingHoursFrom: "08:00",
    workingHoursTo: "20:00",
  });

  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (state.hospitalProfile) {
      setForm({
        name: state.hospitalProfile.name || "",
        logoUrl: state.hospitalProfile.logoUrl || "",
        registrationNumber: state.hospitalProfile.registrationNumber || "",
        nabhAccreditation: state.hospitalProfile.nabhAccreditation || "No",
        type: state.hospitalProfile.type || "General",
        address: state.hospitalProfile.address || "",
        emergencyContact: state.hospitalProfile.emergencyContact || "",
        workingHoursFrom: state.hospitalProfile.workingHoursFrom || "08:00",
        workingHoursTo: state.hospitalProfile.workingHoursTo || "20:00",
      });
    }
  }, [state.hospitalProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateHospitalProfile(form);
    
    // Show success toast
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-[800] text-[#0f172a] tracking-tight">Hospital Configuration Profile</h2>
          <p className="text-xs text-[#64748b]">Configure accrediting boards, logo branding, and standard work slot timings</p>
        </div>
        {form.nabhAccreditation === "Yes" && (
          <div className="bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] text-xs font-[700] px-3.5 py-1.5 rounded-[6px] flex items-center gap-1.5 shadow-sm animate-fadeIn">
            <Award className="w-4 h-4 text-[#22c55e]" />
            <span>NABH Accredited</span>
          </div>
        )}
      </div>

      {/* Success Toast */}
      {toastVisible && (
        <div className="bg-[#f0fdf4] border border-[#dcfce7] text-[#16a34a] text-xs px-4 py-3 rounded-[6px] flex items-center gap-2 shadow-md animate-slideDown">
          <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
          <div>
            <p className="font-[700]">Configuration Profile Saved</p>
            <p className="text-[11px] text-[#64748b] mt-0.5">Facility parameters have been written to Metapharsic EHR core state.</p>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#e2e8f0] rounded-[6px] p-6 space-y-5 shadow-sm">
        <h3 className="text-xs font-[800] text-[#0f172a] uppercase tracking-wider border-b border-[#f1f5f9] pb-2">Hospital Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Hospital Name *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Logo URL (Optional)</label>
            <Input
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://domain.com/logo.png"
            />
          </div>

          <div>
            <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Registration Number</label>
            <Input
              value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">NABH Accreditation Status</label>
            <select
              value={form.nabhAccreditation}
              onChange={(e: any) => setForm({ ...form, nabhAccreditation: e.target.value })}
              className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-3 text-[13.5px] font-[600]"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Hospital Classification Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-3 text-[13.5px] font-[600]"
            >
              <option value="General">General</option>
              <option value="Multi Specialty">Multi Specialty</option>
              <option value="Super Specialty">Super Specialty</option>
              <option value="Clinic">Clinic</option>
              <option value="Trauma Center">Trauma Center</option>
              <option value="Children's Hospital">Children's Hospital</option>
              <option value="Teaching Hospital">Teaching Hospital</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Physical Address *</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              className="w-full rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white p-3 text-[13.5px] focus:outline-none focus:border-[#4CAF72] font-[600]"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Emergency Line *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Working From</label>
              <input
                type="time"
                value={form.workingHoursFrom}
                onChange={(e) => setForm({ ...form, workingHoursFrom: e.target.value })}
                className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] px-3 text-[13.5px] font-[600]"
              />
            </div>
            <div>
              <label className="text-[11px] font-[700] text-[#64748b] uppercase tracking-wider block mb-1">Working To</label>
              <input
                type="time"
                value={form.workingHoursTo}
                onChange={(e) => setForm({ ...form, workingHoursTo: e.target.value })}
                className="w-full h-[38px] rounded-[6px] border-[1.5px] border-[#e2e8f0] px-3 text-[13.5px] font-[600]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#f1f5f9]">
          <Button type="submit" className="flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Save Profile Details
          </Button>
        </div>
      </form>
    </div>
  );
}
