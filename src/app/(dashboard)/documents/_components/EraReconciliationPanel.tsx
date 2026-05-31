import { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from './ToastContext';

export function EraReconciliationPanel() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handleImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setResults([
        { claimId: 'CLM-2024-0012', patient: 'John Smith', expected: 250, paid: 250, status: 'Reconciled', variance: 0 },
        { claimId: 'CLM-2024-0014', patient: 'Aravind Kumar', expected: 320, paid: 280, status: 'Underpayment flagged', variance: 40, reason: 'Contract rate mismatch' },
        { claimId: 'CLM-2024-0015', patient: 'Sunita Rao', expected: 150, paid: 150, status: 'Reconciled', variance: 0 },
      ]);
      setIsProcessing(false);
      toast({ type: 'success', message: 'ERA 835 file processed successfully' });
    }, 1400);
  };

  return (
    <div className="mb-6">
      {!results ? (
        <button 
          onClick={handleImport}
          disabled={isProcessing}
          className="bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg px-4 py-2 flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          {isProcessing ? <><Upload className="w-4 h-4 animate-bounce" /> Processing ERA...</> : <><Upload className="w-4 h-4" /> Import 835 ERA</>}
        </button>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4" /> 835 ERA processed
          </h3>
          
          <div className="bg-white border border-green-100 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-green-50/50 text-green-900 border-b border-green-100">
                <tr>
                  <th className="px-3 py-2 font-semibold">Claim ID</th>
                  <th className="px-3 py-2 font-semibold">Patient</th>
                  <th className="px-3 py-2 font-semibold">Expected</th>
                  <th className="px-3 py-2 font-semibold">Paid</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {results.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-mono text-gray-600">{r.claimId}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{r.patient}</td>
                    <td className="px-3 py-2 text-gray-600">${r.expected}</td>
                    <td className="px-3 py-2 font-bold text-gray-900">${r.paid}</td>
                    <td className="px-3 py-2">
                      {r.status === 'Reconciled' ? (
                        <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block">Reconciled</span>
                      ) : (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Underpayment flagged
                          </span>
                          <span className="text-[10px] text-gray-500">Paid ${r.paid}, expected ${r.expected}. Variance: ${r.variance}.</span>
                          <button className="text-[10px] text-blue-600 underline">Create appeal</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3 font-medium">3 claims auto-posted • $680 applied • 1 flag for review</p>
        </div>
      )}
    </div>
  );
}
