
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StatusBadge from '@/components/StatusBadge';
import { FormulaStatus } from '@/types/auth';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface Formula {
  id: string;
  original_filename: string;
  status: string;
  created_at: string;
  quote_amount: number | null;
  quote_requested_at: string | null;
  customer_id: string;
}

interface AdminFormulasSectionProps {
  onBack: () => void;
}

const AdminFormulasSection: React.FC<AdminFormulasSectionProps> = ({ onBack }) => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});

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

      // Fetch customer names
      if (data && data.length > 0) {
        const customerIds = [...new Set(data.map(formula => formula.customer_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', customerIds);

        if (!profilesError && profilesData) {
          const namesMap: Record<string, string> = {};
          profilesData.forEach(profile => {
            namesMap[profile.id] = profile.name || 'Unknown User';
          });
          setCustomerNames(namesMap);
        }
      }
    } catch (error: any) {
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

  // Convert the string status to FormulaStatus for the StatusBadge
  const getFormulaStatus = (status: string): FormulaStatus => {
    switch(status) {
      case 'pending_review': return 'pending_review';
      case 'quote_requested': return 'quote_requested';
      case 'quote_provided': return 'quote_provided';
      case 'paid': return 'paid';
      case 'completed': return 'completed';
      default: return 'pending_review';
    }
  };

  const handleRefresh = () => {
    fetchFormulas();
    toast.info('Refreshing formula list...');
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
          <div className="flex justify-between items-center">
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
              onClick={handleRefresh}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Quote</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formulas.map((formula) => (
                    <TableRow key={formula.id}>
                      <TableCell>{customerNames[formula.customer_id] || 'Unknown User'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{formula.original_filename}</TableCell>
                      <TableCell>
                        <StatusBadge status={getFormulaStatus(formula.status)} />
                      </TableCell>
                      <TableCell>
                        {new Date(formula.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {formula.quote_amount ? `$${formula.quote_amount}` : '-'}
                      </TableCell>
                      <TableCell>
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
                        {formula.status === 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toast.info("Download report functionality coming soon")}
                          >
                            <Download className="h-4 w-4 mr-1" /> Report
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFormulasSection;
