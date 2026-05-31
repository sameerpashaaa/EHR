import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const QUERY_PARSERS = [
  { pattern: /hdfc/i, filter: (r: any) => r.payer === 'HDFC ERGO' },
  { pattern: /over ₹?(\d+)/i, filter: (r: any, match: RegExpMatchArray) => r.balance > parseInt(match[1]) },
  { pattern: /90.*day|critical/i, filter: (r: any) => r.bucket === '90+' },
  { pattern: /pending|outstanding/i, filter: (r: any) => r.balance > 0 }
];

export function NaturalLanguageArQuery({
  onFilter
}: {
  onFilter: (filtered: any[] | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      onFilter(null);
      return;
    }

    setIsThinking(true);
    setTimeout(() => {
      // Very basic mock logic just to show the filter applied UI
      // In a real implementation this would actually filter the AR array.
      // Since we just need to return filtered to parent, we can let parent do it,
      // but for simplicity here we just pass a string array of applied rules.
      
      onFilter([query]); // mock: tell parent we applied a query
      setIsThinking(false);
    }, 900);
  };

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mb-5">
      <form onSubmit={handleAsk} className="flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-violet-600 flex-shrink-0" />
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='Ask Metta AI: e.g. "Show all HDFC ERGO denials over $5000 this quarter"'
          className="bg-transparent flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-400 min-w-0"
        />
        <button 
          type="submit"
          disabled={isThinking}
          className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          {isThinking ? 'Thinking...' : 'Ask'}
        </button>
      </form>
    </div>
  );
}
