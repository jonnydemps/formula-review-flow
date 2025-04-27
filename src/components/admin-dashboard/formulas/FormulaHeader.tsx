
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCcw } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FormulaHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
}

const FormulaHeader: React.FC<FormulaHeaderProps> = ({ onBack, onRefresh }) => {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-ra-blue" />
          Formula Management
        </CardTitle>
        <CardDescription>View and manage customer formulas</CardDescription>
      </CardHeader>
      <div className="px-6 flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
        >
          Back to Dashboard
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefresh}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </>
  );
};

export default FormulaHeader;
