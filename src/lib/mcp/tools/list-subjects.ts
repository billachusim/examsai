import { defineTool } from "@lovable.dev/mcp-js";
import { SUBJECTS } from "../../examSubjects";

export default defineTool({
  name: "list_subjects",
  title: "List exam subjects",
  description: "List the study subjects available in ExamsNG.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_args, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Sign in to connect your account." }], isError: true };
    return { content: [{ type: "text", text: SUBJECTS.map(s => `${s.slug}: ${s.name}`).join("\n") }] };
  },
});