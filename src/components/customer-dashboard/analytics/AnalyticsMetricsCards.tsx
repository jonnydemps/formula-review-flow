
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface Formula {
  id: string;
  status: string;
  created_at: string;
  quote_amount?: number;
}

interface AnalyticsMetricsCardsProps {
  formulas: Formula[];
}

const AnalyticsMetricsCards: React.FC<AnalyticsMetricsCardsProps> = ({ formulas }) => {
  const totalFormulas = formulas.length;
  const completedFormulas = formulas.filter(f => f.status === 'completed').length;
  const pendingFormulas = formulas.filter(f => f.status === 'pending_review').length;
  const completionRate = totalFormulas > 0 ? Math.round((completedFormulas / totalFormulas) * 100) : 0;

  return (
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
  );
};

export default AnalyticsMetricsCards;
