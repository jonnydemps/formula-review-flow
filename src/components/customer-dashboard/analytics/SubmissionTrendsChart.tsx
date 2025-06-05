
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface Formula {
  id: string;
  status: string;
  created_at: string;
  quote_amount?: number;
}

interface SubmissionTrendsChartProps {
  formulas: Formula[];
}

const SubmissionTrendsChart: React.FC<SubmissionTrendsChartProps> = ({ formulas }) => {
  // Calculate monthly submission trends (last 6 months)
  const monthlyData = React.useMemo(() => {
    const now = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const monthFormulas = formulas.filter(formula => {
        const formulaDate = new Date(formula.created_at);
        return formulaDate.getMonth() === date.getMonth() && 
               formulaDate.getFullYear() === date.getFullYear();
      });
      
      months.push({
        month: monthYear,
        submissions: monthFormulas.length,
        completed: monthFormulas.filter(f => f.status === 'completed').length
      });
    }
    
    return months;
  }, [formulas]);

  const chartConfig = {
    submissions: { label: "Submissions", color: "#3b82f6" },
    completed: { label: "Completed", color: "#059669" }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Trends</CardTitle>
        <CardDescription>
          Monthly submissions and completions over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="submissions" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Submissions"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#059669" 
                strokeWidth={2}
                name="Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SubmissionTrendsChart;
