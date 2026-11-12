import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSubjects from "./tools/list-subjects";
import getProfile from "./tools/get-profile";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";
export default defineMcp({
  name: "examsng",
  title: "ExamsNG",
  version: "0.1.0",
  instructions: "Read exam subjects and the connected student's study profile. Profile access requires the pending account migration. No payment, message sending or account deletion tools are exposed.",
  auth: auth.oauth.issuer({ issuer: `https://${projectRef}.supabase.co/auth/v1`, acceptedAudiences: "authenticated" }),
  tools: [listSubjects, getProfile],
});