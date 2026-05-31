import { Wand2, Check } from 'lucide-react';
import { Claim } from '../_types/billing.types';
import { useState } from 'react';

const MODIFIER_RULES = [
  { cpt: '99213', modifier: '-25', reason: 'Separate E&M service on the same day as a procedure' },
  { cpt: '93306', modifier: '-26', reason: 'Professional component only — technical performed at facility' },
  { cpt: '27447', modifier: '-62', reason: 'Two surgeons required — co-surgeon scenario' },
];

export function ModifierOptimizationPanel({ 
  claim,
  onApplyModifier
}: { 
  claim: Claim;
  onApplyModifier: (cptCode: string, modifier: string) => void;
}) {
  const recommendations = claim.cptCodes.flatMap(c => {
    if (c.modifier) return []; // Already has a modifier
    const rule = MODIFIER_RULES.find(r => r.cpt === c.code);
    return rule ? [{ ...rule, applied: false }] : [];
  });

  const [appliedMods, setAppliedMods] = useState<string[]>([]);

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 mt-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Wand2 className="w-4 h-4 text-violet-600" />
        <h4 className="text-xs font-semibold text-violet-700">Modifier recommendations</h4>
      </div>
      
      <div className="space-y-0">
        {recommendations.map(rec => {
          const isApplied = appliedMods.includes(rec.cpt);
          return (
            <div key={rec.cpt} className="flex items-start gap-2 py-1.5 border-b border-violet-100 last:border-0">
              <span className="bg-violet-100 text-violet-700 text-xs rounded px-1.5 py-0.5 font-mono flex-shrink-0">
                {rec.cpt}
              </span>
              <div className="flex-1 text-xs text-gray-700">
                <span className="font-bold mr-1">{rec.modifier}</span> 
                {rec.reason}
              </div>
              {isApplied ? (
                <span className="text-xs text-green-600 flex items-center gap-1 flex-shrink-0">
                  <Check className="w-3 h-3" /> Applied
                </span>
              ) : (
                <button 
                  onClick={() => {
                    setAppliedMods([...appliedMods, rec.cpt]);
                    onApplyModifier(rec.cpt, rec.modifier);
                  }}
                  className="text-xs text-violet-600 hover:text-violet-800 underline flex-shrink-0"
                >
                  Apply
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
