
import React from 'react';
import AnalyticsMetricsCards from './analytics/AnalyticsMetricsCards';
import StatusDistributionChart from './analytics/StatusDistributionChart';
import SubmissionTrendsChart from './analytics/SubmissionTrendsChart';
import StatusBreakdownChart from './analytics/StatusBreakdownChart';
import EmptyAnalyticsState from './analytics/EmptyAnalyticsState';

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
  if (formulas.length === 0) {
    return <EmptyAnalyticsState />;
  }

  return (
    <div className="grid gap-6">
      {/* Key Metrics Cards */}
      <AnalyticsMetricsCards formulas={formulas} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistributionChart formulas={formulas} />
        <SubmissionTrendsChart formulas={formulas} />
      </div>

      {/* Progress Bar Chart */}
      <StatusBreakdownChart formulas={formulas} />
    </div>
  );
};

export default DashboardAnalytics;
