import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Loader2 } from 'lucide-react';

const quoteSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0').max(999999, 'Amount too large'),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  formulaId: string;
  currentQuote?: number;
  onSubmit: (formulaId: string, amount: number) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
  formulaId,
  currentQuote,
  onSubmit,
  isSubmitting = false,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      amount: currentQuote || 0,
    },
    mode: 'onChange',
  });

  const onFormSubmit = async (data: QuoteFormData) => {
    try {
      await onSubmit(formulaId, data.amount);
      reset();
    } catch (error) {
      console.error('Quote submission error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {currentQuote ? 'Update Quote' : 'Provide Quote'}
        </CardTitle>
        <CardDescription>
          {currentQuote 
            ? `Current quote: $${currentQuote}. Enter a new amount to update.`
            : 'Enter the quote amount for this formula review.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Quote Amount ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max="999999"
                placeholder="0.00"
                className="pl-10"
                {...register('amount', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                currentQuote ? 'Update Quote' : 'Provide Quote'
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuoteForm;