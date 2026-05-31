import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Mic, Sparkles, User, Download, CheckSquare, History, X, AlertTriangle, Link as LinkIcon, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClinicalDocument } from '../_types/billing.types';
import { useToast } from './ToastContext';

// Assuming CARD_STYLE is passed or replicated
const CARD_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(255,255,255,0.60)",
  borderRadius: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)",
  transition: "box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.3s, transform 0.3s cubic-bezier(0.4,0,0.2,1)",
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Note": return <FileText className="w-5 h-5 text-[#06B6D4]" />;
    case "Report": return <Search className="w-5 h-5 text-violet-500" />;
    case "Transcript": return <Mic className="w-5 h-5 text-[#EF4444]" />;
    case "Summary": return <Sparkles className="w-5 h-5 text-[#F59E0B]" />;
    default: return <FileText className="w-5 h-5 text-[#94a3b8]" />;
  }
};

export function DocumentCard({
  doc,
  isSelectMode,
  isSelected,
  onToggleSelect,
  setDocuments,
  logAudit,
}: {
  doc: ClinicalDocument;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  setDocuments: React.Dispatch<React.SetStateAction<ClinicalDocument[]>>;
  logAudit: (action: any, entity: any, id: string, label: string) => void;
}) {
  const { toast } = useToast();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showScorer, setShowScorer] = useState(false);
  const [scoringStep, setScoringStep] = useState(0);
  const [linkerExpanded, setLinkerExpanded] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const hoverCardStyle = (e: React.MouseEvent<HTMLElement>) => {
    if (isSelectMode) return;
    const el = e.currentTarget;
    el.style.boxShadow = "0 14px 40px rgba(0,0,0,0.10)";
    el.style.borderColor = "rgba(34,197,94,0.25)";
    el.style.transform = "translateY(-6px)";
  };

  const resetCardStyle = (e: React.MouseEvent<HTMLElement>) => {
    if (isSelectMode) return;
    const el = e.currentTarget;
    el.style.boxShadow = "0 4px 10px rgba(0,0,0,0.03), 0 10px 30px rgba(0,0,0,0.06)";
    el.style.borderColor = "rgba(255,255,255,0.60)";
    el.style.transform = "translateY(0)";
  };

  const handleScore = () => {
    setShowScorer(true);
    setScoringStep(1);
    setTimeout(() => setScoringStep(2), 400);
    setTimeout(() => setScoringStep(3), 800);
    setTimeout(() => {
      setScoringStep(4);
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, qualityScore: 82 } : d));
    }, 1200);
  };

  const handleRestore = (versionNum: number) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === doc.id) {
        const v = d.versions.find(ver => ver.versionNum === versionNum);
        if (!v) return d;
        const newV = {
          ...v,
          versionId: `v${d.versions.length + 1}-${d.id}`,
          versionNum: d.versions.length + 1,
          summary: `Restored from v${versionNum}`,
          editedAt: new Date().toISOString()
        };
        return { ...d, versions: [...d.versions, newV] };
      }
      return d;
    }));
    toast({ type: 'success', message: `Restored version ${versionNum}` });
    setShowDrawer(false);
  };

  return (
    <>
      <div 
        className={cn("group relative overflow-hidden transition-all duration-300", 
          isSelectMode && "cursor-pointer",
          isSelectMode && isSelected ? "border-green-500 bg-green-50/60 ring-1 ring-green-400" :
          isSelectMode && !isSelected ? "hover:border-green-300 hover:bg-green-50/30" : ""
        )}
        style={!isSelectMode ? { ...CARD_STYLE, padding: "20px" } : { padding: "20px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.60)" }}
        onMouseEnter={hoverCardStyle}
        onMouseLeave={resetCardStyle}
        onClick={() => isSelectMode && onToggleSelect()}
      >
        {isSelectMode && (
          <div className="absolute top-4 left-4 z-10">
            <input 
              type="checkbox" 
              checked={isSelected} 
              readOnly 
              className="w-4 h-4 rounded text-green-600 border-gray-300 focus:ring-green-500 pointer-events-none"
            />
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-2">
          {!isSelectMode && doc.qualityScore !== undefined && (
            <div className={cn("text-xs font-semibold rounded-full px-2 py-0.5",
              doc.qualityScore < 60 ? "bg-red-100 text-red-700 border border-red-200" :
              doc.qualityScore < 80 ? "bg-amber-100 text-amber-700 border border-amber-200" :
              "bg-green-100 text-green-700 border border-green-200"
            )}>
              {doc.qualityScore}/100
            </div>
          )}
          {!isSelectMode && (
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1 bg-white/90 backdrop-blur rounded-[8px] border border-slate-100 shadow-sm p-0.5">
              <button onClick={handleScore} className="p-1.5 text-[#667085] hover:text-[#0F6E56]" title="Score this note">
                <Sparkles className="w-3.5 h-3.5"/>
              </button>
              <button onClick={() => setShowDrawer(true)} className="p-1.5 text-[#667085] hover:text-[#0F6E56]" title="Version History">
                <History className="w-3.5 h-3.5"/>
              </button>
              <button className="p-1.5 text-[#667085] hover:text-[#0F6E56]">
                <Download className="w-3.5 h-3.5"/>
              </button>
            </div>
          )}
        </div>

        <div className={cn("flex items-start gap-4 mb-4", isSelectMode && "pl-6")}>
          <div className="w-11 h-11 bg-[#f8fafc] rounded-[12px] border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
            {getTypeIcon(doc.type)}
          </div>
          <div>
            <h3 className="font-bold text-[#101828] text-[14px] leading-snug group-hover:text-[#0F6E56] transition-colors line-clamp-2 font-sora">{doc.title}</h3>
            <p className="text-[12px] text-[#667085] mt-1.5 flex items-center gap-1 font-semibold"><User className="w-3.5 h-3.5 text-[#98A2B3]"/> {doc.patient}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 gap-2">
          <div className="flex gap-1.5">
            <span className={cn("px-2 py-0.5 rounded-[4px] text-[9px] uppercase tracking-wider font-extrabold border", 
              doc.status === "completed" ? "bg-cyan-50 text-[#06B6D4] border-cyan-100" : 
              doc.status === "verified" ? "bg-blue-50 text-blue-600 border-blue-100" :
              "bg-emerald-50 text-[#12B76A] border-emerald-100"
            )}>
              {doc.status}
            </span>
            {doc.source === "ai-scribe" && (
              <span className="px-2 py-0.5 rounded-[4px] bg-violet-50 text-violet-700 text-[9px] uppercase tracking-wider font-extrabold border border-violet-100 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-violet-500"/> AI
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-[#98A2B3]">{doc.createdAt}</span>
        </div>

        {/* Quality Scorer Inline Panel */}
        {showScorer && !isSelectMode && (
          <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 text-sm relative">
            <button onClick={() => setShowScorer(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X className="w-3 h-3"/></button>
            {scoringStep < 4 ? (
              <div className="text-gray-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {scoringStep === 1 && "Checking diagnosis specificity..."}
                {scoringStep === 2 && "Validating HPI elements..."}
                {scoringStep === 3 && "Verifying ROS completeness..."}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-2xl font-bold text-green-700">{doc.qualityScore || 82}</div>
                  <div className="text-xs text-gray-500 leading-tight">Overall<br/>Quality Score</div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>Diagnosis specificity</span><span>80/100</span></div>
                    <div className="h-1.5 rounded-full bg-gray-100"><div className="h-full bg-green-500 rounded-full w-[80%]"/></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span>HPI completeness</span><span>85/100</span></div>
                    <div className="h-1.5 rounded-full bg-gray-100"><div className="h-full bg-green-500 rounded-full w-[85%]"/></div>
                  </div>
                </div>
                {(doc.qualityScore || 82) < 90 && (
                  <div className="text-xs text-gray-600 bg-amber-50 rounded-lg p-3 mt-3">
                    <p className="flex gap-1"><span className="text-amber-600">→</span> Add laterality to M54.5 diagnosis.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Encounter Linker */}
        {!isSelectMode && (
          <div className="mt-3 border-t border-gray-100 pt-2.5">
            <button onClick={() => setLinkerExpanded(!linkerExpanded)} className="flex items-center justify-between w-full text-xs text-gray-500 hover:text-gray-700">
              <span className="flex items-center gap-1.5">
                {doc.encounterId ? <><LinkIcon className="w-3 h-3 text-green-600" /><span className="text-green-700 font-medium">Linked to {doc.encounterId}</span></> : 
                 doc.claimId ? <><FileText className="w-3 h-3 text-blue-600" /><span className="text-blue-700 font-medium">Linked to {doc.claimId}</span></> :
                 <><span className="text-gray-400 border border-gray-300 rounded px-1 text-[10px]">+</span> Link to encounter</>}
              </span>
              {linkerExpanded ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
            </button>
            {linkerExpanded && (
              <div className="mt-2 bg-gray-50 rounded p-2 text-[11px] text-gray-600">
                {doc.encounterId ? (
                  <p>Encounter {doc.encounterId} • DOS: {new Date().toLocaleDateString()}</p>
                ) : (
                  <button className="bg-white border border-gray-200 px-2 py-1 rounded w-full text-left">Select encounter...</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Version Drawer */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 bg-black/20 z-30" onClick={() => setShowDrawer(false)} />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ ease: 'easeOut', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.12)] z-40 flex flex-col"
          >
            <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Version history</h3>
                <p className="text-sm text-gray-500">{doc.title}</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4">
                <button 
                  onClick={() => setCompareMode(!compareMode)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {compareMode ? 'Exit compare mode' : 'Compare two versions'}
                </button>
              </div>

              {compareMode ? (
                <div className="text-sm">
                  <div className="flex gap-2 mb-3">
                    <select className="border border-gray-200 rounded text-xs p-1"><option>v2 (Latest)</option></select>
                    <span>vs</span>
                    <select className="border border-gray-200 rounded text-xs p-1"><option>v1</option></select>
                  </div>
                  <div className="font-mono bg-gray-50 p-3 rounded">
                    <div className="bg-red-50 text-red-700 line-through text-xs px-2 py-0.5 my-0.5 rounded">Patient denies pain.</div>
                    <div className="bg-green-50 text-green-700 text-xs px-2 py-0.5 my-0.5 rounded">Patient reports mild lower back pain.</div>
                  </div>
                </div>
              ) : (
                <div className="relative border-l-2 border-gray-100 ml-2">
                  {[...doc.versions].reverse().map((v, i) => {
                    const isLatest = i === 0;
                    return (
                      <div key={v.versionId} className="relative pl-6 pb-6 last:pb-0">
                        <div className={cn("absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white", isLatest ? "bg-violet-600" : "bg-green-500")} />
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">v{v.versionNum}</p>
                        <p className="text-sm text-gray-900 font-medium">{v.summary}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{v.editedBy} • {new Date(v.editedAt).toLocaleString()}</p>
                        {!isLatest && (
                          <button 
                            onClick={() => {
                              if(confirm(`Restore version ${v.versionNum}?`)) handleRestore(v.versionNum);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1.5"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
