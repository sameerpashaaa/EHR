import { useState } from 'react';
import { Flag, TrendingUp, TrendingDown } from 'lucide-react';
import { PayerProfile } from '../_types/billing.types';
import { useToast } from './ToastContext';

export function PayerBenchmarkPanel({ payers }: { payers: PayerProfile[] }) {
  const { toast } = useToast();
  const [flaggedPayers, setFlaggedPayers] = useState<string[]>([]);

  const handleFlag = (id: string) => {
    setFlaggedPayers(prev => [...prev, id]);
    toast({ type: 'warning', message: 'Payer flagged for contract review' });
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Payer Performance Benchmarks</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {payers.map(payer => {
          const scoreColor = payer.performanceScore < 40 ? 'text-red-600' : payer.performanceScore < 70 ? 'text-amber-600' : 'text-green-600';
          const strokeColor = payer.performanceScore < 40 ? '#EF4444' : payer.performanceScore < 70 ? '#F59E0B' : '#10B981';
          const isFlagged = flaggedPayers.includes(payer.id);

          return (
            <div key={payer.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow relative">
              {isFlagged && <Flag className="absolute top-4 right-4 w-4 h-4 text-red-500 fill-red-500" />}
              
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="transparent" stroke="#F3F4F6" strokeWidth="4" />
                    <circle 
                      cx="24" cy="24" r="20" fill="transparent" stroke={strokeColor} strokeWidth="4" 
                      strokeDasharray={125.6} 
                      strokeDashoffset={125.6 - (125.6 * payer.performanceScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${scoreColor}`}>
                    {payer.performanceScore}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{payer.name}</h4>
                  <p className="text-xs text-gray-500">Performance Score</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Days to Pay</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-sm font-bold text-gray-900">{payer.avgDaysToPay}</span>
                    {payer.avgDaysToPay > payer.benchmarkDays ? (
                      <TrendingUp className="w-3 h-3 text-red-500" aria-label={`+${payer.avgDaysToPay - payer.benchmarkDays} vs benchmark`} />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Denial Rate</p>
                  <p className={`text-sm font-bold mt-1 ${payer.denialRate > 10 ? 'text-red-600' : 'text-gray-900'}`}>{payer.denialRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Underpay</p>
                  <p className={`text-sm font-bold mt-1 ${payer.underpaymentRate > 5 ? 'text-red-600' : 'text-gray-900'}`}>{payer.underpaymentRate}%</p>
                </div>
              </div>

              {payer.performanceScore < 60 && !isFlagged && (
                <button 
                  onClick={() => handleFlag(payer.id)}
                  className="w-full text-xs text-red-600 border border-red-200 rounded-md py-1.5 hover:bg-red-50 transition-colors font-medium"
                >
                  Flag for review
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
