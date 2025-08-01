
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import FormulaTable from './formulas/FormulaTable';
import FormulaHeader from './formulas/FormulaHeader';
import SearchAndFilter from '@/components/common/SearchAndFilter';
import { useFormulaFilters } from '@/hooks/useFormulaFilters';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { Formula } from '@/types/formula';

interface AdminFormulasSectionProps {
  onBack: () => void;
}

const AdminFormulasSection: React.FC<AdminFormulasSectionProps> = ({ onBack }) => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchFormulas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Query with join to get customer profile information
      const { data: formulasData, error: formulasError } = await supabase
        .from('formulas')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });
        
      if (formulasError) throw formulasError;
      
      console.log('Fetched formulas with customer data:', formulasData);
      setFormulas(formulasData || []);
    } catch (error: any) {
      console.error('Failed to load formulas:', error);
      setError(error.message || 'Failed to load formulas');
      toast.error(`Failed to load formulas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormulas();
  }, []);

  const provideQuote = async (id: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('formulas')
        .update({ 
          quote_amount: amount,
          status: 'quote_provided'
        })
        .eq('id', id);

      if (error) throw error;
      
      setFormulas(formulas.map((formula: Formula) => 
        formula.id === id 
          ? { ...formula, quote_amount: amount, status: 'quote_provided' } 
          : formula
      ));
      
      toast.success('Quote provided successfully');
    } catch (error: any) {
      toast.error(`Failed to provide quote: ${error.message}`);
    }
  };

  const handleRefresh = () => {
    fetchFormulas();
    toast.info('Refreshing formula list...');
  };

  return (
    <Card className="mb-8">
      <FormulaHeader onBack={onBack} onRefresh={handleRefresh} />
      <CardContent>
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filter */}
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
          />

          {loading ? (
            <SkeletonLoader count={5} />
          ) : filteredFormulas.length === 0 && !error ? (
            <div className="p-8 text-center border rounded-md">
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No formulas match your search criteria.' 
                  : 'No formulas have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <FormulaTable 
              formulas={filteredFormulas} 
              onProvideQuote={provideQuote}
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFormulasSection;
