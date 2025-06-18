
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Check, 
  Send, 
  Plus, 
  Trash2, 
  FileText, 
  User, 
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getFormulaFileUrl } from '@/services/formulaService';
import { getReviewForFormula, ensureReviewDataFormat } from '@/services/review/reviewOperations';
import { saveDraftReview, completeReview, sendReviewToClient } from '@/services/review/draftService';
import { generateFormulaPDF } from '@/services/pdfReportService';
import { Ingredient, ReviewData } from '@/services/review/types';

interface EnhancedFormulaReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formula: any | null;
  onReviewComplete: () => void;
}

const EnhancedFormulaReviewDialog: React.FC<EnhancedFormulaReviewDialogProps> = ({
  isOpen,
  onClose,
  formula,
  onReviewComplete
}) => {
  const { user } = useAuth();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<any | null>(null);
  
  // Form state
  const [reviewNotes, setReviewNotes] = useState('');
  const [productName, setProductName] = useState('');
  const [formulaNumber, setFormulaNumber] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: '', percentage: '', compliant: true, notes: '', casNumber: '', chemicalName: '', aicsListed: '', sir: '', susmp: '', nzoic: '' }
  ]);

  useEffect(() => {
    if (isOpen && formula) {
      setLoading(true);
      setError(null);
      
      // Load the formula file URL
      getFormulaFileUrl(formula.file_path)
        .then(url => {
          setFileUrl(url);
        })
        .catch(err => {
          console.error('Error loading file URL:', err);
          setError('Failed to load formula file. Please try again later.');
        })
        .finally(() => setLoading(false));
      
      // Check if there's an existing review for this formula
      const fetchExistingReview = async () => {
        try {
          const reviewData = await getReviewForFormula(formula.id);
          
          if (reviewData) {
            setExistingReview(reviewData);
            
            // Ensure review data is properly formatted and set form values
            const formattedData = ensureReviewDataFormat(reviewData.review_data);
            setReviewNotes(formattedData.reviewNotes);
            setProductName(formattedData.productName || '');
            setFormulaNumber(formattedData.formulaNumber || '');
            setIngredients(formattedData.ingredients);
          }
        } catch (err) {
          console.error('Error fetching existing review:', err);
        }
      };
      
      fetchExistingReview();
    } else {
      // Reset form and state when dialog is closed
      resetForm();
    }
  }, [isOpen, formula]);

  const resetForm = () => {
    setReviewNotes('');
    setProductName('');
    setFormulaNumber('');
    setIngredients([{ id: '1', name: '', percentage: '', compliant: true, notes: '', casNumber: '', chemicalName: '', aicsListed: '', sir: '', susmp: '', nzoic: '' }]);
    setFileUrl(null);
    setExistingReview(null);
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: '',
      percentage: '',
      compliant: true,
      notes: '',
      casNumber: '',
      chemicalName: '',
      aicsListed: '',
      sir: '',
      susmp: '',
      nzoic: ''
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients.splice(index, 1);
      setIngredients(updatedIngredients);
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setIngredients(updatedIngredients);
  };

  const getCurrentReviewData = (): ReviewData => {
    return {
      reviewNotes,
      productName,
      formulaNumber,
      ingredients: ingredients.map(ing => ({
        id: ing.id || String(Date.now()),
        name: ing.name,
        percentage: ing.percentage || '',
        compliant: ing.compliant,
        notes: ing.notes || '',
        casNumber: ing.casNumber || '',
        chemicalName: ing.chemicalName || '',
        aicsListed: ing.aicsListed || '',
        sir: ing.sir || '',
        susmp: ing.susmp || '',
        nzoic: ing.nzoic || ''
      }))
    };
  };

  const handleSaveDraft = async () => {
    if (!formula || !user) return;
    
    setIsSubmitting(true);
    try {
      const reviewData = getCurrentReviewData();
      await saveDraftReview(formula.id, user.id, reviewData);
      toast.success('Draft review saved successfully');
      onReviewComplete();
    } catch (error) {
      console.error('Error saving draft review:', error);
      toast.error('Failed to save draft review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteReview = async () => {
    if (!formula || !user) return;
    
    setIsSubmitting(true);
    try {
      const reviewData = getCurrentReviewData();
      await completeReview(formula.id, user.id, reviewData);
      
      // Generate PDF report
      const reportData = {
        formula,
        reviewData,
        reviewerName: user.name || user.email,
        reviewDate: new Date().toLocaleDateString()
      };
      generateFormulaPDF(reportData);
      
      toast.success('Review completed successfully');
      onReviewComplete();
      onClose();
    } catch (error) {
      console.error('Error completing review:', error);
      toast.error('Failed to complete review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToClient = async () => {
    if (!formula) return;
    
    setIsSubmitting(true);
    try {
      await sendReviewToClient(formula.id);
      toast.success('Review sent to client successfully');
      onReviewComplete();
      onClose();
    } catch (error) {
      console.error('Error sending review to client:', error);
      toast.error('Failed to send review to client');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formula) return null;

  const isDraft = existingReview?.is_draft !== false;
  const isReviewCompleted = formula.status === 'review_completed';
  const isSentToClient = formula.status === 'sent_to_client';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Enhanced Formula Review
          </DialogTitle>
          <DialogDescription>
            Review formula ingredients and provide comprehensive compliance assessment
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-1">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Formula Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formula Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <Label className="font-medium">File Name:</Label>
                      <p className="text-muted-foreground">{formula.original_filename}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="font-medium">Status:</Label>
                      <StatusBadge status={formula.status} />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-medium">Customer:</Label>
                      <p className="text-muted-foreground">{formula.profiles?.name || 'Unknown'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="font-medium">Email:</Label>
                      <p className="text-muted-foreground">{formula.profiles?.email || formula.customer_id}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="font-medium">Submitted:</Label>
                      <p className="text-muted-foreground">{new Date(formula.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="font-medium">Quote:</Label>
                      <p className="text-muted-foreground">{formula.quote_amount ? `$${formula.quote_amount}` : 'Not set'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Formula File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">Loading file information...</div>
                  ) : fileUrl ? (
                    <div className="space-y-2">
                      <Button
                        onClick={() => window.open(fileUrl, '_blank')}
                        className="w-full"
                      >
                        View Formula File
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      File preview not available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Review Form Section */}
            <Card>
              <CardHeader>
                <CardTitle>Review Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formulaNumber">Formula Number</Label>
                    <Input
                      id="formulaNumber"
                      value={formulaNumber}
                      onChange={(e) => setFormulaNumber(e.target.value)}
                      placeholder="Enter formula number"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reviewNotes">Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter general notes about this formula..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ingredients Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ingredient Analysis</CardTitle>
                  <Button onClick={addIngredient} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Ingredient
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="text-left p-2 font-medium min-w-[120px]">CAS Number</th>
                            <th className="text-left p-2 font-medium min-w-[120px]">INCI Name</th>
                            <th className="text-left p-2 font-medium min-w-[80px]">Conc. %</th>
                            <th className="text-left p-2 font-medium min-w-[150px]">Chemical Name</th>
                            <th className="text-left p-2 font-medium min-w-[80px]">AICS</th>
                            <th className="text-left p-2 font-medium min-w-[80px]">SIR</th>
                            <th className="text-left p-2 font-medium min-w-[80px]">SUSMP</th>
                            <th className="text-left p-2 font-medium min-w-[80px]">NZOIC</th>
                            <th className="text-left p-2 font-medium min-w-[80px]">Compliant</th>
                            <th className="text-left p-2 font-medium min-w-[150px]">Notes</th>
                            <th className="text-left p-2 font-medium w-[50px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ingredients.map((ingredient, index) => (
                            <tr key={ingredient.id} className="border-t">
                              <td className="p-2">
                                <Input
                                  value={ingredient.casNumber || ''}
                                  onChange={(e) => updateIngredient(index, 'casNumber', e.target.value)}
                                  placeholder="CAS number"
                                  className="min-w-[120px]"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={ingredient.name}
                                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                                  placeholder="INCI name"
                                  className="min-w-[120px]"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={ingredient.percentage || ''}
                                  onChange={(e) => updateIngredient(index, 'percentage', e.target.value)}
                                  placeholder="%"
                                  className="min-w-[80px]"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={ingredient.chemicalName || ''}
                                  onChange={(e) => updateIngredient(index, 'chemicalName', e.target.value)}
                                  placeholder="Chemical name"
                                  className="min-w-[150px]"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={ingredient.aicsListed || ''}
                                  onChange={(e) => updateIngredient(index, 'aicsListed', e.target.value)}
                                  placeholder="AICS"
                                  className="min-w-[80px]"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={ingredient.sir || ''}
                                  onChange={(e) => updateIngredient(index, 'sir', e.target.value)}
                                  placeholder="SIR"
                                  className="min-w-[80px]"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={ingredient.susmp || ''}
                                  onChange={(e) => updateIngredient(index, 'susmp', e.target.value)}
                                  placeholder="SUSMP"
                                  className="min-w-[80px]"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={ingredient.nzoic || ''}
                                  onChange={(e) => updateIngredient(index, 'nzoic', e.target.value)}
                                  placeholder="NZOIC"
                                  className="min-w-[80px]"
                                />
                              </td>
                              <td className="p-2">
                                <div className="flex items-center justify-center">
                                  <Checkbox
                                    checked={ingredient.compliant}
                                    onCheckedChange={(checked) => updateIngredient(index, 'compliant', checked)}
                                  />
                                </div>
                              </td>
                              <td className="p-2">
                                <Input
                                  value={ingredient.notes || ''}
                                  onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                                  placeholder="Notes"
                                  className="min-w-[150px]"
                                />
                              </td>
                              <td className="p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeIngredient(index)}
                                  disabled={ingredients.length <= 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <Button 
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            variant="secondary"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          
          {(formula.status === 'paid' || formula.status === 'in_review_draft') && (
            <Button 
              onClick={handleCompleteReview}
              disabled={isSubmitting}
            >
              <Check className="h-4 w-4 mr-2" />
              Complete Review
            </Button>
          )}
          
          {isReviewCompleted && !isSentToClient && (
            <Button 
              onClick={handleSendToClient}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedFormulaReviewDialog;
