
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FormulaItem from './FormulaItem';

interface Formula {
  id: string;
  original_filename: string;
  status: string;
  created_at: string;
  quote_amount: number | null;
}

const FormulaList: React.FC = () => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFormulas = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('formulas')
        .select('*')
        .eq('customer_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setFormulas(data || []);
    } catch (error: any) {
      toast.error(`Error fetching formulas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormulas();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>Loading your formulas...</p>
      </div>
    );
  }

  if (formulas.length === 0) {
    return (
      <div className="p-8 text-center border rounded-md">
        <p>You haven't uploaded any formulas yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Your Formulas</h2>
      {formulas.map(formula => (
        <FormulaItem
          key={formula.id}
          id={formula.id}
          filename={formula.original_filename}
          status={formula.status}
          createdAt={formula.created_at}
          quoteAmount={formula.quote_amount}
          onUpdate={fetchFormulas}
        />
      ))}
    </div>
  );
};

export default FormulaList;
