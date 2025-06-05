
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface Formula {
  id: string;
  status: string;
  created_at: string;
  quote_amount?: number;
}

interface StatusBreakdownChartProps {
  formulas: Formula[];
}

const StatusBreakdownChart: React.FC<StatusBreakdownChartProps> = ({ formulas }) => {
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

  const chartConfig = {
    count: { label: "Count" }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Breakdown</CardTitle>
        <CardDescription>
          Number of formulas by status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} layout="horizontal">
              <XAxis type="number" />
              <YAxis dataKey="status" type="category" width={120} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="count" 
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default StatusBreakdownChart;
