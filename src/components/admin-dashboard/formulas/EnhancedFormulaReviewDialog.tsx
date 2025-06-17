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
import { AlertTriangle, Check, X, Plus, FileText, Save, Download, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import StatusBadge from '@/components/StatusBadge';
import { toast } from 'sonner';
import { saveReview, generateReport, Ingredient, ReviewData, ensureReviewDataFormat } from '@/services/reviewService';
import { getFormulaFileUrl } from '@/services/formulaService';
import { parseFormulaExcel, generateMasterExcel, ParsedFormulaData } from '@/services/excelParsingService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AutoCompleteButton from './AutoCompleteButton';
import { generateFormulaPDF } from '@/services/pdfReportService';

// Define validation schema
const reviewFormSchema = z.object({
  reviewNotes: z.string().min(1, 'Review notes are required'),
  productName: z.string().optional(),
  formulaNumber: z.string().optional(),
  ingredients: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Ingredient name is required'),
    percentage: z.string().optional(),
    compliant: z.boolean(),
    notes: z.string().optional(),
    casNumber: z.string().optional()
  }))
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

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
  const [parsedData, setParsedData] = useState<ParsedFormulaData | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      reviewNotes: '',
      productName: '',
      formulaNumber: '',
      ingredients: [
        { id: '1', name: '', percentage: '', compliant: true, notes: '', casNumber: '' }
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
            
            // Ensure review data is properly formatted and set form values
            const formattedData = ensureReviewDataFormat(reviewsData.review_data);
            form.reset(formattedData);
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
        productName: '',
        formulaNumber: '',
        ingredients: [{ id: '1', name: '', percentage: '', compliant: true, notes: '', casNumber: '' }]
      });
      setFileUrl(null);
      setExistingReview(null);
      setParsedData(null);
    }
  }, [isOpen, formula, form]);

  const parseExcelFile = async () => {
    if (!fileUrl) return;
    
    setIsParsing(true);
    try {
      // Fetch the file from the URL
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const file = new File([arrayBuffer], formula.original_filename, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const parsed = await parseFormulaExcel(file);
      setParsedData(parsed);
      
      // Auto-populate form with parsed data
      const ingredients = parsed.ingredients.map((ing, index) => ({
        id: (index + 1).toString(),
        name: ing.inciName,
        percentage: ing.concentration,
        compliant: true,
        notes: '',
        casNumber: ing.casNumber
      }));
      
      form.setValue('productName', parsed.productName);
      form.setValue('formulaNumber', parsed.formulaNumber);
      form.setValue('ingredients', ingredients);
      
      toast.success(`Parsed ${parsed.ingredients.length} ingredients from Excel file`);
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error('Failed to parse Excel file. Please check the file format.');
    } finally {
      setIsParsing(false);
    }
  };

  const downloadMasterExcel = () => {
    if (!parsedData) return;
    
    const masterBlob = generateMasterExcel(formula, parsedData);
    const url = URL.createObjectURL(masterBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Master_${formula.original_filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Master Excel file downloaded');
  };

  const addIngredient = () => {
    const currentIngredients = form.getValues('ingredients');
    form.setValue('ingredients', [
      ...currentIngredients, 
      { 
        id: Date.now().toString(), 
        name: '', 
        percentage: '', 
        compliant: true, 
        notes: '',
        casNumber: ''
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

  const handleAutoCompleteUpdate = (updatedIngredients: Ingredient[]) => {
    console.log('Auto-complete updated ingredients:', updatedIngredients);
    form.setValue('ingredients', updatedIngredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      percentage: ing.percentage || '',
      compliant: ing.compliant,
      notes: ing.notes || '',
      casNumber: ing.casNumber || ''
    })));
  };

  const onSubmit = async (data: ReviewFormValues) => {
    if (!formula || !user) return;
    
    setIsSubmitting(true);
    try {
      // Convert ingredients to ensure they match the Ingredient type exactly
      const ingredients: Ingredient[] = data.ingredients.map(ing => ({
        id: ing.id || String(Date.now()),
        name: ing.name,
        percentage: ing.percentage || '',
        compliant: ing.compliant,
        notes: ing.notes || '',
        casNumber: ing.casNumber || ''
      }));
      
      // Create a properly typed ReviewData object
      const reviewData: ReviewData = {
        reviewNotes: data.reviewNotes,
        productName: data.productName || '',
        formulaNumber: data.formulaNumber || '',
        ingredients: ingredients
      };
      
      await saveReview(formula.id, user.id, reviewData);
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
      
      // Convert ingredients to ensure they match the Ingredient type exactly
      const ingredients: Ingredient[] = currentData.ingredients.map(ing => ({
        id: ing.id || String(Date.now()),
        name: ing.name,
        percentage: ing.percentage || '',
        compliant: ing.compliant,
        notes: ing.notes || '',
        casNumber: ing.casNumber || ''
      }));
      
      // Create a properly typed ReviewData object
      const reviewData: ReviewData = {
        reviewNotes: currentData.reviewNotes,
        productName: currentData.productName || '',
        formulaNumber: currentData.formulaNumber || '',
        ingredients: ingredients
      };
      
      await saveReview(formula.id, user.id, reviewData);
      
      // Generate PDF report
      generateFormulaPDF({
        formula,
        reviewData,
        reviewerName: 'John Dempsey',
        reviewDate: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      });
      
      // Then generate report in database
      await generateReport(formula.id, user.id);
      toast.success('Report generated and downloaded successfully');
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enhanced Formula Review
          </DialogTitle>
          <DialogDescription>
            Review formula with automatic ingredient extraction and master file generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <h3 className="font-semibold mb-2">Formula Details</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <span className="font-medium">File:</span>
                  <span className="truncate">{formula.original_filename}</span>
                  
                  <span className="font-medium">Status:</span>
                  <span><StatusBadge status={formula.status} /></span>
                  
                  <span className="font-medium">Date:</span>
                  <span>{new Date(formula.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="pt-2 space-y-2">
                  {fileUrl && (
                    <Button size="sm" variant="outline" onClick={() => window.open(fileUrl, '_blank')}>
                      View Original File
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    onClick={parseExcelFile} 
                    disabled={isParsing || !fileUrl}
                    className="w-full"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isParsing ? 'animate-spin' : ''}`} />
                    Parse Excel File
                  </Button>
                  {parsedData && (
                    <Button size="sm" variant="outline" onClick={downloadMasterExcel} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Master Excel
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="productName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Product name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="formulaNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Formula Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Formula number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reviewNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Review Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter general notes about this formula..." 
                            className="min-h-[80px]" 
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
                      <div className="flex gap-2">
                        <AutoCompleteButton
                          ingredients={form.watch('ingredients').map(ing => ({
                            id: ing.id,
                            name: ing.name,
                            percentage: ing.percentage,
                            compliant: ing.compliant,
                            notes: ing.notes || '',
                            casNumber: ing.casNumber || ''
                          }))}
                          onIngredientsUpdate={handleAutoCompleteUpdate}
                          disabled={form.watch('ingredients').length === 0}
                        />
                        <Button type="button" size="sm" onClick={addIngredient}>
                          <Plus className="h-4 w-4 mr-1" /> Add Ingredient
                        </Button>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-28">CAS Number</TableHead>
                            <TableHead>INCI Name</TableHead>
                            <TableHead className="w-20">Conc. %</TableHead>
                            <TableHead className="w-32">Chemical Name</TableHead>
                            <TableHead className="w-20">AICS</TableHead>
                            <TableHead className="w-20">SIR</TableHead>
                            <TableHead className="w-20">SUSMP</TableHead>
                            <TableHead className="w-20">NZOIC</TableHead>
                            <TableHead className="w-20">Compliant</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {form.watch('ingredients').map((_, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Input
                                  {...form.register(`ingredients.${index}.casNumber`)}
                                  placeholder="CAS #"
                                  className="text-xs"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  {...form.register(`ingredients.${index}.name`)}
                                  placeholder="INCI name"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  {...form.register(`ingredients.${index}.percentage`)}
                                  placeholder="%"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={form.watch(`ingredients.${index}.chemicalName`) || ''}
                                  readOnly
                                  className="bg-gray-50 text-xs"
                                  placeholder="Auto-filled"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={form.watch(`ingredients.${index}.aicsListed`) || ''}
                                  readOnly
                                  className="bg-gray-50 text-xs"
                                  placeholder="Auto"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={form.watch(`ingredients.${index}.sir`) || ''}
                                  readOnly
                                  className="bg-gray-50 text-xs"
                                  placeholder="Auto"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={form.watch(`ingredients.${index}.susmp`) || ''}
                                  readOnly
                                  className="bg-gray-50 text-xs"
                                  placeholder="Auto"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={form.watch(`ingredients.${index}.nzoic`) || ''}
                                  readOnly
                                  className="bg-gray-50 text-xs"
                                  placeholder="Auto"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center">
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
                                  placeholder="Notes"
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
                  </div>
                  
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Review
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleGenerateReport}
                      disabled={isSubmitting}
                      variant="default"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Complete & Generate Report
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedFormulaReviewDialog;
