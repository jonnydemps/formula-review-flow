
import React from 'react';
import { AlertCircle } from 'lucide-react';

const EmptyAnalyticsState: React.FC = () => {
  return (
    <div className="grid gap-6">
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">Submit your first formula to see analytics</p>
      </div>
    </div>
  );
};

export default EmptyAnalyticsState;
