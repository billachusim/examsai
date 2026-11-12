import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_study_profile",
  title: "Read my study profile",
  description: "Read the connected student's name, school, main exam and chosen subjects; requires completed account migration.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Sign in to connect your account." }], isError: true };
    const client = supabaseForUser(ctx);
    const { data, error } = await client.from("profiles").select("full_name, school, exam_target, subjects").eq("id", ctx.getUserId()).maybeSingle();
    if (error || !data) return { content: [{ type: "text", text: "Your study profile is unavailable. Account migration may still be pending." }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify({ name: data.full_name, school: data.school, exam: data.exam_target, subjects: data.subjects }) }] };
  },
});