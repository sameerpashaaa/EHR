import { useState } from 'react';
import { X, FileText, Send, Download, Loader2 } from 'lucide-react';
import { Claim } from '../_types/billing.types';
import { useToast } from './ToastContext';
import { motion } from 'framer-motion';

const APPEAL_TEMPLATES = [
  { id: 'T001', code: 'CO-4',  label: 'Incorrect service code', description: 'Use when a service was denied due to incorrect CPT code selection or bundling conflict.' },
  { id: 'T002', code: 'CO-16', label: 'Claim lacks information', description: 'Use when required fields were missing from original submission.' },
  { id: 'T003', code: 'CO-50', label: 'Non-covered service', description: 'Use when payer claims service is not covered under patient plan.' },
  { id: 'T004', code: 'PR-96', label: 'Non-covered charge', description: 'Use when patient financial responsibility is disputed.' },
  { id: 'T005', code: 'CO-97', label: 'Payment included in allowance', description: 'Use for services denied as bundled into another procedure.' },
];

export function AppealTemplateLibrary({
  claim,
  onClose,
  onSubmitAppeal
}: {
  claim: Claim;
  onClose: () => void;
  onSubmitAppeal: (claimId: string, content: string) => void;
}) {
  const { toast } = useToast();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [appealContent, setAppealContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate = APPEAL_TEMPLATES.find(t => t.id === selectedTemplateId);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = APPEAL_TEMPLATES.find(t => t.id === id);
    const content = `Re: Appeal for Claim ${claim.id}
Patient: ${claim.patient}
DOS: ${claim.dos}
Denial Code: ${tmpl?.code || claim.denialCode || 'Unknown'}

To Whom It May Concern,

We are submitting this appeal regarding the above-referenced claim. The claim was denied citing reason code ${tmpl?.code}.

[ CLINICAL JUSTIFICATION PLACEHOLDER - AWAITING AI GENERATION ]

Please review the attached medical records and reconsider this claim for payment.

Sincerely,
${claim.provider}`;

    setAppealContent(content);
  };

  const handleAIGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setAppealContent(appealContent.replace(
        '[ CLINICAL JUSTIFICATION PLACEHOLDER - AWAITING AI GENERATION ]',
        `The service provided (${claim.cptCodes.map(c=>c.code).join(', ')}) is fully supported by the clinical documentation and is medically necessary for the treatment of the patient's condition (${claim.icdCodes.map(c=>c.code).join(', ')}). The documentation clearly indicates that the procedure was performed as a distinct and separate service, meeting all criteria for coverage.`
      ));
      setIsGenerating(false);
    }, 1200);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitAppeal(claim.id, appealContent);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ ease: 'easeOut', duration: 0.3 }}
        className="fixed right-0 top-0 h-full w-[560px] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] z-50 flex flex-col"
      >
        <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Appeal template library</h3>
            {claim.denialCode && (
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                Denial Code: <span className="bg-red-100 text-red-700 text-xs rounded px-1.5 py-0.5 font-mono font-bold">{claim.denialCode}</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {!selectedTemplateId ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Select a template to begin:</p>
              {APPEAL_TEMPLATES.map(t => (
                <div 
                  key={t.id}
                  onClick={() => handleSelectTemplate(t.id)}
                  className="border border-gray-200 rounded-xl p-4 hover:border-green-400 hover:bg-green-50/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-100 text-red-700 text-xs rounded px-1.5 py-0.5 font-mono font-bold">{t.code}</span>
                    <span className="text-sm font-medium text-gray-900">{t.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button onClick={() => setSelectedTemplateId(null)} className="text-sm text-blue-600 hover:underline">← Back to templates</button>
                <div className="text-xs text-gray-500 font-medium">Template: {selectedTemplate?.label}</div>
              </div>
              
              <textarea 
                value={appealContent}
                onChange={e => setAppealContent(e.target.value)}
                className="w-full h-56 font-mono text-sm text-gray-800 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />

              <div className="flex justify-between gap-3 pt-2">
                <button 
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                  className="bg-violet-100 hover:bg-violet-200 text-violet-700 font-semibold text-sm rounded-lg px-4 py-2 flex items-center gap-2 transition-colors flex-1 justify-center"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileText className="w-4 h-4"/>}
                  Generate with Metta AI
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    toast({ type: 'success', message: 'Appeal downloaded as PDF' });
                  }}
                  className="border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm rounded-lg px-4 py-2 flex items-center gap-2 transition-colors w-1/2 justify-center"
                >
                  <Download className="w-4 h-4"/> Download PDF
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold text-sm rounded-lg px-4 py-2 flex items-center gap-2 transition-colors w-1/2 justify-center"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                  Send to Payer
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
