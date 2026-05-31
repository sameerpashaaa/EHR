import { useState } from 'react';
import { ShieldCheck, AlertTriangle, Plus, FileText, RefreshCw, X, Loader2 } from 'lucide-react';
import { PriorAuthRequest } from '../_types/billing.types';
import { useToast } from './ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export function PriorAuthHub({
  priorAuths,
  setPriorAuths,
  logAudit
}: {
  priorAuths: PriorAuthRequest[];
  setPriorAuths: React.Dispatch<React.SetStateAction<PriorAuthRequest[]>>;
  logAudit: (action: any, entity: any, id: string, label: string) => void;
}) {
  const { toast } = useToast();
  const [showNewModal, setShowNewModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = {
    total: priorAuths.length,
    approved: priorAuths.filter(p => p.status === 'approved').length,
    pending: priorAuths.filter(p => p.status === 'pending').length,
    attention: priorAuths.filter(p => p.status === 'denied' || p.status === 'expired').length,
  };

  const expiringPAs = priorAuths.filter(p => p.daysRemaining !== undefined && p.daysRemaining <= 5);

  const filteredPAs = priorAuths.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchTerm && !p.cptCode.includes(searchTerm) && !p.patient.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleReauthorize = (id: string, patient: string) => {
    toast({ type: 'info', message: `Re-authorization submitted for ${patient}` });
    setPriorAuths(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'pending', submittedAt: new Date().toISOString(), expiresAt: undefined };
      }
      return p;
    }));
    logAudit('submit', 'prior-auth', id, `Re-authorized PA for ${patient}`);
  };

  const handleNewSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newId = `PA-${Date.now()}`;
    const patient = fd.get('patient') as string;
    
    setPriorAuths([{
      id: newId,
      patient,
      patientId: 'P-NEW',
      payer: fd.get('payer') as string,
      cptCode: fd.get('cpt') as string,
      icdCode: fd.get('icd') as string,
      status: 'pending',
      submittedAt: new Date().toISOString()
    }, ...priorAuths]);
    
    setShowNewModal(false);
    toast({ type: 'success', message: 'Prior authorization request submitted' });
    logAudit('create', 'prior-auth', newId, `Requested PA for ${patient}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-sora">Prior authorization hub</h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">Track, manage, and request prior authorizations across all payers</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-bold flex items-center gap-2 shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" /> New PA request
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", val: stats.total, color: "text-gray-900" },
          { label: "Approved", val: stats.approved, color: "text-green-600" },
          { label: "Pending", val: stats.pending, color: "text-amber-600" },
          { label: "Expired / Denied", val: stats.attention, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-bold font-sora mt-1 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {expiringPAs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-800">Urgent: {expiringPAs.length} authorizations expiring within 5 days or expired. Renew immediately to avoid claim denials.</h4>
            <div className="mt-2 space-y-2">
              {expiringPAs.map(p => (
                <div key={p.id} className="flex items-center gap-4 text-xs">
                  <span className="font-semibold text-red-700 w-32 truncate">{p.patient}</span>
                  <span className="font-mono bg-white px-1.5 rounded text-red-600 border border-red-100">{p.cptCode}</span>
                  <span className="text-red-600 font-medium">
                    {p.daysRemaining! < 0 ? `Expired ${Math.abs(p.daysRemaining!)} days ago` : `${p.daysRemaining} days remaining`}
                  </span>
                  <button 
                    onClick={() => handleReauthorize(p.id, p.patient)}
                    className="ml-auto bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg px-3 py-1 transition-colors shadow-sm"
                  >
                    Re-authorize
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {['all', 'pending', 'approved', 'denied', 'expired'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition-colors ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 w-full">
          <input 
            type="text" 
            placeholder="Search CPT code or patient..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPAs.map(pa => {
          const borderColor = 
            pa.status === 'approved' ? 'border-green-300 bg-green-50/20' : 
            pa.status === 'pending' ? 'border-amber-300 bg-amber-50/20' : 
            pa.status === 'denied' ? 'border-red-300 bg-red-50/20' : 'border-gray-300 bg-gray-50/20';
            
          const badgeColor = 
            pa.status === 'approved' ? 'bg-green-100 text-green-700' : 
            pa.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
            pa.status === 'denied' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';

          return (
            <div key={pa.id} className={`bg-white border-2 rounded-xl p-4 shadow-sm flex flex-col h-full ${borderColor}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-gray-900">{pa.patient}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                  {pa.status}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 font-medium mb-3 flex-1 space-y-1">
                <p>Payer: <span className="text-gray-900">{pa.payer}</span></p>
                <p>CPT: <span className="font-mono text-gray-700 bg-white border border-gray-200 px-1 rounded">{pa.cptCode}</span></p>
                <p>ICD: <span className="font-mono text-gray-700 bg-white border border-gray-200 px-1 rounded">{pa.icdCode}</span></p>
              </div>

              {pa.status === 'approved' && (
                <div className="bg-white border border-green-200 rounded-lg p-2 mb-3 shadow-sm">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    <span>Auth #</span>
                    <span>Expires In</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-green-700">{pa.authNumber}</span>
                    <span className={`text-xs font-bold ${pa.daysRemaining && pa.daysRemaining <= 5 ? 'text-red-600 flex items-center gap-1' : 'text-gray-900'}`}>
                      {pa.daysRemaining && pa.daysRemaining <= 5 && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>}
                      {pa.daysRemaining} days
                    </span>
                  </div>
                </div>
              )}
              {pa.status === 'approved' && (
                <div className="flex items-center gap-1 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"/>
                  <div className="h-0.5 flex-1 bg-green-200"/>
                  <div className="w-2 h-2 rounded-full bg-green-500"/>
                  <div className="h-0.5 flex-1 bg-green-200"/>
                  <div className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-200"/>
                </div>
              )}
              {pa.status === 'pending' && (
                <div className="flex items-center gap-1 mb-3 opacity-60">
                  <div className="w-2 h-2 rounded-full bg-amber-500"/>
                  <div className="h-0.5 flex-1 bg-amber-200"/>
                  <div className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200 animate-pulse"/>
                  <div className="h-0.5 flex-1 bg-gray-200"/>
                  <div className="w-2 h-2 rounded-full bg-gray-300"/>
                </div>
              )}

              <p className="text-[10px] text-gray-400 font-medium mb-3">Submitted: {new Date(pa.submittedAt).toLocaleDateString()}</p>

              <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                {pa.status === 'approved' && (
                  <>
                    {pa.claimId && <button className="flex-1 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg py-1.5 border border-gray-200 transition-colors">View Claim</button>}
                    {pa.daysRemaining && pa.daysRemaining <= 14 && (
                      <button onClick={() => handleReauthorize(pa.id, pa.patient)} className="flex-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg py-1.5 border border-red-200 transition-colors">Renew</button>
                    )}
                  </>
                )}
                {pa.status === 'pending' && (
                  <>
                    <button onClick={() => toast({type:'info', message:'Status: Under medical review'})} className="flex-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-1.5 border border-blue-200 transition-colors">Check Status</button>
                    <button className="text-xs font-bold text-gray-500 hover:text-gray-700 px-2">Cancel</button>
                  </>
                )}
                {pa.status === 'denied' && (
                  <button className="w-full text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg py-1.5 border border-amber-200 transition-colors flex items-center justify-center gap-1"><FileText className="w-3.5 h-3.5"/> File Appeal</button>
                )}
                {pa.status === 'expired' && (
                  <button onClick={() => handleReauthorize(pa.id, pa.patient)} className="w-full text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg py-1.5 transition-colors shadow-sm">Re-authorize</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 font-sora flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-600"/> New PA Request</h3>
                <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
              </div>
              <form onSubmit={handleNewSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Patient Name</label>
                  <input name="patient" type="text" required className="w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 px-3 py-2 outline-none" placeholder="e.g. John Doe"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">CPT Code</label>
                    <input name="cpt" type="text" required className="w-full font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 px-3 py-2 outline-none" placeholder="e.g. 27447"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">ICD-10 Code</label>
                    <input name="icd" type="text" required className="w-full font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 px-3 py-2 outline-none" placeholder="e.g. M17.11"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Payer</label>
                  <select name="payer" required className="w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 px-3 py-2 outline-none bg-white">
                    <option value="Star Health Insurance">Star Health Insurance</option>
                    <option value="HDFC ERGO">HDFC ERGO</option>
                    <option value="New India Assurance">New India Assurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Clinical Justification</label>
                  <textarea rows={3} required className="w-full text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 px-3 py-2 outline-none resize-none" placeholder="Briefly explain medical necessity..."></textarea>
                </div>
                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg py-2 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 bg-green-500 text-white font-bold rounded-lg py-2 shadow-md hover:bg-green-600 transition-colors">Submit Request</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
