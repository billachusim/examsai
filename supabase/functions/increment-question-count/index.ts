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
    const { facultyId, isCorrect } = await req.json();

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

    // Get current profile
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("faculty_id", facultyId)
      .single();

    if (fetchError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Increment question count
    const updates: any = {
      questions_asked_today: (profile.questions_asked_today || 0) + 1,
      total_questions_asked: (profile.total_questions_asked || 0) + 1,
      last_activity: new Date().toISOString(),
    };

    // Update correct answers if applicable
    if (isCorrect) {
      updates.total_correct_answers = (profile.total_correct_answers || 0) + 1;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("faculty_id", facultyId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update question count" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        questionsToday: updates.questions_asked_today,
        totalQuestions: updates.total_questions_asked 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in increment-question-count:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
