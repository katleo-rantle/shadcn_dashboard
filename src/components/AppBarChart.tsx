// components/AppBarChart.tsx
'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { projects, taskActuals } from '@/lib/data';

// Fix 1: Proper ChartConfig type
const chartConfig = {
  quoted: {
    label: 'Quoted',
    color: 'var(--chart-1)',
  },
  actual: {
    label: 'Actual Spend',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export default function AppBarChart() {
  // Generate last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i)); // newest first
    return {
      name: date.toLocaleString('default', { month: 'short' }),
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59),
    };
  });

  const chartData = months.map(({ name, start, end }) => {
    // Quoted: projects that started this month
    const quotedInMonth = projects
      .filter((p) => {
        if (!p.StartDate) return false;
        const projectDate = new Date(p.StartDate);
        return projectDate >= start && projectDate <= end;
      })
      .reduce((sum, p) => sum + (p.QuotedCost || 0), 0);

    // Actual: costs recorded this month
    const actualInMonth = taskActuals
      .filter((ta) => {
        if (!ta.Date) return false;
        const costDate = new Date(ta.Date);
        return costDate >= start && costDate <= end;
      })
      .reduce((sum, ta) => sum + ta.Cost, 0);

    // Convert to thousands (k) for cleaner chart
    return {
      month: name,
      quoted: Math.round(quotedInMonth / 1000),
      actual: Math.round(actualInMonth / 1000),
    };
  });

  // Fallback if no data
  const hasData = chartData.some(d => d.quoted > 0 || d.actual > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">No financial data yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start recording actual costs to see monthly trends
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-6">Monthly Financial Overview</h3>
      
      <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => `R${value}k`}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(value: number) => `R${(value * 1000).toLocaleString('en-ZA')}`}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="quoted" fill="var(--color-quoted)" radius={6} />
          <Bar dataKey="actual" fill="var(--color-actual)" radius={6} />
        </BarChart>
      </ChartContainer>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Quoted = New projects started • Actual = Costs recorded
      </p>
    </div>
  );
}