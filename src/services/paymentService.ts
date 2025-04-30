
import { supabase } from '@/integrations/supabase/client';

// In a real app, this would integrate with Stripe or another payment processor
export const processPayment = async (formulaId: string, amount: number) => {
  // Update formula status to paid
  const { data, error } = await supabase
    .from('formulas')
    .update({
      status: 'paid'
    })
    .eq('id', formulaId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Create checkout session with Stripe
export const createCheckoutSession = async (formulaId: string, amount: number) => {
  try {
    console.log(`Creating checkout session for formula: ${formulaId}, amount: $${amount}`);
    
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { formulaId, amount }
    });

    console.log('Checkout session response:', data, error);

    if (error) {
      console.error('Error from create-checkout function:', error);
      throw error;
    }
    
    if (!data.success) {
      console.error('Checkout session creation failed:', data.error || 'Unknown error');
      throw new Error(data.error || 'Failed to create checkout session');
    }
    
    console.log('Checkout session created successfully:', data.url);
    return {
      id: data.sessionId,
      url: data.url
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Handle successful payment after Stripe redirects back to the app
export const handlePaymentSuccess = async (formulaId: string) => {
  try {
    console.log('Processing payment success for formula:', formulaId);
    
    // Mark the formula as paid in the database
    const { data, error } = await supabase
      .from('formulas')
      .update({ status: 'paid' })
      .eq('id', formulaId)
      .select()
      .single();
      
    if (error) throw error;
    
    console.log('Formula marked as paid:', data);
    return data;
  } catch (error: any) {
    console.error('Error handling payment success:', error);
    throw error;
  }
};
