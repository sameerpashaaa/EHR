import { AlertTriangle } from 'lucide-react';
import { Claim } from '../_types/billing.types';

export function PriorAuthGate({ 
  claim, 
  onBlockSubmit 
}: { 
  claim: Claim; 
  onBlockSubmit: (blocked: boolean) => void;
}) {
  // If not needed or no PA info, just return null
  if (!claim.priorAuth?.required) return null;

  const pa = claim.priorAuth;
  const isBlocked = pa.status !== 'approved';
  
  // Inform parent if submit should be blocked
  // It's better to use a useEffect here to notify parent, but React warns about updating during render.
  // We can just render the UI and let the parent derive blocked status itself.

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-amber-800 flex items-center gap-2">
          Prior authorization required for CPT {pa.cptCode}
        </h4>
        <div className="mt-1 text-xs text-amber-700">
          {pa.status === 'approved' && (
            <span className="flex items-center gap-1.5">
              <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Approved</span>
              Auth #: <span className="font-mono">{pa.authNumber}</span>
            </span>
          )}
          {pa.status === 'pending' && (
            <span className="flex items-center gap-1.5">
              <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Awaiting approval</span>
              (Est. 3-5 business days)
            </span>
          )}
          {(pa.status === 'denied' || pa.status === 'expired' || !pa.status) && (
            <div className="flex items-center justify-between">
              <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium capitalize">
                {pa.status || 'Missing'}
              </span>
              <button className="bg-amber-500 text-white px-2 py-1 rounded hover:bg-amber-600 transition-colors">
                Request PA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
