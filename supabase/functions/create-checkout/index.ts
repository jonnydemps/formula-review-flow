
// Follow this setup guide to integrate the Deno runtime with your Next.js app:
// https://deno.land/deploy/docs/nextjs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts";

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') || '';
// Use a hardcoded APP_URL that always points to the actual app, not the Supabase function domain
const APP_URL = Deno.env.get('SITE_URL') || 'https://lovable.dev';

interface RequestBody {
  formulaId: string;
  amount: number;
}

serve(async (req) => {
  console.log("Request received to create-checkout function");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Parse the request body
    const { formulaId, amount } = await req.json() as RequestBody;
    
    console.log(`Creating checkout session for formula: ${formulaId}, amount: $${amount}`);
    
    if (!formulaId || !amount) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: formulaId and amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if STRIPE_SECRET_KEY is configured
    if (!STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      return new Response(
        JSON.stringify({ 
          error: 'STRIPE_SECRET_KEY is not configured. Please set up Stripe Secret Key in your Supabase project.',
          missingKey: true
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Stripe
    const stripe = await import('https://esm.sh/stripe@12.4.0');
    const stripeClient = new stripe.default(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    
    // Always use the APP_URL for redirects, not the request origin
    console.log(`Using redirect base URL: ${APP_URL}`);
    
    // Create a checkout session with absolute URLs to the application, not to the Supabase function domain
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Formula Review Service',
              description: `Review for formula ID: ${formulaId}`,
            },
            unit_amount: amount * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Use complete URLs to the app domain, not the function domain
      success_url: `${APP_URL}/customer-dashboard/payment-success/${formulaId}`,
      cancel_url: `${APP_URL}/customer-dashboard/payment-cancelled`,
    });
    
    console.log('Created checkout session:', session.id, 'with URL:', session.url);
    
    return new Response(
      JSON.stringify({ 
        url: session.url, 
        sessionId: session.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create checkout session',
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
