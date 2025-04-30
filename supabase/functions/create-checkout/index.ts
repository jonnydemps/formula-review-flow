
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

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Check if Stripe Secret Key is available
    if (!stripeSecretKey) {
      logStep("ERROR: Missing Stripe Secret Key");
      throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    logStep("Stripe initialized");

    // Parse request body
    const requestData = await req.json();
    const { formulaId, amount } = requestData;
    logStep("Request received", { formulaId, amount });
    
    if (!formulaId || !amount) {
      logStep("ERROR: Missing required parameters");
      throw new Error("Missing required parameters: formulaId and amount");
    }

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { persistSession: false }
    });
    logStep("Supabase client created");

    // Get formula details to include in checkout
    const { data: formula, error: formulaError } = await supabase
      .from('formulas')
      .select('original_filename, customer_id')
      .eq('id', formulaId)
      .single();

    if (formulaError) {
      logStep("ERROR: Error fetching formula", formulaError);
      throw new Error(`Error fetching formula: ${formulaError.message}`);
    }
    logStep("Formula details retrieved", formula);

    // Get user email for the customer
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('name, id')
      .eq('id', formula.customer_id)
      .single();

    if (userError) {
      logStep("WARNING: Could not fetch user profile", userError);
      // Continue without user profile, not critical
    } else {
      logStep("User profile retrieved", userProfile);
    }

    // Get auth user email
    const { data: authUser, error: authError } = await supabase.auth
      .admin.getUserById(formula.customer_id);

    if (authError) {
      logStep("WARNING: Could not fetch auth user", authError);
      // Continue without auth user, not critical
    } else {
      logStep("Auth user retrieved", { email: authUser.user?.email });
    }

    // Create a Stripe Checkout Session
    const customerName = userProfile?.name || "Customer";
    const customerEmail = authUser?.user?.email || undefined;
    
    logStep("Creating checkout session", { customerName, customerEmail, amount });
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
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
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

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
    logStep("ERROR creating checkout session", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
