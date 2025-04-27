
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StatusBadge from '@/components/StatusBadge';

interface Formula {
  id: string;
  original_filename: string;
  status: string;
  created_at: string;
  quote_amount: number | null;
  quote_requested_at: string | null;
}

interface AdminFormulasSectionProps {
  onBack: () => void;
}

const AdminFormulasSection: React.FC<AdminFormulasSectionProps> = ({ onBack }) => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('formulas')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setFormulas(data || []);
      } catch (error: any) {
        toast.error(`Failed to load formulas: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

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

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-ra-blue" />
          Formula Management
        </CardTitle>
        <CardDescription>View and manage customer formulas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            Back to Dashboard
          </Button>

          {loading ? (
            <div className="p-8 text-center">
              <p>Loading formulas...</p>
            </div>
          ) : formulas.length === 0 ? (
            <div className="p-8 text-center border rounded-md">
              <p>No formulas have been submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left">File Name</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Submitted</th>
                    <th className="p-2 text-left">Quote</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formulas.map((formula) => (
                    <tr key={formula.id} className="border-t">
                      <td className="p-2">{formula.original_filename}</td>
                      <td className="p-2">
                        <StatusBadge status={formula.status} />
                      </td>
                      <td className="p-2">
                        {new Date(formula.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {formula.quote_amount ? `$${formula.quote_amount}` : '-'}
                      </td>
                      <td className="p-2">
                        {formula.status === 'quote_requested' && (
                          <Button 
                            size="sm" 
                            onClick={() => provideQuote(formula.id, 150)}
                          >
                            Provide Quote ($150)
                          </Button>
                        )}
                        {formula.status === 'paid' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toast.info("Upload report functionality coming soon")}
                          >
                            Upload Report
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFormulasSection;
