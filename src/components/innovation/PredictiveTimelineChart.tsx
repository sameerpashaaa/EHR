"use client";

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Line
} from "recharts";

interface TimelineEvent {
  month: string;
  riskScore: number;
  confidence: number;
  interventions: string[];
  alerts: string[];
}

interface PredictiveTimelineChartProps {
  data: TimelineEvent[];
  showInterventions: boolean;
}

export default function PredictiveTimelineChart({ data, showInterventions }: PredictiveTimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "white", 
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "12px"
          }}
        />
        <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" label="Risk Threshold" />
        <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="5 5" label="Critical" />
        <Area 
          type="monotone" 
          dataKey="riskScore" 
          stroke="#f43f5e" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#riskGradient)" 
        />
        {showInterventions && (
          <Line 
            type="monotone" 
            dataKey="confidence" 
            stroke="#06b6d4" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
