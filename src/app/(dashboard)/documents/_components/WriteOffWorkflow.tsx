import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ArRecord } from '../_types/billing.types';
import { useToast } from './ToastContext';

export function WriteOffWorkflow({
  record,
  onClose,
  onComplete
}: {
  record: ArRecord;
  onClose: () => void;
  onComplete: (recordId: string, amount: number) => void;
}) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(record.balance.toString());
  const [reason, setReason] = useState('bad-debt');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'form' | 'pending' | 'approved'>('form');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('pending');
  };

  const handleApprove = () => {
    setStep('approved');
    setTimeout(() => {
      onComplete(record.id, parseFloat(amount));
      toast({ type: 'success', message: 'Write-off approved and applied' });
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Record write-off — {record.patient}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 mb-4">Outstanding balance: <span className="font-bold text-gray-900">${record.balance.toFixed(2)}</span></p>

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Write-off amount</label>
                <input 
                  type="number" 
                  max={record.balance} 
                  step="0.01" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="w-full text-sm border-gray-300 rounded focus:ring-green-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason code</label>
                <select 
                  value={reason} 
                  onChange={e => setReason(e.target.value)}
                  className="w-full text-sm border-gray-300 rounded focus:ring-green-500"
                >
                  <option value="bad-debt">Bad debt (uncollectible after attempts)</option>
                  <option value="small-balance">Small balance (&lt;$10, not cost-effective)</option>
                  <option value="contractual">Contractual adjustment</option>
                  <option value="charity">Charity / financial hardship</option>
                </select>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600 flex justify-between">
                <span>Approval required:</span>
                <span className="font-semibold text-gray-900">Requires: Dr. Anand Sharma</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Internal note</label>
                <textarea 
                  rows={2} 
                  value={note} 
                  onChange={e => setNote(e.target.value)}
                  className="w-full text-sm border-gray-300 rounded focus:ring-green-500 resize-none" 
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">Submit for approval</button>
              </div>
            </form>
          )}

          {step === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
              <p className="text-sm text-amber-800 font-medium mb-4">Pending supervisor approval from Dr. Anand Sharma...</p>
              <button 
                onClick={handleApprove}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Approve (simulate)
              </button>
            </div>
          )}

          {step === 'approved' && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-xl">✓</span>
              </div>
              <p className="text-green-800 font-semibold">Write-off applied successfully.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
