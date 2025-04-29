
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Eye, Download, FileText, File, Check } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { FormulaStatus } from '@/types/auth';
import { getFormulaFileUrl } from '@/services/formulaService';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FormulaDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  formula: any | null;
}

const FormulaDetailsDialog: React.FC<FormulaDetailsProps> = ({
  isOpen,
  onClose,
  formula
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && formula) {
      setLoading(true);
      setError(null);
      
      // Fetch the formula file URL
      getFormulaFileUrl(formula.file_path)
        .then(url => {
          setFileUrl(url);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading file URL:', err);
          setError('Failed to load formula file. Please try again later.');
          setLoading(false);
        });
      
      // If formula is completed, try to fetch the review data
      if (formula.status === 'completed') {
        const fetchReviewData = async () => {
          try {
            const { data, error } = await supabase
              .from('reviews')
              .select('*')
              .eq('formula_id', formula.id)
              .maybeSingle();
              
            if (error) throw error;
            
            if (data) {
              setReviewData(data);
            }
          } catch (err) {
            console.error('Error fetching review data:', err);
          }
        };
        
        fetchReviewData();
      } else {
        setReviewData(null);
      }
    } else {
      setFileUrl(null);
      setReviewData(null);
    }
  }, [isOpen, formula]);

  if (!formula) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  const handleDownloadReport = () => {
    if (reviewData?.report_url) {
      // In a real app, this would download the actual report
      // For now, show a mock success message
      toast.success('Downloading report...');
      
      setTimeout(() => {
        toast.info('This is a simulated download. In production, this would download a real PDF report.');
      }, 2000);
    } else {
      toast.error('Report not available');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Formula Details
          </DialogTitle>
          <DialogDescription>
            View information about this formula submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">File Name:</div>
              <div>{formula.original_filename}</div>
              
              <div className="font-semibold">Status:</div>
              <div>
                <StatusBadge status={formula.status as FormulaStatus} />
              </div>
              
              <div className="font-semibold">Date Submitted:</div>
              <div>{formatDate(formula.created_at)}</div>
              
              <div className="font-semibold">Customer ID:</div>
              <div className="text-sm">{formula.customer_id}</div>
              
              {formula.quote_amount && (
                <>
                  <div className="font-semibold">Quote Amount:</div>
                  <div>${formula.quote_amount}</div>
                </>
              )}
              
              {formula.quote_requested_at && (
                <>
                  <div className="font-semibold">Quote Requested:</div>
                  <div>{formatDate(formula.quote_requested_at)}</div>
                </>
              )}
            </div>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-3">Formula File</h3>
            {loading ? (
              <div className="text-center py-8">Loading file information...</div>
            ) : fileUrl ? (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-center border border-dashed rounded-md p-8 bg-slate-50">
                  <File className="h-16 w-16 text-slate-400" />
                </div>
                <div className="flex justify-center space-x-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => window.open(fileUrl, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View File
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = fileUrl;
                      link.download = formula.original_filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                File preview not available
              </div>
            )}
          </div>

          {formula.status === 'completed' && reviewData && (
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-3 flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Review Complete
              </h3>
              
              {reviewData.review_data?.reviewNotes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Review Notes</h4>
                  <p className="text-sm p-3 bg-slate-50 rounded border">
                    {reviewData.review_data.reviewNotes}
                  </p>
                </div>
              )}
              
              {reviewData.review_data?.ingredients && reviewData.review_data.ingredients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Ingredients</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="p-2 text-left border">Name</th>
                          <th className="p-2 text-left border">Percentage</th>
                          <th className="p-2 text-left border">Compliant</th>
                          <th className="p-2 text-left border">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviewData.review_data.ingredients.map((ingredient: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2 border">{ingredient.name}</td>
                            <td className="p-2 border">{ingredient.percentage || '-'}</td>
                            <td className="p-2 border">
                              {ingredient.compliant ? (
                                <span className="text-green-500 flex items-center">
                                  <Check className="h-4 w-4 mr-1" /> Yes
                                </span>
                              ) : (
                                <span className="text-red-500">No</span>
                              )}
                            </td>
                            <td className="p-2 border">{ingredient.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <Button onClick={handleDownloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Report
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FormulaDetailsDialog;
