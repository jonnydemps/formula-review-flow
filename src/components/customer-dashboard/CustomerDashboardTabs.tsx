
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import FormulaList from './FormulaList';
import DashboardAnalytics from './DashboardAnalytics';

import { Formula } from '@/types/formula';

interface CustomerDashboardTabsProps {
  formulas: Formula[];
  formulasLoading: boolean;
  onAcceptQuote: (id: string, amount: number) => void;
}

const CustomerDashboardTabs: React.FC<CustomerDashboardTabsProps> = ({
  formulas,
  formulasLoading,
  onAcceptQuote
}) => {
  return (
    <Tabs defaultValue="formulas" className="mt-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="formulas">Your Formulas</TabsTrigger>
        <TabsTrigger value="analytics">
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="formulas">
        <Card>
          <CardHeader>
            <CardTitle>Your Formulas</CardTitle>
            <CardDescription>
              Track the status of your formula reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormulaList 
              formulas={formulas}
              isLoading={formulasLoading}
              onAcceptQuote={onAcceptQuote}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Analytics</CardTitle>
            <CardDescription>
              Visual insights into your formula submission and review progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardAnalytics formulas={formulas} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CustomerDashboardTabs;
