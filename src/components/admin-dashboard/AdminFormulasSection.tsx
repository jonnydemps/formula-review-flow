
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
      
      // Direct query with no joins to avoid recursive RLS issues
      const { data: formulasData, error: formulasError } = await supabase
        .from('formulas')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (formulasError) throw formulasError;
      
      console.log('Fetched formulas:', formulasData);
      
      // If we have formulas and they have customer IDs, try to enrich with user data where possible
      if (formulasData && formulasData.length > 0) {
        // Get user session data to check for auth
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user?.email === 'john-dempsey@hotmail.co.uk') {
          // For the admin account, try to get auth users directly
          const { data: authData } = await supabase.auth.getUser();
          console.log('Admin auth data:', authData);
          
          // Attempt to enrich with customer data if possible
          const enrichedFormulas = formulasData.map(formula => {
            return {
              ...formula,
              customer_name: formula.customer_id || 'Unknown User'
            };
          });
          
          setFormulas(enrichedFormulas);
        } else {
          // Non-admin users
          setFormulas(formulasData);
        }
      } else {
        setFormulas(formulasData || []);
      }
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
              onRefresh={handleRefresh}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFormulasSection;
