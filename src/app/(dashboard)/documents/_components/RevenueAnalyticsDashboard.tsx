import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export function RevenueAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('This month');
  
  // Mock data scaled slightly based on dateRange selection
  const scale = dateRange === 'This month' ? 1 : dateRange === 'Last 30 days' ? 1.1 : dateRange === 'Last 90 days' ? 2.8 : 4;
  
  const kpis = [
    { label: 'Net collection rate', value: '87.4%', trend: '+2.1% vs last month', up: true },
    { label: 'AR days', value: Math.round(34 * (2-scale)), trend: '-3 days vs last month', up: true }, // lower is better
    { label: 'First-pass acceptance rate', value: '91.2%', trend: '+0.8%', up: true },
    { label: 'Denial rate', value: '8.6%', trend: '-1.3%', up: true }, // lower is better
    { label: 'Billed MTD', value: `$${(1842000 * scale).toLocaleString()}`, trend: '+12% vs same period LM', up: true },
    { label: 'Collected MTD', value: `$${(1608000 * scale).toLocaleString()}`, trend: '+9%', up: true },
  ];

  const chartData = [
    { month: 'Jul', billed: 1500, collected: 1300 },
    { month: 'Aug', billed: 1650, collected: 1400 },
    { month: 'Sep', billed: 1450, collected: 1250 },
    { month: 'Oct', billed: 1800, collected: 1550 },
    { month: 'Nov', billed: 1750, collected: 1600 },
    { month: 'Dec', billed: 1842, collected: 1608 },
  ];
  const maxVal = 2000;

  const denialData = [
    { payer: 'Star Health', submitted: 450, denied: 38, rate: 8.4, trend: -0.5, code: 'CO-4' },
    { payer: 'HDFC ERGO', submitted: 320, denied: 45, rate: 14.1, trend: +2.1, code: 'CO-16' },
    { payer: 'New India', submitted: 280, denied: 50, rate: 17.8, trend: +0.2, code: 'CO-50' },
  ];

  const topCptData = [
    { code: '99214', desc: 'Office Visit, Est. Level 4', units: 450, billed: 112500, collected: 98000, rate: 87.1 },
    { code: '99213', desc: 'Office Visit, Est. Level 3', units: 820, billed: 147600, collected: 135000, rate: 91.4 },
    { code: '27447', desc: 'Arthroplasty, knee, condyle', units: 45, billed: 225000, collected: 195000, rate: 86.6 },
    { code: '93306', desc: 'Echocardiography, complete', units: 120, billed: 54000, collected: 48000, rate: 88.8 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-sora">Revenue Analytics</h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">Practice financial performance and collection metrics</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {['This month', 'Last 30 days', 'Last 90 days', 'YTD'].map(r => (
            <button 
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${dateRange === r ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{k.label}</p>
            <p className="text-2xl font-bold font-sora text-gray-900 mt-1">{k.value}</p>
            <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${k.up ? 'text-green-600' : 'text-red-600'}`}>
              {k.up ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
              {k.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-6">Revenue Trend (Billed vs Collected)</h3>
        <div className="flex items-end gap-4 h-48 border-b border-gray-100 pb-2 relative">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex justify-center items-end gap-1 h-full relative group">
              <div 
                className="w-1/3 bg-gray-200 rounded-t-sm hover:bg-gray-300 transition-colors relative"
                style={{ height: `${(d.billed / maxVal) * 100}%` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                  Billed: ${d.billed}k
                </div>
              </div>
              <div 
                className="w-1/3 bg-green-400 rounded-t-sm hover:bg-green-500 transition-colors relative"
                style={{ height: `${(d.collected / maxVal) * 100}%` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-green-800 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                  Collected: ${d.collected}k
                </div>
              </div>
              <p className="absolute top-full left-0 w-full text-center text-xs text-gray-500 mt-2 font-medium">{d.month}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-8">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <div className="w-3 h-3 bg-gray-200 rounded-sm" /> Billed Amount
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <div className="w-3 h-3 bg-green-400 rounded-sm" /> Collected Amount
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Denial breakdown by payer</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 rounded-tl-lg">Payer</th>
                  <th className="px-3 py-2 text-center">Submitted</th>
                  <th className="px-3 py-2 text-center">Denied</th>
                  <th className="px-3 py-2 text-center">Rate</th>
                  <th className="px-3 py-2 text-center rounded-tr-lg">Top Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {denialData.map((d, i) => (
                  <tr key={i}>
                    <td className="px-3 py-3 font-semibold text-gray-900">{d.payer}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{d.submitted}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{d.denied}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold ${d.rate > 10 ? 'text-red-600' : 'text-gray-900'}`}>{d.rate}%</span>
                        <div className="w-8 h-1.5 bg-gray-100 rounded-full hidden sm:block">
                          <div className={`h-full rounded-full ${d.rate > 10 ? 'bg-red-500' : 'bg-amber-500'}`} style={{width: `${(d.rate/20)*100}%`}}/>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-mono text-[10px] bg-gray-50 text-gray-600 rounded">{d.code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
            Top 10 CPT codes by revenue
            <div className="flex gap-1">
              <button className="p-1 hover:bg-gray-100 rounded"><ChevronUp className="w-3 h-3 text-gray-400"/></button>
              <button className="p-1 hover:bg-gray-100 rounded bg-gray-100"><ChevronDown className="w-3 h-3 text-gray-600"/></button>
            </div>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2 rounded-tl-lg">Code</th>
                  <th className="px-3 py-2">Units</th>
                  <th className="px-3 py-2 text-right">Billed</th>
                  <th className="px-3 py-2 text-right">Collected</th>
                  <th className="px-3 py-2 text-right rounded-tr-lg">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topCptData.map((d, i) => (
                  <tr key={i}>
                    <td className="px-3 py-3">
                      <p className="font-mono font-bold text-violet-700">{d.code}</p>
                      <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{d.desc}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{d.units}</td>
                    <td className="px-3 py-3 text-right text-gray-900 font-medium">${d.billed.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right text-green-700 font-bold">${d.collected.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right font-medium text-gray-700">{d.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
