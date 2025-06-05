
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface CustomerDashboardHeaderProps {
  onRefresh: () => void;
}

const CustomerDashboardHeader: React.FC<CustomerDashboardHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>
        <p className="text-gray-600">
          Upload formulas, track reviews, and analyze your submission data
        </p>
      </div>
      <div className="mt-4 md:mt-0">
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default CustomerDashboardHeader;
