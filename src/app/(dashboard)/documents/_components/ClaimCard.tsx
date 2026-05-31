import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Receipt, ChevronUp, ChevronDown, Send, RefreshCw, Printer, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Claim } from '../_types/billing.types';
import { PriorAuthGate } from './PriorAuthGate';
import { PredictiveDenialMeter } from './PredictiveDenialMeter';
import { ModifierOptimizationPanel } from './ModifierOptimizationPanel';
import { CodingConfidenceDisplay } from './CodingConfidenceDisplay';
import { AppealTemplateLibrary } from './AppealTemplateLibrary';
import { useToast } from './ToastContext';

export function ClaimCard({
  claim,
  setClaims,
  logAudit,
  selected,
  onToggleSelect,
  isSelectMode
}: {
  claim: Claim;
  setClaims: React.Dispatch<React.SetStateAction<Claim[]>>;
  logAudit: (action: any, entity: any, id: string, label: string) => void;
  selected?: boolean;
  onToggleSelect?: () => void;
  isSelectMode?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [submitBlocked, setSubmitBlocked] = useState(false);
  const { toast } = useToast();

  const statusConfig: Record<string, { color: string; label: string }> = {
    Draft: { color: "bg-slate-100 text-[#475569] border border-slate-200", label: "Draft" },
    Submitted: { color: "bg-blue-50 text-[#185FA5] border border-blue-100", label: "Submitted" },
    Accepted: { color: "bg-cyan-50 text-[#06B6D4] border border-cyan-100", label: "Accepted" },
    Denied: { color: "bg-rose-50 text-[#EF4444] border border-rose-100", label: "Denied" },
    Paid: { color: "bg-emerald-50 text-[#12B76A] border border-emerald-100", label: "Paid" },
    Partial: { color: "bg-amber-50 text-[#F59E0B] border border-amber-100", label: "Partial Pay" },
  };
  const cfg = statusConfig[claim.status] || statusConfig.Draft;

  const handleApplyModifier = (cptCode: string, modifier: string) => {
    setClaims(prev => prev.map(c => {
      if (c.id === claim.id) {
        return {
          ...c,
          cptCodes: c.cptCodes.map(code => code.code === cptCode ? { ...code, modifier } : code)
        };
      }
      return c;
    }));
    toast({ type: 'success', message: `Applied modifier ${modifier} to ${cptCode}` });
  };

  const handleSubmitAppeal = (claimId: string, content: string) => {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: 'Submitted' } : c));
    toast({ type: 'success', message: `Appeal sent to payer` });
    logAudit('appeal', 'claim', claimId, `Appealed claim ${claimId}`);
    setShowAppealModal(false);
  };

  const handleFinalize = () => {
    setClaims(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'Submitted', submittedAt: new Date().toISOString() } : c));
    toast({ type: 'success', message: `Claim ${claim.id} submitted` });
    logAudit('submit', 'claim', claim.id, `Submitted claim ${claim.id}`);
  };

  const hasLowConfidence = claim.cptCodes.some(c => c.confidence !== undefined && c.confidence < 80);
  const isSubmissionBlocked = submitBlocked || (hasLowConfidence && claim.status === 'Draft');

  return (
    <>
      <div 
        className={cn("bg-white rounded-[20px] border transition-all overflow-hidden relative",
          isSelectMode && "cursor-pointer",
          isSelectMode && selected ? "border-green-500 bg-green-50/60 ring-1 ring-green-400" :
          isSelectMode && !selected ? "hover:border-green-300 hover:bg-green-50/30" : ""
        )}
        style={!isSelectMode ? {
          border: expanded ? "1px solid rgba(29, 158, 117, 0.4)" : "1px solid rgba(255,255,255,0.60)",
          boxShadow: expanded ? "0 10px 30px rgba(0,0,0,0.08)" : "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)"
        } : {}}
      >
        {isSelectMode && (
          <div className="absolute top-5 left-5 z-10">
            <input 
              type="checkbox" 
              checked={selected} 
              readOnly 
              className="w-4 h-4 rounded text-green-600 border-gray-300 pointer-events-none"
            />
          </div>
        )}

        <div className={cn("absolute top-3 right-3 flex items-center gap-2", expanded ? "hidden" : "flex")}>
          {claim.eraStatus === '277-acknowledged' && (
            <span className="bg-blue-100 text-blue-700 text-[10px] rounded-full px-2 py-0.5 font-bold">277 Ack</span>
          )}
          {claim.eraStatus === '835-received' && (
            <span className="bg-green-100 text-green-700 text-[10px] rounded-full px-2 py-0.5 font-bold">Payment Recv</span>
          )}
          <div className={cn("p-1.5 rounded-full flex items-center justify-center", 
            claim.eligibility?.verified ? "bg-green-50 text-green-600" : 
            claim.eligibility?.coverageStatus === 'inactive' ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-400"
          )} title={claim.eligibility?.verified ? "Eligibility Verified" : "Eligibility Not Verified"}>
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className={cn("p-5 cursor-pointer flex items-start justify-between gap-4", isSelectMode && "pl-12")} onClick={() => {
          if (isSelectMode) onToggleSelect?.();
          else setExpanded(!expanded);
        }}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-[14px] bg-[#f8fafc] border border-slate-100 flex items-center justify-center shadow-sm flex-shrink-0">
              {claim.status === "Draft" ? <Zap className="w-5 h-5 text-amber-500 fill-amber-500/10" /> : <Receipt className="w-5 h-5 text-[#64748b]" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#101828] text-[15px] font-sora">{claim.id}</span>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border", cfg.color)}>{cfg.label}</span>
                {claim.status === "Denied" && <span className="text-xs font-semibold text-[#EF4444] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 flex items-center gap-1">{claim.denialCode}: {claim.denialReason}</span>}
                {claim.status === "Draft" && <span className="text-xs font-semibold text-amber-600 bg-amber-50/50 px-2.5 py-0.5 rounded-full border border-amber-200/50 flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500"/> AI Built</span>}
              </div>
              <p className="text-[13px] font-semibold text-[#475569] mt-1.5">{claim.patient} • <span className="text-[#94a3b8] font-normal">DOS: {claim.dos}</span></p>
              <p className="text-[11px] text-[#94a3b8] font-semibold mt-0.5 uppercase tracking-wider">{claim.payer} • {claim.provider}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p className="text-[18px] font-bold text-[#101828] font-sora">${claim.totalCharge.toFixed(2)}</p>
              {claim.paidAmount !== undefined && <p className="text-xs font-bold text-[#12B76A] mt-0.5">Paid: ${claim.paidAmount.toFixed(2)}</p>}
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f8fafc] flex items-center justify-center border border-slate-100 hover:bg-[#e2e8f0] transition-colors mt-2">
              {expanded ? <ChevronUp className="w-4 h-4 text-[#94a3b8]" /> : <ChevronDown className="w-4 h-4 text-[#94a3b8]" />}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-t border-slate-100 bg-[#f8fafc]/50"
            >
              <div className="p-5 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider mb-3 font-sora">Diagnosis Codes (ICD-10)</h4>
                  <div className="space-y-2">
                    {claim.icdCodes.map((c) => (
                      <div key={c.code} className="flex items-start gap-3 bg-white p-3 rounded-[12px] border border-slate-100 shadow-sm">
                        <span className="font-mono text-[11px] font-bold text-[#06B6D4] bg-cyan-50 px-2 py-0.5 rounded-[6px] border border-cyan-100 flex-shrink-0">{c.code}</span>
                        <span className="text-[13px] text-[#475569] font-semibold leading-tight pt-0.5">{c.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider font-sora">Procedure Codes (CPT)</h4>
                  </div>
                  <div className="space-y-2">
                    {claim.cptCodes.map((c) => (
                      <div key={c.code} className="flex items-center justify-between bg-white p-3 rounded-[12px] border border-slate-100 shadow-sm gap-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-mono text-[11px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-[6px] border border-violet-100 flex-shrink-0">
                            {c.code} {c.modifier && <span className="text-violet-400 ml-1">-{c.modifier}</span>}
                          </span>
                          <span className="text-[13px] text-[#475569] font-semibold truncate max-w-[140px]" title={c.description}>{c.description}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <CodingConfidenceDisplay cpt={c} />
                          <span className="font-bold text-[#101828] text-[13px] w-12 text-right">${c.charge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <PriorAuthGate claim={claim} onBlockSubmit={setSubmitBlocked} />
                  {claim.status === 'Draft' && <ModifierOptimizationPanel claim={claim} onApplyModifier={handleApplyModifier} />}
                  {claim.status === 'Draft' && <PredictiveDenialMeter claim={claim} />}
                </div>
              </div>
              
              <div className="px-5 pb-5 flex items-center justify-end gap-3 flex-wrap">
                {claim.status === "Draft" && (
                  <div className="flex flex-col items-end">
                    <Button 
                      onClick={handleFinalize}
                      disabled={isSubmissionBlocked}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2 shadow-md hover:shadow-lg font-semibold rounded-[10px] text-xs h-9 px-4 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isSubmissionBlocked ? "Resolve issues before submitting" : ""}
                    >
                      <Send className="w-3.5 h-3.5" /> Finalize & Submit Claim
                    </Button>
                    {isSubmissionBlocked && hasLowConfidence && (
                      <button onClick={() => {
                        if (confirm("Submitting low-confidence codes may increase denial risk. Proceed?")) {
                          handleFinalize();
                        }
                      }} className="text-[10px] text-gray-500 underline mt-1.5 hover:text-gray-700">
                        Override and submit
                      </button>
                    )}
                  </div>
                )}
                {claim.status === "Denied" && (
                  <Button 
                    onClick={() => setShowAppealModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white gap-2 shadow-md hover:shadow-lg font-semibold rounded-[10px] text-xs h-9 px-4 active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Appeal Template Library
                  </Button>
                )}
                <Button variant="outline" className="gap-2 font-semibold border-slate-200 hover:bg-slate-50 text-[#475569] text-xs rounded-[10px] h-9 px-4">
                  <Printer className="w-3.5 h-3.5" /> print CMS-1500
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAppealModal && (
          <AppealTemplateLibrary claim={claim} onClose={() => setShowAppealModal(false)} onSubmitAppeal={handleSubmitAppeal} />
        )}
      </AnimatePresence>
    </>
  );
}
