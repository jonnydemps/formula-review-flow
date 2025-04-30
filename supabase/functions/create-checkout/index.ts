
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(stripeSecretKey!, {
      apiVersion: "2023-10-16",
    });

    const { formulaId, amount } = await req.json();
    
    if (!formulaId || !amount) {
      throw new Error("Missing required parameters: formulaId and amount");
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { persistSession: false }
    });

    // Get formula details to include in checkout
    const { data: formula, error: formulaError } = await supabase
      .from('formulas')
      .select('original_filename')
      .eq('id', formulaId)
      .single();

    if (formulaError) {
      throw new Error(`Error fetching formula: ${formulaError.message}`);
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Formula Review",
              description: `Review for formula: ${formula.original_filename}`,
            },
            unit_amount: amount * 100, // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/customer-dashboard?payment_success=true&formula_id=${formulaId}`,
      cancel_url: `${req.headers.get("origin")}/customer-dashboard?payment_cancelled=true`,
      metadata: {
        formula_id: formulaId
      }
    });

    // Return the checkout URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        url: session.url,
        sessionId: session.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error creating checkout session: ${errorMessage}`);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
