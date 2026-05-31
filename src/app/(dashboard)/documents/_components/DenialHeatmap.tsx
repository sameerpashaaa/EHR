import { useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from './ToastContext';

const DENIAL_HEATMAP_DATA = [
  { payer: 'Star Health', code: 'CO-4',  months: [2,0,3,1,5,4] },
  { payer: 'Star Health', code: 'CO-50', months: [0,1,0,2,1,0] },
  { payer: 'HDFC ERGO',   code: 'CO-4',  months: [4,6,5,8,7,9] },
  { payer: 'HDFC ERGO',   code: 'CO-16', months: [1,2,3,1,4,2] },
  { payer: 'New India',   code: 'CO-50', months: [3,4,6,5,7,8] },
  { payer: 'New India',   code: 'PR-96', months: [0,1,1,2,0,3] },
];
const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec'];

export function DenialHeatmap() {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{payer: string, code: string, month: string, count: number} | null>(null);

  const getCellColor = (count: number) => {
    if (count === 0) return 'bg-gray-50 text-gray-300';
    if (count <= 2) return 'bg-amber-100 text-amber-700';
    if (count <= 5) return 'bg-orange-200 text-orange-800';
    return 'bg-red-200 text-red-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
      <div 
        className="p-4 cursor-pointer flex items-center justify-between bg-gray-50 border-b border-gray-200"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-sm font-semibold text-gray-800">Denial Intelligence Heatmap</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); toast({ type: 'success', message: 'Exported heatmap CSV' }); }}
          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1"
        >
          <Download className="w-3 h-3"/> Export CSV
        </button>
      </div>

      {expanded && (
        <div className="p-4 overflow-x-auto relative">
          <table className="min-w-[540px] text-xs w-full">
            <thead>
              <tr>
                <th className="text-left py-2 font-medium text-gray-500 w-1/3">Payer & Code</th>
                {MONTHS.map(m => (
                  <th key={m} className="text-center py-2 font-medium text-gray-500 uppercase tracking-wide">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DENIAL_HEATMAP_DATA.map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-2 pr-4 text-gray-700">
                    <span className="font-semibold">{row.payer}</span> <span className="text-gray-400 mx-1">•</span> <span className="font-mono bg-gray-100 rounded px-1">{row.code}</span>
                  </td>
                  {row.months.map((count, j) => (
                    <td key={j} className="py-1 px-1">
                      <div 
                        onMouseEnter={() => setHoveredCell({ payer: row.payer, code: row.code, month: MONTHS[j], count })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-10 h-8 mx-auto flex items-center justify-center rounded cursor-pointer transition-transform hover:scale-110 font-bold ${getCellColor(count)}`}
                      >
                        {count === 0 ? '–' : count}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {hoveredCell && (
            <div className="absolute top-4 right-4 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none z-10">
              <p className="font-bold">{hoveredCell.payer}</p>
              <p className="text-gray-300">Code: <span className="font-mono text-white">{hoveredCell.code}</span></p>
              <p className="text-gray-300">Month: {hoveredCell.month}</p>
              <p className="text-red-300 font-bold mt-1">{hoveredCell.count} Denials</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
