import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Printer, Send, ShieldCheck, Copy, Settings, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from './ToastContext';
import { cn } from '@/lib/utils';

export function SuperbillTab() {
  const { toast } = useToast();
  const [isMultiEncounter, setIsMultiEncounter] = useState(false);
  const [selectedEncounters, setSelectedEncounters] = useState<string[]>(['E1']);
  const [showBrandingDrawer, setShowBrandingDrawer] = useState(false);
  const [branding, setBranding] = useState({
    practiceName: 'METAPHARSIC MEDICAL CENTER',
    npi: '1234567890',
    address: '123 Healthcare Ave, Medical City, CA 90210\n(555) 123-4567',
    signatureLabel: 'Provider Signature Validation'
  });
  const [paymentLink, setPaymentLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [payments, setPayments] = useState<{ id: string; amount: number; method: string; date: string; ref: string }[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const MOCK_ENCOUNTERS = [
    { id: 'E1', date: '02/20/24', cpt: '99214', provider: 'Dr. Sarah Chen', fee: 250, desc: 'Office Visit, Est. Patient', icd: 'I10, E11.9' },
    { id: 'E2', date: '02/20/24', cpt: '93000', provider: 'Dr. Sarah Chen', fee: 85, desc: 'Electrocardiogram, routine', icd: 'I10' },
    { id: 'E3', date: '02/15/24', cpt: '99213', provider: 'Dr. Sarah Chen', fee: 180, desc: 'Office Visit, Level 3', icd: 'J01.90' },
    { id: 'E4', date: '01/10/24', cpt: '71046', provider: 'Dr. James Wilson', fee: 120, desc: 'Chest X-ray 2 views', icd: 'R07.9' },
  ];

  const activeEncounters = isMultiEncounter ? MOCK_ENCOUNTERS.filter(e => selectedEncounters.includes(e.id)) : [MOCK_ENCOUNTERS[0], MOCK_ENCOUNTERS[1]];
  const totalBilled = activeEncounters.reduce((sum, e) => sum + e.fee, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalBilled - totalPaid;

  const handleGenerateLink = () => {
    setIsGeneratingLink(true);
    setTimeout(() => {
      setPaymentLink(`https://pay.metapharsic.in/sb/2024-0012-${Math.random().toString(36).substring(2, 8)}`);
      setIsGeneratingLink(false);
    }, 600);
  };

  const handleRecordPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const amount = Number(fd.get('amount'));
    if (!amount || amount <= 0) return;
    
    setPayments([...payments, {
      id: `PAY-${Date.now()}`,
      amount,
      method: fd.get('method') as string,
      ref: fd.get('ref') as string,
      date: new Date().toLocaleDateString()
    }]);
    setShowPaymentForm(false);
    toast({ type: 'success', message: 'Payment recorded successfully' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex justify-center mb-4">
        <div className="bg-white border border-gray-200 rounded-full p-1 flex items-center shadow-sm">
          <button 
            onClick={() => setIsMultiEncounter(false)}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", !isMultiEncounter ? "bg-green-50 text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-900")}
          >
            Single encounter
          </button>
          <button 
            onClick={() => setIsMultiEncounter(true)}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", isMultiEncounter ? "bg-green-50 text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-900")}
          >
            Multi-encounter episode
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-8 max-w-4xl mx-auto border" style={{ border: "1.5px solid rgba(255, 255, 255, 0.8)", boxShadow: "0 10px 40px rgba(0, 0, 0, 0.05)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-[#E1F5EE] border border-[#1D9E75]/10 flex items-center justify-center shadow-sm">
              <ClipboardList className="w-6 h-6 text-[#0F6E56]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#101828] font-sora">Superbill Generator</h2>
              <p className="text-xs font-semibold text-[#667085] mt-0.5">Itemized receipt for patient self-pay & reimbursement</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowBrandingDrawer(true)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" title="Branding settings">
              <Settings className="w-5 h-5" />
            </button>
            <Button variant="outline" className="gap-2 font-bold text-xs border-slate-200 text-[#475569] hover:bg-slate-50 rounded-[10px] h-9 px-4"><Printer className="w-3.5 h-3.5" /> Print PDF</Button>
            <Button className="gap-2 font-bold text-xs text-white shadow-md hover:shadow-lg rounded-[10px] h-9 px-4 active:scale-95 transition-all bg-gradient-to-r from-[#1D9E75] to-[#16a34a]">
              <Send className="w-3.5 h-3.5" /> Send to Portal
            </Button>
          </div>
        </div>

        {/* Practice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-10">
          <div>
            <h3 className="font-bold text-[#101828] text-base tracking-tight font-sora">{branding.practiceName}</h3>
            <p className="text-xs font-semibold text-[#667085] mt-1.5 whitespace-pre-wrap">{branding.address}</p>
            <p className="text-xs font-semibold text-[#667085] mt-0.5">NPI: <span className="text-[#101828] font-extrabold font-mono">{branding.npi}</span></p>
          </div>
          <div className="text-left sm:text-right">
            <div className="inline-block bg-[#f8fafc] border border-slate-100 rounded-[12px] px-4 py-2">
              <p className="text-[9px] font-bold text-[#98A2B3] uppercase tracking-wider mb-1">Receipt Number</p>
              <p className="text-base font-bold text-[#0F6E56] font-mono leading-none">SB-2024-0012</p>
            </div>
            <p className="text-xs font-bold text-[#667085] mt-2">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Patient & Insurance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-[#f8fafc] rounded-[16px] border border-slate-100">
            <h4 className="text-[9px] font-bold text-[#98A2B3] uppercase tracking-wider mb-2 font-sora">Patient Details</h4>
            <p className="font-bold text-[#101828] text-base mb-1 font-sora">John Smith</p>
            <p className="text-xs font-semibold text-[#667085]">DOB: 03/15/1979 • MRN: <span className="font-extrabold text-[#475569] font-mono">PT12345</span></p>
            <p className="text-xs font-semibold text-[#667085] mt-0.5">456 Main St, CA 90210</p>
          </div>
          <div className="p-4 bg-[#f8fafc] rounded-[16px] border border-slate-100">
            <h4 className="text-[9px] font-bold text-[#98A2B3] uppercase tracking-wider mb-2 font-sora">Coverage Info</h4>
            <p className="font-bold text-[#101828] text-base mb-1 font-sora">Blue Cross Blue Shield</p>
            <p className="text-xs font-semibold text-[#667085]">ID: <span className="font-mono font-bold text-[#475569]">BCBS-123456789</span></p>
            <p className="text-xs font-semibold text-[#667085] mt-0.5">Group: <span className="font-mono font-bold text-[#475569]">GRP-456</span></p>
          </div>
        </div>

        {isMultiEncounter && (
          <div className="mb-6 bg-violet-50 border border-violet-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-violet-900 mb-2">Select Encounters</h4>
            <div className="space-y-2">
              {MOCK_ENCOUNTERS.map(e => (
                <label key={e.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-violet-100/50 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedEncounters.includes(e.id)}
                    onChange={(ev) => {
                      if (ev.target.checked) setSelectedEncounters([...selectedEncounters, e.id]);
                      else setSelectedEncounters(selectedEncounters.filter(id => id !== e.id));
                    }}
                    className="w-4 h-4 text-violet-600 rounded border-violet-300 focus:ring-violet-500"
                  />
                  <div className="flex-1 flex justify-between text-sm text-gray-700">
                    <span>{e.date} — <span className="font-mono text-violet-700">{e.cpt}</span> — {e.provider}</span>
                    <span className="font-semibold">${e.fee.toFixed(2)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Services Table */}
        <div className="border border-slate-100 rounded-[16px] overflow-hidden mb-8 shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-[#f8fafc] border-b border-slate-100">
              <tr>
                {["DOS", "CPT/HCPCS", "Description", "ICD-10", "Qty", "Fee"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[9px] font-bold text-[#98A2B3] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {activeEncounters.length > 0 ? activeEncounters.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-[#667085]">{row.date}</td>
                  <td className="px-5 py-4 font-mono font-bold text-violet-600">
                    <span className="bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-[4px]">{row.cpt}</span>
                  </td>
                  <td className="px-5 py-4 font-bold text-[#101828]">{row.desc}</td>
                  <td className="px-5 py-4 font-mono text-[10px] font-bold text-[#06B6D4]">
                    <span className="bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-[4px]">{row.icd}</span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#667085]">1</td>
                  <td className="px-5 py-4 font-bold text-[#101828] text-[13px]">${row.fee.toFixed(2)}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">No encounters selected.</td></tr>
              )}
            </tbody>
          </table>
          
          {/* Dynamic Payment Ledger */}
          <div className="border-t border-gray-200 pt-4 mt-4 px-6 pb-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Summary</h4>
            <div className="flex justify-between items-center bg-white border border-gray-200 p-4 rounded-xl shadow-sm mb-4">
              <div className="text-center flex-1 border-r border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total billed</p>
                <p className="text-sm text-gray-600 font-semibold mt-1">${totalBilled.toFixed(2)}</p>
              </div>
              <div className="text-center flex-1 border-r border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Amount paid</p>
                <p className="text-sm text-green-700 font-bold mt-1">${totalPaid.toFixed(2)}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Balance due</p>
                <p className={cn("text-base font-bold mt-1", balance > 0 ? "text-red-600" : "text-green-600")}>${balance.toFixed(2)}</p>
              </div>
            </div>

            {payments.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-medium">Payment history</p>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {payments.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 border-b border-gray-100 last:border-0 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{p.date}</span>
                        <span className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold rounded px-1.5 py-0.5">{p.method}</span>
                        <span className="text-gray-400 font-mono text-xs">{p.ref}</span>
                      </div>
                      <span className="text-green-700 font-bold">${p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!showPaymentForm ? (
              <button 
                onClick={() => setShowPaymentForm(true)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2 font-medium transition-colors"
              >
                <Plus className="w-4 h-4"/> Record payment
              </button>
            ) : (
              <form onSubmit={handleRecordPayment} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-gray-200">
                <input name="amount" type="number" step="0.01" max={balance} placeholder="Amount" required className="w-24 text-sm border-gray-300 rounded focus:ring-green-500" />
                <select name="method" className="w-28 text-sm border-gray-300 rounded focus:ring-green-500">
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="insurance">Insurance</option>
                </select>
                <input name="ref" type="text" placeholder="Ref #" className="flex-1 text-sm border-gray-300 rounded focus:ring-green-500" />
                <button type="submit" className="bg-green-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-600">Save</button>
                <button type="button" onClick={() => setShowPaymentForm(false)} className="text-gray-500 hover:text-gray-700"><X className="w-4 h-4"/></button>
              </form>
            )}
          </div>
        </div>

        {/* Payment Options (Link Generator) */}
        {balance > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment options</h4>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-[10px] font-bold text-center shadow-sm">
                QR<br/>Code
              </div>
              <div className="flex-1 w-full">
                {paymentLink ? (
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-blue-600 break-all">{paymentLink}</span>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(paymentLink); toast({ type: 'success', message: 'Link copied to clipboard' }); }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 rounded border border-gray-200" title="Copy link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <Button onClick={handleGenerateLink} disabled={isGeneratingLink} className="bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg px-4 py-2 w-full sm:w-auto mb-2 font-medium">
                    {isGeneratingLink ? 'Generating...' : 'Generate Payment Link'}
                  </Button>
                )}
                <p className="text-xs text-gray-500">Payment status: <span className="font-medium text-amber-600">Awaiting</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Signature Banner */}
        <div className="flex items-center gap-4 bg-[#E1F5EE]/50 p-4 rounded-[16px] border border-[#1D9E75]/15">
          <div className="flex flex-col gap-1 w-full pl-2">
            <h4 className="text-[9px] font-bold text-[#0F6E56] uppercase tracking-wider font-sora">{branding.signatureLabel}</h4>
            <p className="text-[13px] font-semibold text-[#0F6E56]">Dr. Sarah Chen, MD <span className="font-normal text-[#1D9E75]/70 mx-2">•</span> Electronically signed <span className="font-normal text-[#1D9E75]/70 mx-2">•</span> {new Date().toLocaleDateString()}</p>
          </div>
          <div className="w-11 h-11 bg-white rounded-[12px] border border-[#1D9E75]/20 flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#12B76A]" />
          </div>
        </div>
      </div>

      {/* Provider Branding Drawer */}
      <AnimatePresence>
        {showBrandingDrawer && (
          <>
            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowBrandingDrawer(false)} />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ ease: 'easeOut', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-[320px] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] z-50 flex flex-col"
            >
              <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Branding settings</h3>
                <button onClick={() => setShowBrandingDrawer(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Provider</label>
                  <select className="w-full text-sm border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 p-2 border">
                    <option>Dr. Sarah Chen</option>
                    <option>Dr. Michael Ross</option>
                    <option>Dr. James Wilson</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Practice Name</label>
                  <input type="text" value={branding.practiceName} onChange={e => setBranding({...branding, practiceName: e.target.value})} className="w-full text-sm border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 p-2 border" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">NPI Number</label>
                  <input type="text" value={branding.npi} onChange={e => setBranding({...branding, npi: e.target.value})} className="w-full text-sm font-mono border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 p-2 border" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address & Contact</label>
                  <textarea rows={2} value={branding.address} onChange={e => setBranding({...branding, address: e.target.value})} className="w-full text-sm border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 p-2 border resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Logo</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-xs text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors">
                    Upload logo (PNG, SVG)
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Signature Label</label>
                  <input type="text" value={branding.signatureLabel} onChange={e => setBranding({...branding, signatureLabel: e.target.value})} className="w-full text-sm border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 p-2 border" />
                </div>

                <Button 
                  onClick={() => setShowBrandingDrawer(false)}
                  className="bg-green-500 text-white text-sm font-bold rounded-lg w-full py-2 mt-4 hover:bg-green-600 transition-colors"
                >
                  Apply to superbill
                </Button>
                <button 
                  onClick={() => setBranding({
                    practiceName: 'METAPHARSIC MEDICAL CENTER', npi: '1234567890', address: '123 Healthcare Ave, Medical City, CA 90210\n(555) 123-4567', signatureLabel: 'Provider Signature Validation'
                  })}
                  className="text-xs text-gray-400 hover:text-gray-600 underline text-center block w-full mt-2"
                >
                  Reset to default
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
