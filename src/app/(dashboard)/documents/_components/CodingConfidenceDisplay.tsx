import { AlertCircle } from 'lucide-react';
import { CptCode } from '../_types/billing.types';

export function CodingConfidenceDisplay({
  cpt
}: {
  cpt: CptCode;
}) {
  if (cpt.confidence === undefined) return null;

  const conf = cpt.confidence;
  const isHigh = conf >= 85;
  const isMed = conf >= 70 && conf < 85;
  const isLow = conf < 70;

  const textColor = isHigh ? 'text-green-700' : isMed ? 'text-amber-700' : 'text-red-600';
  const barColor = isHigh ? 'bg-green-500' : isMed ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-2 min-w-[120px] justify-end">
      <span className={`font-medium text-xs ${textColor} flex items-center gap-1`}>
        {conf}%
        {(isMed || isLow) && (
          <AlertCircle className="w-3 h-3" aria-label={isLow ? "Low confidence — physician review required" : "Review recommended"} />
        )}
      </span>
      <div className="w-16 h-1 rounded-full bg-gray-100 hidden sm:block">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${conf}%` }} />
      </div>
    </div>
  );
}
