import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ClinicalDocument, DocumentStatus } from '../_types/billing.types';
import { useToast } from './ToastContext';

export function BulkOperationsBar({
  selectedIds,
  setSelectedIds,
  setDocuments,
}: {
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setDocuments: React.Dispatch<React.SetStateAction<ClinicalDocument[]>>;
}) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast({ type: 'success', message: `Downloaded ${selectedIds.length} documents as ZIP` });
      setSelectedIds([]);
    }, 1200);
  };

  const handleArchive = () => {
    setDocuments(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, status: 'archived' } : d));
    toast({ type: 'success', message: `Archived ${selectedIds.length} documents` });
    setSelectedIds([]);
    setShowConfirm(false);
  };

  const handleVerify = () => {
    setDocuments(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, status: 'verified' } : d));
    toast({ type: 'success', message: `Marked ${selectedIds.length} documents as Verified` });
    setSelectedIds([]);
  };

  const handleChangeStatus = (status: DocumentStatus) => {
    setDocuments(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, status } : d));
    toast({ type: 'success', message: `Changed status of ${selectedIds.length} documents to ${status}` });
    setSelectedIds([]);
    setStatusDropdownOpen(false);
  };

  return (
    <>
      <div className="bg-gray-900 text-white rounded-lg px-4 py-2.5 flex items-center gap-3 text-sm mb-3 sticky top-0 z-20">
        <span className="font-medium">{selectedIds.length} selected</span>
        
        <button 
          onClick={handleDownload}
          className="bg-white/10 hover:bg-white/20 rounded-md px-3 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          {downloading && <Loader2 className="w-3 h-3 animate-spin" />}
          Download ZIP
        </button>

        <button 
          onClick={() => setShowConfirm(true)}
          className="bg-white/10 hover:bg-white/20 rounded-md px-3 py-1 text-xs font-medium transition-colors"
        >
          Archive
        </button>

        <button 
          onClick={handleVerify}
          className="bg-white/10 hover:bg-white/20 rounded-md px-3 py-1 text-xs font-medium transition-colors"
        >
          Mark Verified
        </button>

        <div className="relative">
          <button 
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className="bg-white/10 hover:bg-white/20 rounded-md px-3 py-1 text-xs font-medium transition-colors"
          >
            Change Status
          </button>
          {statusDropdownOpen && (
            <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 shadow-lg rounded-lg py-1 w-32 z-30">
              {(['draft', 'completed', 'verified', 'archived'] as DocumentStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => handleChangeStatus(status)}
                  className="block w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 capitalize"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={() => setSelectedIds([])}
          className="text-gray-400 hover:text-white text-xs ml-auto transition-colors"
        >
          Clear
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-5 w-80 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
            <h3 className="text-base font-semibold text-gray-900">Archive Documents</h3>
            <p className="text-sm text-gray-600 mt-1.5 mb-4">Are you sure you want to archive {selectedIds.length} documents?</p>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowConfirm(false)}
                className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleArchive}
                className="bg-red-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-red-600 font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
