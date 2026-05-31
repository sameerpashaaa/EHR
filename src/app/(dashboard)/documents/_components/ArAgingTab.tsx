import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CountUp from 'react-countup';
import { ArRecord, PayerProfile } from '../_types/billing.types';
import { CashFlowProjection } from './CashFlowProjection';
import { EraReconciliationPanel } from './EraReconciliationPanel';
import { DenialHeatmap } from './DenialHeatmap';
import { PayerBenchmarkPanel } from './PayerBenchmarkPanel';
import { WriteOffWorkflow } from './WriteOffWorkflow';
import { useToast } from './ToastContext';

import { NaturalLanguageArQuery } from './NaturalLanguageArQuery';

// Dummy wrapper to avoid build errors if CountUp fails in some SSR context
function ClientOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  import('react').then(({ useEffect }) => useEffect(() => setMounted(true), []));
  return mounted ? <>{children}</> : <>{fallback}</>;
}

export function ArAgingTab({
  arRecords,
  setArRecords,
  payers,
  logAudit
}: {
  arRecords: ArRecord[];
  setArRecords: React.Dispatch<React.SetStateAction<ArRecord[]>>;
  payers: PayerProfile[];
  logAudit: (action: any, entity: any, id: string, label: string, details?: string) => void;
}) {
  const { toast } = useToast();
  const [writeOffRecord, setWriteOffRecord] = useState<ArRecord | null>(null);
  const [aiFilter, setAiFilter] = useState<string[] | null>(null);

  const bucketsData = [
    { bucket: "0-30", label: "0-30 Days", val: arRecords.filter(r => r.bucket === '0-30').reduce((s, r) => s + r.balance, 0), color: { border: "border-emerald-100", text: "text-[#12B76A]", bg: "bg-emerald-50/50" } },
    { bucket: "31-60", label: "31-60 Days", val: arRecords.filter(r => r.bucket === '31-60').reduce((s, r) => s + r.balance, 0), color: { border: "border-amber-100", text: "text-[#F59E0B]", bg: "bg-amber-50/50" } },
    { bucket: "61-90", label: "61-90 Days", val: arRecords.filter(r => r.bucket === '61-90').reduce((s, r) => s + r.balance, 0), color: { border: "border-orange-100", text: "text-orange-500", bg: "bg-orange-50/50" } },
    { bucket: "90+", label: "90+ Days (Critical)", val: arRecords.filter(r => r.bucket === '90+').reduce((s, r) => s + r.balance, 0), color: { border: "border-rose-200", text: "text-[#EF4444]", bg: "bg-rose-50/50" } },
  ];

  const handleWriteOffComplete = (id: string, amount: number) => {
    setArRecords(prev => prev.map(r => {
      if (r.id === id) {
        const newBalance = Math.max(0, r.balance - amount);
        return { ...r, balance: newBalance };
      }
      return r;
    }).filter(r => r.balance > 0));
    setWriteOffRecord(null);
    logAudit('edit', 'ar-record', id, `Write-off applied`, `Amount: ${amount}`);
  };

  const handleScheduleFollowUp = (id: string) => {
    // Just mock logging a follow-up
    setTimeout(() => {
      setArRecords(prev => prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            followUpHistory: [...r.followUpHistory, { id: Date.now().toString(), date: new Date().toLocaleDateString(), type: 'call', outcome: 'Followed up', user: 'System' }]
          };
        }
        return r;
      }));
      toast({ type: 'success', message: 'Follow-up logged successfully' });
    }, 500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <CashFlowProjection arRecords={arRecords} payers={payers} />
      
      <NaturalLanguageArQuery onFilter={setAiFilter} />
      
      {aiFilter && (
        <div className="flex gap-2 mb-4">
          <span className="bg-violet-100 text-violet-700 text-xs rounded-full px-3 py-1 font-medium flex items-center gap-1">
            Query applied: "{aiFilter[0]}"
            <button onClick={() => setAiFilter(null)} className="ml-2 font-bold hover:text-violet-900">×</button>
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {bucketsData.map((b) => (
          <div 
            key={b.bucket} 
            className={cn("bg-white border text-center p-5 rounded-[20px] transition-all hover:-translate-y-1")}
            style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.03)" }}
          >
            <p className="text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider mb-2">{b.label}</p>
            <div className="flex justify-center items-center gap-1.5">
              <p className={cn("text-2xl font-bold font-sora leading-none", b.color.text)}>
                ${b.val.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <EraReconciliationPanel />

      <DenialHeatmap />
      
      <PayerBenchmarkPanel payers={payers} />

      <div className="bg-white rounded-[24px] border overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#101828] text-base font-sora">Detailed Aging Report</h3>
            <p className="text-xs text-[#667085] mt-1 font-semibold">Real-time outstanding balances grouped by insurance provider aging.</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button variant="outline" className="gap-2 font-bold text-xs border-slate-200 text-[#475569] hover:bg-slate-50 rounded-[10px] h-9 px-4 shadow-sm"><Download className="w-3.5 h-3.5"/> CSV Export</Button>
            <Button 
              className="text-white font-bold text-xs gap-2 shadow-md hover:shadow-lg rounded-[10px] h-9 px-4 active:scale-95 transition-all bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              <RefreshCw className="w-3.5 h-3.5"/> Sync Payer Data
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-100">
              <tr>
                {["Claim #", "Patient", "Payer", "DOS", "Total Billed", "Balance", "Bucket", "Follow-ups", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[9px] font-bold text-[#98A2B3] uppercase tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {arRecords.map((item) => {
                  const shouldEscalate = item.daysPending > 90 && item.followUpHistory.length >= 3;
                  return (
                    <motion.tr key={item.id} layout exit={{ opacity: 0, height: 0 }} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-[#06B6D4] whitespace-nowrap">
                        <span className="bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-[4px]">{item.claimId}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-[#101828] whitespace-nowrap">{item.patient}</td>
                      <td className="px-5 py-4 font-semibold text-[#667085] whitespace-nowrap">{item.payer}</td>
                      <td className="px-5 py-4 font-semibold text-[#94a3b8] whitespace-nowrap">{item.dos}</td>
                      <td className="px-5 py-4 font-bold text-[#101828] whitespace-nowrap">${item.billed.toLocaleString()}</td>
                      <td className="px-5 py-4 font-bold text-[#EF4444] whitespace-nowrap">${item.balance.toLocaleString()}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider border", 
                          item.bucket === "0-30" ? "bg-emerald-50 text-[#12B76A] border-emerald-100" :
                          item.bucket === "31-60" ? "bg-amber-50 text-[#F59E0B] border-amber-100" :
                          item.bucket === "61-90" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-rose-50 text-[#EF4444] border-rose-100"
                        )}>
                          {item.bucket}
                        </span>
                        {shouldEscalate && (
                          <span className="block mt-1 bg-red-50 border border-red-200 rounded px-2 py-0.5 text-[9px] text-red-700 font-bold uppercase tracking-wide">
                            Auto-escalate Rec.
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-600 text-[10px] rounded-full px-2 py-0.5 font-bold">{item.followUpHistory.length} contacts</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleScheduleFollowUp(item.id)} className="text-xs text-blue-600 hover:text-blue-800 underline">Log Follow-up</button>
                          {item.bucket === "90+" && (
                            <button onClick={() => setWriteOffRecord(item)} className="text-[10px] text-gray-500 border border-gray-200 rounded-md px-2 py-1 hover:bg-gray-50 font-semibold">Write-off</button>
                          )}
                          {shouldEscalate && (
                            <button className="text-[10px] text-red-600 border border-red-200 rounded-md px-2 py-1 hover:bg-red-50 font-semibold">Collections</button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {writeOffRecord && (
        <WriteOffWorkflow 
          record={writeOffRecord} 
          onClose={() => setWriteOffRecord(null)} 
          onComplete={handleWriteOffComplete} 
        />
      )}
    </motion.div>
  );
}
