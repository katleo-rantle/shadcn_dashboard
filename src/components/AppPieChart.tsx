'use client';

import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

const COLORS = {
  'Active': '#6366f1',
  'In Progress': '#3b82f6',
  'Completed': '#10b981',
  'Not Started': '#6b7280',
};

type Props = {
  statusCount: Record<string, number>;
  totalProjects: number;
};

export default function AppPieChart({ statusCount, totalProjects }: Props) {
  const data = Object.entries(statusCount)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      percentage: Math.round((count / totalProjects) * 100),
    }));

  return (
    <ChartContainer config={{}} className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm">{data.value} projects ({data.percentage}%)</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm">
                {value} ({statusCount[value] || 0})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}