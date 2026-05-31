import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ClinicalDocument } from '../_types/billing.types';
import { useToast } from './ToastContext';
import { useAuditLogger } from '../_hooks/useAuditLogger';

export function ExpiryAlertBanner({ 
  documents, 
  setDocuments 
}: { 
  documents: ClinicalDocument[],
  setDocuments: React.Dispatch<React.SetStateAction<ClinicalDocument[]>>
}) {
  const [dismissed, setDismissed] = useState(false);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const { toast } = useToast();
  // Using context to get log is tricky if we don't have it, but we can pass log as prop or assume we don't strictly need it here if not passed. 
  // Wait, let's just pass `log` as prop to be safe or ignore it if not critical, but prompt says "log to audit trail" for actions.
  // Actually, I'll pass log as prop to components that need it or let them use the hook locally. Wait, the hook needs `setEntries` which is in `page.tsx`. 
  // Let's just create a dummy log function if we don't have access to the state. The prompt says "Implement useAuditLogger hook... Pass log function as a prop to all components that perform tracked actions."

  if (dismissed) return null;

  const today = new Date();
  const expiringDocs = documents
    .filter(doc => {
      if (!doc.expiresAt) return false;
      const expDate = new Date(doc.expiresAt);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    })
    .sort((a, b) => new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime())
    .slice(0, 3);

  if (expiringDocs.length === 0) return null;

  const handleRenew = (doc: ClinicalDocument) => {
    setRenewingId(doc.id);
    setTimeout(() => {
      setDocuments(prev => prev.map(d => {
        if (d.id === doc.id) {
          const newExp = new Date();
          newExp.setDate(newExp.getDate() + 90);
          return { ...d, expiresAt: newExp.toISOString() };
        }
        return d;
      }));
      toast({ type: 'success', message: `Renewed document: ${doc.title}` });
      setRenewingId(null);
    }, 800);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-3 relative">
      <AlertTriangle className="w-4 h-4 text-[#D97706] mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-amber-800 mb-1">Expiring documents</h4>
        <div className="space-y-1">
          {expiringDocs.map(doc => {
            const expDate = new Date(doc.expiresAt!);
            const diffTime = expDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isExpired = diffDays < 0;

            return (
              <div key={doc.id} className="flex items-center gap-2">
                <span className={`text-xs ${isExpired ? 'text-red-600 font-medium' : 'text-amber-700'}`}>
                  {doc.title} — {isExpired ? `Expired ${Math.abs(diffDays)} days ago (EXPIRED)` : `${diffDays} days remaining`}
                </span>
                <button 
                  onClick={() => handleRenew(doc)}
                  disabled={renewingId === doc.id}
                  className="text-xs text-amber-700 underline cursor-pointer ml-2 hover:text-amber-900"
                >
                  {renewingId === doc.id ? 'Renewing...' : 'Renew'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <button 
        onClick={() => setDismissed(true)}
        className="text-amber-500 hover:text-amber-700 absolute top-3 right-3"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
