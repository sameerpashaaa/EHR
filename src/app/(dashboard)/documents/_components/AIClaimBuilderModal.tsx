import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Activity, DollarSign, ShieldCheck, FileCheck2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Claim } from '../_types/billing.types';

export function AIClaimBuilderModal({ 
  onClose, 
  onComplete 
}: { 
  onClose: () => void;
  onComplete: (claim: Claim) => void;
}) {
  const [eligibilityState, setEligibilityState] = useState<'checking' | 'verified' | 'inactive'>('checking');
  const [step, setStep] = useState(-1);

  const steps = [
    { text: "Scanning recent clinical notes...", icon: Search },
    { text: "Extracting ICD-10 diagnosis codes...", icon: Activity },
    { text: "Determining optimal CPT E&M levels...", icon: DollarSign },
    { text: "Validating against NCCI edits...", icon: ShieldCheck },
    { text: "Claim assembled successfully.", icon: FileCheck2 }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setEligibilityState('verified'); // Simulate successful check
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (eligibilityState !== 'verified' || step === -2) return;
    
    let currentStep = -1; // -1 means eligibility checked but generation hasn't started
    // Auto-start generation after 800ms of seeing the verified screen
    const startTimer = setTimeout(() => {
      setStep(0);
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
          setStep(currentStep);
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete({
              id: `CLM-2024-${Math.floor(Math.random() * 1000).toString().padStart(4, "0")}`,
              patient: "Michael Brown",
              patientId: "P12347",
              payer: "Aetna",
              dos: new Date().toISOString().split("T")[0],
              provider: "Dr. Sarah Chen",
              icdCodes: [{ code: "J01.90", description: "Acute sinusitis, unspecified", primary: true }],
              cptCodes: [{ code: "99213", description: "Office Visit, Est. Patient", units: 1, charge: 180, confidence: 95 }],
              totalCharge: 180,
              status: "Draft",
              notes: [],
              eligibility: {
                verified: true, verifiedAt: new Date().toISOString(),
                copay: 20, deductibleMet: 500, deductibleTotal: 1500, oopRemaining: 2500,
                coverageStatus: 'active', payer: 'Aetna', planName: 'Choice POS II',
                groupNumber: 'GRP-1122', memberId: 'AET-112233'
              }
            });
          }, 1200);
        }
      }, 1200);
      return () => clearInterval(interval);
    }, 1500);
    
    return () => clearTimeout(startTimer);
  }, [eligibilityState, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="bg-white/95 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/80 w-full max-w-md overflow-hidden relative p-6 pt-10 pb-8"
      >
        <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] rounded-full blur-[40px] pointer-events-none bg-emerald-500/10" />
        <div className="absolute bottom-[-50px] left-[-50px] w-[150px] h-[150px] rounded-full blur-[40px] pointer-events-none bg-cyan-500/10" />
        
        {eligibilityState === 'checking' && (
          <div className="text-center relative z-10 py-10">
            <ShieldCheck className="w-16 h-16 text-blue-500 mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-gray-900 mt-6">Verifying patient eligibility...</h3>
            <p className="text-sm text-gray-500 mt-2">Connecting to payer clearinghouse.</p>
          </div>
        )}

        {eligibilityState === 'verified' && step < 0 && (
          <div className="text-center relative z-10 py-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-green-900">Eligibility confirmed</h3>
                <span className="ml-auto bg-green-100 text-green-700 text-xs rounded-full px-2 py-0.5 font-medium">Active</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-700">
                <p>Payer: <span className="font-medium text-gray-900">Aetna</span></p>
                <p>Plan: <span className="font-medium text-gray-900">Choice POS II</span></p>
                <p>Member ID: <span className="font-medium text-gray-900">AET-112233</span></p>
                <p>Group #: <span className="font-medium text-gray-900">GRP-1122</span></p>
                <p>Copay: <span className="font-medium text-gray-900">$20</span></p>
                <p>Deductible: <span className="font-medium text-gray-900">$500 / $1500</span></p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 animate-pulse">Initializing claim generation...</p>
          </div>
        )}

        {step >= 0 && (
          <div className="text-center relative z-10">
            <div className="w-16 h-16 rounded-[20px] mx-auto flex items-center justify-center mb-6 relative shadow-lg" style={{ background: "linear-gradient(135deg, #1D9E75, #06B6D4)" }}>
              {step < steps.length - 1 ? (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              ) : (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
              )}
              <div className="absolute -inset-2 rounded-[24px] border border-cyan-400/30 animate-ping" style={{ animationDuration: "1.5s" }} />
            </div>
            
            <h3 className="text-xl font-bold text-[#101828] mb-2 font-sora">Metta AI Claim Builder</h3>
            <p className="text-[#667085] text-sm mb-8 h-10 font-medium">Intelligent coding from raw consultation data</p>

            <div className="space-y-3 text-left">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isPast = idx < step;
                const isCurrent = idx === step;
                if (idx > step) return null;
                
                return (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className={cn("flex items-center gap-3 p-3 rounded-[12px] border transition-all duration-300", 
                      isPast ? "bg-slate-50 border-slate-100 text-[#667085]" :
                      isCurrent ? "bg-[#E1F5EE] border-[#1D9E75]/20 text-[#0F6E56] font-medium" : "hidden"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isPast ? "text-[#98A2B3]" : "text-[#1D9E75]")} />
                    <span className="text-sm">{s.text}</span>
                    {isCurrent && <span className="ml-auto flex w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />}
                    {isPast && <CheckCircle className="ml-auto w-4 h-4 text-[#12B76A]" />}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
