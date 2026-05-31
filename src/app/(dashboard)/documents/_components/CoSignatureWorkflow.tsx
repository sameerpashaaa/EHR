import { useState } from 'react';
import { PenLine, X } from 'lucide-react';
import { ClinicalDocument } from '../_types/billing.types';
import { useToast } from './ToastContext';
import { useAuditLogger } from '../_hooks/useAuditLogger';

export function CoSignatureWorkflow({
  documents,
  setDocuments,
  logAudit,
}: {
  documents: ClinicalDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<ClinicalDocument[]>>;
  logAudit: (action: any, entity: any, entityId: string, entityLabel: string, details?: string) => void;
}) {
  const { toast } = useToast();
  const [signingDoc, setSigningDoc] = useState<ClinicalDocument | null>(null);
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [attested, setAttested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingDocs = documents.filter(doc => doc.coSignature?.status === 'pending');

  if (pendingDocs.length === 0) return null;

  const handleSign = () => {
    if (!signingDoc) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setDocuments(prev => prev.map(d => {
        if (d.id === signingDoc.id && d.coSignature) {
          return {
            ...d,
            coSignature: { ...d.coSignature, status: 'signed', signedAt: new Date().toISOString() },
            status: 'completed'
          };
        }
        return d;
      }));
      toast({ type: 'success', message: 'Document signed successfully' });
      logAudit('sign', 'document', signingDoc.id, signingDoc.title, 'Co-signature applied');
      setIsSubmitting(false);
      setSigningDoc(null);
      setAttested(false);
    }, 900);
  };

  const handleRejectSubmit = (docId: string) => {
    if (rejectReason.length < 20) return;
    setDocuments(prev => prev.map(d => {
      if (d.id === docId && d.coSignature) {
        return {
          ...d,
          coSignature: { ...d.coSignature, status: 'rejected' }
        };
      }
      return d;
    }));
    toast({ type: 'success', message: 'Document rejected' });
    setRejectingDocId(null);
    setRejectReason('');
  };

  return (
    <div className="mb-6">
      <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <PenLine className="w-[14px] h-[14px] text-[#D97706]" />
        <span>Co-signature queue</span>
        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full px-2 py-0.5">{pendingDocs.length}</span>
      </div>

      <div className="space-y-2">
        {pendingDocs.map(doc => (
          <div key={doc.id} className="bg-white border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{doc.title}</h4>
              <p className="text-xs text-gray-500 mt-0.5">Authored by {doc.versions[0]?.editedBy || 'System'} • Awaiting {doc.coSignature!.requiredBy}'s signature</p>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 mt-1.5 inline-block border border-amber-200">
                Awaiting co-signature
              </span>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {rejectingDocId === doc.id ? (
                <div className="flex items-center gap-2">
                  <textarea 
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Reason (min 20 chars)..."
                    className="text-xs border border-gray-300 rounded px-2 py-1 w-48 h-8 resize-none"
                  />
                  <button 
                    onClick={() => handleRejectSubmit(doc.id)}
                    disabled={rejectReason.length < 20}
                    className="text-xs text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-2 py-1 rounded"
                  >
                    Confirm
                  </button>
                  <button onClick={() => setRejectingDocId(null)} className="text-xs text-gray-500 underline">Cancel</button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setSigningDoc(doc)}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg px-3 py-1.5 font-medium transition-colors"
                  >
                    View & Sign
                  </button>
                  <button 
                    onClick={() => setRejectingDocId(doc.id)}
                    className="text-red-500 hover:text-red-700 text-xs underline px-2 py-1"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {signingDoc && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[640px] max-h-[80vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{signingDoc.title}</h3>
                <p className="text-sm text-gray-500">Patient: {signingDoc.patient} • Authored by {signingDoc.versions[0]?.editedBy || 'System'}</p>
              </div>
              <button onClick={() => setSigningDoc(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg p-4 leading-relaxed text-gray-800 flex-1 overflow-y-auto min-h-[200px]">
              {signingDoc.versions[signingDoc.versions.length - 1]?.content || 'No content available.'}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <label className="flex items-start gap-3 cursor-pointer text-sm text-green-900 font-medium">
                <input 
                  type="checkbox" 
                  checked={attested} 
                  onChange={e => setAttested(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-green-600 border-green-300 focus:ring-green-500"
                />
                I, {signingDoc.coSignature!.requiredBy}, have reviewed and approve this document as accurate and complete.
              </label>
            </div>

            <button 
              onClick={handleSign}
              disabled={!attested || isSubmitting}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 font-bold mt-4 disabled:opacity-40 transition-colors"
            >
              {isSubmitting ? 'Signing...' : 'Electronically Sign Document'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
