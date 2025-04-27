
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllFormulas } from '@/services/formulaService';
import { supabase } from '@/integrations/supabase/client';
import FormulaTable from './formulas/FormulaTable';
import FormulaHeader from './formulas/FormulaHeader';

interface AdminFormulasSectionProps {
  onBack: () => void;
}

const AdminFormulasSection: React.FC<AdminFormulasSectionProps> = ({ onBack }) => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFormulas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error('Authentication required');
      }
      
      const data = await getAllFormulas();
      setFormulas(data || []);
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
      
      setFormulas(formulas.map(formula => 
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
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="p-8 text-center">
              <p>Loading formulas...</p>
            </div>
          ) : formulas.length === 0 && !error ? (
            <div className="p-8 text-center border rounded-md">
              <p>No formulas have been submitted yet.</p>
            </div>
          ) : (
            <FormulaTable 
              formulas={formulas} 
              onProvideQuote={provideQuote}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFormulasSection;
