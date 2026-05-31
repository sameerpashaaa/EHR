import { Gauge } from 'lucide-react';
import { Claim, DenialScore } from '../_types/billing.types';

export function PredictiveDenialMeter({ claim }: { claim: Claim }) {
  if (!claim.denialScore) return null;

  const { score, reasons, suggestions } = claim.denialScore;

  const fillColor = score <= 30 ? 'bg-green-500' : score <= 60 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score <= 30 ? 'text-green-700' : score <= 60 ? 'text-amber-700' : 'text-red-700';

  return (
    <div className="bg-gray-50 rounded-lg p-3 mt-3 border border-gray-200">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        <Gauge className="w-[13px] h-[13px]" />
        Denial risk assessment
      </div>
      
      <div className="flex items-center gap-3">
        <div className="h-2 rounded-full bg-gray-200 flex-1 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${fillColor}`} 
            style={{ width: `${score}%` }} 
          />
        </div>
        <span className={`text-sm font-bold ${textColor}`}>{score}/100</span>
      </div>

      {reasons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {reasons.map((r, i) => (
            <span key={i} className="text-[11px] bg-white border border-gray-200 rounded-full px-2 py-0.5 text-gray-600">
              {r}
            </span>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-2 space-y-1">
          {suggestions.map((s, i) => (
            <p key={i} className="text-xs text-gray-600 flex gap-1.5">
              <span className="text-amber-600">→</span> {s}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
