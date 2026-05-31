import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Claim } from '../_types/billing.types';
import { useToast } from './ToastContext';

export function BatchClaimSubmitter({
  claims,
  setClaims,
  logAudit
}: {
  claims: Claim[];
  setClaims: React.Dispatch<React.SetStateAction<Claim[]>>;
  logAudit: (action: any, entity: any, id: string, label: string) => void;
}) {
  const { toast } = useToast();
  
  // We manage our own selection state here, or it can be passed from parent if shared
  const draftClaims = claims.filter(c => c.status === 'Draft');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  // We should actually pass `selectedIds` from parent if we want to share the selection logic,
  // but for simplicity, we can manage it here and let the parent render checkboxes if it detects select mode.
  // Actually, the prompt says: "Add a Select All checkbox to the Claim Builder tab header... Same pattern as Bulk Operations in Documents tab".
  // Let's just return the bar here. The parent manages selection.
  return null;
}

// Since the prompt specifies the BatchSubmitter is just the bar:
export function BatchSubmitBar({
  selectedIds,
  setSelectedIds,
  claims,
  setClaims,
  logAudit
}: {
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  claims: Claim[];
  setClaims: React.Dispatch<React.SetStateAction<Claim[]>>;
  logAudit: (action: any, entity: any, id: string, label: string) => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  if (selectedIds.length < 2) return null;

  const totalAmount = selectedIds.reduce((sum, id) => {
    const claim = claims.find(c => c.id === id);
    return sum + (claim ? claim.totalCharge : 0);
  }, 0);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setProgress(0);
    
    for (let i = 0; i < selectedIds.length; i++) {
      const id = selectedIds[i];
      await new Promise(resolve => setTimeout(resolve, 700));
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Submitted', submittedAt: new Date().toISOString() } : c));
      logAudit('submit', 'claim', id, `Batch submitted claim ${id}`);
      setProgress(((i + 1) / selectedIds.length) * 100);
    }

    toast({ type: 'success', message: `Successfully submitted ${selectedIds.length} claims` });
    setIsSubmitting(false);
    setSelectedIds([]);
  };

  return (
    <div className="bg-gray-900 text-white rounded-xl px-5 py-3 flex items-center gap-4 mb-4 shadow-lg sticky top-0 z-20">
      <div className="text-sm font-medium whitespace-nowrap">
        {selectedIds.length} claims ready <span className="mx-2 text-gray-500">•</span> Total: ${totalAmount.toLocaleString()}
      </div>
      
      <div className="flex-1 px-4">
        {isSubmitting && (
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg px-4 py-1.5 font-bold transition-colors whitespace-nowrap flex items-center gap-2"
      >
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 animate-spin"/> Submitting...</>
        ) : (
          'Submit batch'
        )}
      </button>
    </div>
  );
}
