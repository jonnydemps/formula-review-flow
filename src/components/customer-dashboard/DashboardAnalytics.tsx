
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Formula {
  id: string;
  status: string;
  created_at: string;
  quote_amount?: number;
}

interface DashboardAnalyticsProps {
  formulas: Formula[];
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ formulas }) => {
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

  // Calculate key metrics
  const totalFormulas = formulas.length;
  const completedFormulas = formulas.filter(f => f.status === 'completed').length;
  const pendingFormulas = formulas.filter(f => f.status === 'pending_review').length;
  const quotedFormulas = formulas.filter(f => f.status === 'quoted').length;
  const completionRate = totalFormulas > 0 ? Math.round((completedFormulas / totalFormulas) * 100) : 0;

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
    count: { label: "Count" },
    submissions: { label: "Submissions", color: "#3b82f6" },
    completed: { label: "Completed", color: "#059669" }
  };

  if (formulas.length === 0) {
    return (
      <div className="grid gap-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">Submit your first formula to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold">{totalFormulas}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedFormulas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingFormulas}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
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

        {/* Monthly Trends */}
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
      </div>

      {/* Progress Bar Chart */}
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
    </div>
  );
};

export default DashboardAnalytics;
