import { TrendingUp } from 'lucide-react';
import { ArRecord, PayerProfile } from '../_types/billing.types';
import { useMemo } from 'react';

export function CashFlowProjection({
  arRecords,
  payers
}: {
  arRecords: ArRecord[];
  payers: PayerProfile[];
}) {
  const buckets = useMemo(() => {
    const b = { '30d': 0, '60d': 0, '90d': 0 };
    arRecords.forEach(record => {
      const payer = payers.find(p => p.name === record.payer);
      const avgDays = payer?.avgDaysToPay ?? 30;
      const expectedInDays = Math.max(0, avgDays - record.daysPending);

      if (expectedInDays <= 30) b['30d'] += record.balance;
      else if (expectedInDays <= 60) b['60d'] += record.balance;
      else b['90d'] += record.balance;
    });
    return b;
  }, [arRecords, payers]);

  const maxVal = Math.max(buckets['30d'], buckets['60d'], buckets['90d'], 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-green-600" />
        Expected cash collections forecast
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Expected in 0-30 Days</p>
          <p className="text-xl font-bold text-gray-900 mt-1">${buckets['30d'].toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Expected in 31-60 Days</p>
          <p className="text-xl font-bold text-gray-900 mt-1">${buckets['60d'].toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Expected in 61-90+ Days</p>
          <p className="text-xl font-bold text-gray-900 mt-1">${buckets['90d'].toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-end gap-3 h-24 mt-4 px-2">
        <div className="flex-1 bg-green-500 rounded-t-md transition-all duration-500 relative group" style={{ height: `${(buckets['30d'] / maxVal) * 100}%` }}>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">${buckets['30d'].toLocaleString()}</div>
          <p className="absolute top-full left-0 w-full text-[11px] text-gray-400 text-center mt-1">30 Days</p>
        </div>
        <div className="flex-1 bg-amber-400 rounded-t-md transition-all duration-500 relative group" style={{ height: `${(buckets['60d'] / maxVal) * 100}%` }}>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">${buckets['60d'].toLocaleString()}</div>
          <p className="absolute top-full left-0 w-full text-[11px] text-gray-400 text-center mt-1">60 Days</p>
        </div>
        <div className="flex-1 bg-red-400 rounded-t-md transition-all duration-500 relative group" style={{ height: `${(buckets['90d'] / maxVal) * 100}%` }}>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">${buckets['90d'].toLocaleString()}</div>
          <p className="absolute top-full left-0 w-full text-[11px] text-gray-400 text-center mt-1">90+ Days</p>
        </div>
      </div>
      
      <p className="text-[10px] text-gray-400 mt-6 italic text-center">Projections based on historical payer averages. Actual collections may vary.</p>
    </div>
  );
}
