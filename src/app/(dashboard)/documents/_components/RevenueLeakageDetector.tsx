import { useState } from 'react';
import { FileX, TrendingDown, CircleDollarSign, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LEAKAGE_FINDINGS = [
  { id: 'l1', type: 'unbilled-encounter', patient: 'Aravind Kumar', date: '2024-11-28', description: 'Encounter documented (ENC-088) but no claim created.', estimatedValue: 2800, action: 'Create claim' },
  { id: 'l2', type: 'under-coded', patient: 'Lakshmi Devi', date: '2024-11-30', description: 'Documentation supports 99214 (Level 4 E&M) but 99213 was billed.', estimatedValue: 1200, action: 'Upgrade code' },
  { id: 'l3', type: 'missed-charge', patient: 'Rajan Mehta', date: '2024-12-01', description: 'Lab order (CBC, CMP) placed during visit but not billed.', estimatedValue: 1800, action: 'Add charge' }
];

export function RevenueLeakageDetector({
  onClose
}: {
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [findings, setFindings] = useState(LEAKAGE_FINDINGS);

  // Scan simulation
  import('react').then(({ useEffect }) => {
    useEffect(() => {
      const steps = [
        "Scanning encounter records...",
        "Checking for unbilled visits...",
        "Comparing documentation to billed E&M levels...",
        "Flagging missed ancillary charges...",
        "Analysis complete."
      ];
      
      let curr = 0;
      const interval = setInterval(() => {
        curr++;
        setStep(curr);
        if (curr >= steps.length - 1) clearInterval(interval);
      }, 400);
      return () => clearInterval(interval);
    }, []);
  });

  const handleResolve = (id: string) => {
    setResolvedIds([...resolvedIds, id]);
    setTimeout(() => {
      setFindings(findings.filter(f => f.id !== id));
    }, 700);
  };

  const totalRecovery = findings.reduce((sum, f) => sum + f.estimatedValue, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="bg-white border border-gray-200 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-lg pointer-events-auto flex flex-col max-h-[85vh]"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-sora">Revenue Leakage Detector</h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">AI-powered E&M and charge capture audit</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          {step < 4 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-violet-800">
                {[
                  "Scanning encounter records...",
                  "Checking for unbilled visits...",
                  "Comparing documentation to billed E&M levels...",
                  "Flagging missed ancillary charges..."
                ][step]}
              </p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {findings.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-900">No revenue leakage detected!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {findings.map(f => {
                      const isResolved = resolvedIds.includes(f.id);
                      return (
                        <motion.div key={f.id} layout exit={{ opacity: 0, height: 0, overflow: 'hidden' }} className="border border-gray-200 rounded-xl p-4 flex items-start gap-4">
                          <div className="mt-1">
                            {f.type === 'unbilled-encounter' && <FileX className="w-5 h-5 text-red-500"/>}
                            {f.type === 'under-coded' && <TrendingDown className="w-5 h-5 text-amber-500"/>}
                            {f.type === 'missed-charge' && <CircleDollarSign className="w-5 h-5 text-orange-500"/>}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900">{f.patient} <span className="text-gray-400 font-normal ml-1">• {f.date}</span></h4>
                            <p className="text-xs text-gray-600 mt-1">{f.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-700">${f.estimatedValue.toLocaleString()}</p>
                            {isResolved ? (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-[10px] text-green-600 font-bold flex items-center justify-end gap-1">
                                <CheckCircle className="w-3 h-3"/> Resolved
                              </motion.div>
                            ) : (
                              <button onClick={() => handleResolve(f.id)} className="mt-2 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg px-3 py-1.5 transition-colors">
                                {f.action}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {step >= 4 && findings.length > 0 && (
          <div className="p-4 bg-green-50 border-t border-green-100 flex justify-between items-center">
            <span className="text-sm font-bold text-green-900">Total estimated recoverable:</span>
            <span className="text-lg font-bold font-sora text-green-700">${totalRecovery.toLocaleString()}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
