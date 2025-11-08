import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { facultyId, hasPaid, subscriptionType } = await req.json();

    if (!facultyId) {
      return new Response(
        JSON.stringify({ error: "Faculty ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update profile to activate and set payment status
    const updates: any = {
      activated: true,
    };

    if (hasPaid !== undefined) {
      updates.has_paid = hasPaid;
    }

    if (subscriptionType) {
      updates.subscription_type = subscriptionType;
      
      // Set subscription expiry (30 days from now for paid users)
      if (hasPaid) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        updates.subscription_expires_at = expiryDate.toISOString();
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("faculty_id", facultyId)
      .select()
      .single();

    if (error) {
      console.error("Error activating user:", error);
      return new Response(
        JSON.stringify({ error: "Failed to activate user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `User ${facultyId} activated successfully`,
        profile: data
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in admin-activate-user:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
