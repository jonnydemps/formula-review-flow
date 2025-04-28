
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
      
      // Get formulas first
      const { data: formulasData, error: formulasError } = await supabase
        .from('formulas')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (formulasError) throw formulasError;
      
      if (!formulasData) {
        setFormulas([]);
        return;
      }
      
      // Then fetch customer profiles separately to avoid recursion
      const customerIds = formulasData
        .map(formula => formula.customer_id)
        .filter(id => id !== null);
        
      const uniqueIds = [...new Set(customerIds)];
      
      // If we have customer IDs, fetch their profiles
      let customerProfiles = {};
      
      if (uniqueIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', uniqueIds);
          
        if (!profilesError && profilesData) {
          // Create a lookup object
          customerProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
        }
      }
      
      // Combine formula data with customer data
      const enrichedFormulas = formulasData.map(formula => {
        if (formula.customer_id && customerProfiles[formula.customer_id]) {
          return {
            ...formula,
            customer_name: customerProfiles[formula.customer_id].name,
            customer_email: customerProfiles[formula.customer_id].email,
          };
        }
        return formula;
      });
      
      setFormulas(enrichedFormulas || []);
      
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
