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
    const { facultyId } = await req.json();

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

    // Get user profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("faculty_id", facultyId)
      .single();

    if (error || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check if user is paid
    if (profile.has_paid) {
      return new Response(
        JSON.stringify({ 
          canAsk: true, 
          questionsLeft: -1, // Unlimited
          isPaid: true,
          questionsToday: profile.questions_asked_today 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Free user - check daily limit
    const questionsToday = profile.questions_asked_today || 0;
    const canAsk = questionsToday < 3;
    const questionsLeft = Math.max(0, 3 - questionsToday);

    return new Response(
      JSON.stringify({ 
        canAsk, 
        questionsLeft,
        isPaid: false,
        questionsToday 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in check-daily-limit:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
