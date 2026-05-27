"use client";

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ReferenceLine
} from "recharts";

interface HealthTrajectory {
  month: string;
  actual: number;
  predicted: number;
  optimistic: number;
  pessimistic: number;
  interventions: number;
}

interface TrajectoryChartProps {
  data: HealthTrajectory[];
  showConfidence: boolean;
}

export default function TrajectoryChart({ data, showConfidence }: TrajectoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} domain={[70, 105]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
        />
        
        {showConfidence && (
          <>
            <Area
              type="monotone"
              dataKey="optimistic"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorOptimistic)"
            />
            <Area
              type="monotone"
              dataKey="pessimistic"
              stroke="#f43f5e"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#colorPessimistic)"
            />
          </>
        )}
        
        <Area
          type="monotone"
          dataKey="predicted"
          stroke="#06b6d4"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorPredicted)"
        />
        
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#8b5cf6"
          strokeWidth={3}
          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />

        <ReferenceLine x="Jun" stroke="#94a3b8" strokeDasharray="3 3" label="Today" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
