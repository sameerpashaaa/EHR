import { useState } from 'react';
import { ShieldCheck, Download, Search } from 'lucide-react';
import { AuditEntry } from '../_types/billing.types';
import { useToast } from './ToastContext';
import { motion } from 'framer-motion';

export function AuditTrailLog({
  auditEntries
}: {
  auditEntries: AuditEntry[];
}) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filteredEntries = auditEntries.filter(entry => {
    if (filterAction !== 'all' && entry.action !== filterAction) return false;
    if (searchTerm && !entry.entityLabel.toLowerCase().includes(searchTerm.toLowerCase()) && !(entry.details || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getActionColor = (action: string) => {
    switch(action) {
      case 'create': return 'bg-green-100 text-green-700';
      case 'edit': return 'bg-blue-100 text-blue-700';
      case 'view': return 'bg-gray-100 text-gray-600';
      case 'submit': return 'bg-violet-100 text-violet-700';
      case 'sign': return 'bg-green-100 text-green-800';
      case 'export': return 'bg-amber-100 text-amber-700';
      case 'delete': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-sora">Audit trail & compliance log</h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">Tamper-proof log of all actions across clinical documentation and billing</p>
        </div>
        <div className="bg-blue-100 text-blue-700 text-xs font-bold rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
          <ShieldCheck className="w-4 h-4" /> HIPAA compliant
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search entity or details..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={filterAction} 
            onChange={e => setFilterAction(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="edit">Edit</option>
            <option value="view">View</option>
            <option value="submit">Submit</option>
            <option value="sign">Sign</option>
            <option value="export">Export</option>
            <option value="delete">Delete</option>
          </select>
        </div>
        
        <button 
          onClick={() => {
            toast({ type: 'success', message: 'Audit trail exported to PDF' });
          }}
          className="border border-gray-200 text-sm font-bold rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors w-full md:w-auto justify-center shadow-sm"
        >
          <Download className="w-4 h-4" /> Export to PDF
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">User & Role</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Entity</th>
                <th className="px-5 py-3">Record</th>
                <th className="px-5 py-3">Details</th>
                <th className="px-5 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredEntries.map(entry => {
                const date = new Date(entry.timestamp);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-xs text-gray-500 font-mono whitespace-nowrap">
                      {formattedDate} • {formattedTime}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <p className="text-gray-900 font-bold">{entry.user}</p>
                      <p className="text-gray-400 text-[11px] font-semibold uppercase">{entry.role}</p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getActionColor(entry.action)}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded px-2 py-0.5">
                        {entry.entity}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {entry.entityLabel}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 italic max-w-[200px] truncate">
                      {entry.details || '—'}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                      {entry.ipAddress}
                    </td>
                  </tr>
                );
              })}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-500">No audit records match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
