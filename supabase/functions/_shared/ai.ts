import { HttpError } from "./cors.ts";

// Uses the Lovable AI gateway (OpenAI-compatible). LOVABLE_API_KEY is provided
// automatically in Lovable Cloud projects.
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
export const TUTOR_MODEL = Deno.env.get("EXAMSAI_TUTOR_MODEL") ?? "google/gemini-2.5-flash";
export const QUESTION_MODEL = Deno.env.get("EXAMSAI_QUESTION_MODEL") ?? "google/gemini-2.5-flash";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  opts: { model?: string; json?: boolean; temperature?: number } = {},
): Promise<string> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new HttpError(503, "The AI tutor is not configured yet.", "ai_not_configured");

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model ?? TUTOR_MODEL,
      messages,
      temperature: opts.temperature ?? 0.4,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (res.status === 429) {
    throw new HttpError(429, "The tutor is busy right now. Please try again in a minute.", "ai_rate_limited");
  }
  if (res.status === 402) {
    console.error("Lovable AI credits exhausted");
    throw new HttpError(503, "The AI tutor is temporarily unavailable.", "ai_unavailable");
  }
  if (!res.ok) {
    console.error("AI gateway error", res.status, await res.text());
    throw new HttpError(502, "The AI tutor could not answer. Please try again.", "ai_error");
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new HttpError(502, "The AI tutor gave an empty answer. Please try again.", "ai_error");
  }
  return content.trim();
}

/** Parses JSON from a model reply, tolerating ```json fences. */
export function parseModelJson<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned) as T;
}
