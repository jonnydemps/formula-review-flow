
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertTriangle, Check, X, Plus, FileText, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';
import { saveReview, generateReport, Ingredient } from '@/services/reviewService';
import { getFormulaFileUrl } from '@/services/formulaService';
import { useAuth } from '@/contexts/AuthContext';

// Define validation schema
const reviewFormSchema = z.object({
  reviewNotes: z.string().min(1, 'Review notes are required'),
  ingredients: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Ingredient name is required'),
    percentage: z.string().optional(),
    compliant: z.boolean(),
    notes: z.string().optional()
  }))
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface FormulaReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formula: any | null;
  onReviewComplete: () => void;
}

const FormulaReviewDialog: React.FC<FormulaReviewDialogProps> = ({
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

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      reviewNotes: '',
      ingredients: [
        { id: '1', name: '', percentage: '', compliant: true, notes: '' }
      ]
    }
  });
  
  useEffect(() => {
    if (isOpen && formula) {
      setLoading(true);
      setError(null);
      
      // Load the formula file URL
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
      
      // Check if there's an existing review for this formula
      const fetchExistingReview = async () => {
        try {
          const { data: reviewsData } = await supabase
            .from('reviews')
            .select('*')
            .eq('formula_id', formula.id)
            .maybeSingle();
            
          if (reviewsData) {
            setExistingReview(reviewsData);
            
            // Populate form with existing review data
            form.reset({
              reviewNotes: reviewsData.review_data.reviewNotes || '',
              ingredients: reviewsData.review_data.ingredients || [
                { id: '1', name: '', percentage: '', compliant: true, notes: '' }
              ]
            });
          }
        } catch (err) {
          console.error('Error fetching existing review:', err);
        }
      };
      
      fetchExistingReview();
    } else {
      // Reset form and state when dialog is closed
      form.reset({
        reviewNotes: '',
        ingredients: [{ id: '1', name: '', percentage: '', compliant: true, notes: '' }]
      });
      setFileUrl(null);
      setExistingReview(null);
    }
  }, [isOpen, formula, form]);

  const addIngredient = () => {
    const currentIngredients = form.getValues('ingredients');
    form.setValue('ingredients', [
      ...currentIngredients, 
      { 
        id: Date.now().toString(), 
        name: '', 
        percentage: '', 
        compliant: true, 
        notes: '' 
      }
    ]);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues('ingredients');
    if (currentIngredients.length > 1) {
      const updatedIngredients = [...currentIngredients];
      updatedIngredients.splice(index, 1);
      form.setValue('ingredients', updatedIngredients);
    }
  };

  const onSubmit = async (data: ReviewFormValues) => {
    if (!formula || !user) return;
    
    setIsSubmitting(true);
    try {
      await saveReview(formula.id, user.id, data);
      toast.success('Formula review saved successfully');
      onReviewComplete();
      onClose();
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error('Failed to save review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!formula || !user) return;
    
    setIsSubmitting(true);
    try {
      // First save current review data
      const currentData = form.getValues();
      await saveReview(formula.id, user.id, currentData);
      
      // Then generate report
      await generateReport(formula.id, user.id);
      toast.success('Report generated successfully');
      onReviewComplete();
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formula) return null;

  // Import supabase here to avoid circular dependency issues
  const { supabase } = require('@/integrations/supabase/client');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Review Formula
          </DialogTitle>
          <DialogDescription>
            Review formula ingredients and provide compliance assessment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Formula Details</h3>
              <div className="space-y-2 mt-2">
                <div className="text-sm grid grid-cols-2 gap-1">
                  <span className="font-medium">File Name:</span>
                  <span>{formula.original_filename}</span>
                  
                  <span className="font-medium">Status:</span>
                  <span>
                    <StatusBadge status={formula.status} />
                  </span>
                  
                  <span className="font-medium">Customer ID:</span>
                  <span className="text-xs truncate">{formula.customer_id}</span>
                  
                  <span className="font-medium">Date Submitted:</span>
                  <span>{new Date(formula.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Formula File</h3>
              <div className="mt-2">
                {loading ? (
                  <div className="text-center py-4">Loading file information...</div>
                ) : fileUrl ? (
                  <div className="flex flex-col space-y-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(fileUrl, '_blank')}
                    >
                      View File
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    File preview not available
                  </div>
                )}
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="reviewNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter general notes about this formula..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Ingredients</h3>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={addIngredient}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Ingredient
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Compliant</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.watch('ingredients').map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            {...form.register(`ingredients.${index}.name`)}
                            placeholder="Ingredient name"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            {...form.register(`ingredients.${index}.percentage`)}
                            placeholder="%"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              {...form.register(`ingredients.${index}.compliant`)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            {...form.register(`ingredients.${index}.notes`)}
                            placeholder="Any concerns?"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeIngredient(index)} 
                            disabled={form.watch('ingredients').length <= 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Review
                </Button>
                {formula.status === 'paid' && (
                  <Button 
                    type="button"
                    onClick={handleGenerateReport}
                    disabled={isSubmitting}
                    variant="default"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Complete & Generate Report
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormulaReviewDialog;
