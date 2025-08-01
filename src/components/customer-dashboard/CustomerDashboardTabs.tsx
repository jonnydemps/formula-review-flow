
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FormulaList from './FormulaList';
import DashboardAnalytics from './DashboardAnalytics';
import SearchAndFilter from '@/components/common/SearchAndFilter';
import { useFormulaFilters } from '@/hooks/useFormulaFilters';

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
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const {
    filteredFormulas,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resultCount,
  } = useFormulaFilters(formulas);
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Formulas</CardTitle>
                <CardDescription>
                  Track the status of your formula reviews
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showAdvancedSearch ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAdvancedSearch && (
              <SearchAndFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                resultCount={resultCount}
                showAdvanced={showAdvancedSearch}
                onToggleAdvanced={() => setShowAdvancedSearch(!showAdvancedSearch)}
              />
            )}
            <FormulaList 
              formulas={filteredFormulas}
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
