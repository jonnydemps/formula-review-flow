
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Formula {
  id: string;
  status: string;
  created_at: string;
  quote_amount?: number;
}

interface StatusDistributionChartProps {
  formulas: Formula[];
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ formulas }) => {
  // Calculate status distribution
  const statusCounts = formulas.reduce((acc, formula) => {
    acc[formula.status] = (acc[formula.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count,
    percentage: Math.round((count / formulas.length) * 100)
  }));

  // Color scheme for charts
  const COLORS = {
    'Pending Review': '#f59e0b',
    'In Review': '#3b82f6',
    'Quoted': '#8b5cf6',
    'Paid': '#10b981',
    'Completed': '#059669',
    'Rejected': '#ef4444'
  };

  const chartConfig = {
    count: { label: "Count" }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Status Distribution</CardTitle>
        <CardDescription>
          Breakdown of formula statuses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                label={({ status, percentage }) => `${status}: ${percentage}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.status as keyof typeof COLORS] || '#8884d8'} 
                  />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent />}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default StatusDistributionChart;
