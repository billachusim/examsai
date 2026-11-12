import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
export { SUBJECTS, subjectName } from "./examSubjects";

export class ApiError extends Error {
  constructor(message: string, public code: string | null = null, public status = 0) {
    super(message);
  }
}

/** Calls an edge function with the signed-in user's token and unwraps errors. */
export async function callFunction<T>(name: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const res = error.context as Response;
      let payload: { error?: string; code?: string } = {};
      try {
        payload = await res.json();
      } catch {
        /* not JSON */
      }
      throw new ApiError(payload.error ?? "Something went wrong. Please try again.", payload.code ?? null, res.status);
    }
    throw new ApiError("Network problem. Check your connection and try again.", "network");
  }
  return data as T;
}

export interface Plan {
  id: "day" | "monthly" | "quarter";
  name: string;
  priceNgn: number;
  days: number;
}

export interface MeResponse {
  user: { id: string; email: string | null };
  profile: {
    id: string;
    faculty_id: string;
    full_name: string;
    phone: string | null;
    school: string | null;
    exam_target: "JAMB" | "WAEC" | "NECO";
    subjects: string[];
    created_at: string;
  } | null;
  premium: { active: boolean; plan: string | null; expiresAt: string | null; source: string | null };
  usage: { tutorUsed: number; practiceUsed: number; tutorLimit: number | null; practiceLimit: number | null };
  plans: Plan[];
  progress: {
    subject: string;
    name: string;
    answered: number;
    correct: number;
    accuracy: number;
    weakTopics: { topic: string; accuracy: number; answered: number }[];
  }[];
  recentAttempts: { id: string; mode: string; subjects: string[]; score: number; total: number; submitted_at: string }[];
}

export interface PublicQuestion {
  id: string;
  subject: string;
  topic: string | null;
  exam: string;
  year: number | null;
  stem: string;
  options: { key: string; text: string }[];
  difficulty: string;
}

export interface StartResponse {
  attemptId: string;
  mode: "practice" | "mock";
  exam: string;
  subjects: string[];
  startedAt: string;
  timeLimitSeconds: number | null;
  questions: PublicQuestion[];
}

export interface SubmitResponse {
  attemptId: string;
  score: number;
  total: number;
  late: boolean;
  bySubject: { subject: string; name: string; correct: number; total: number }[];
  results: {
    questionId: string;
    subject: string;
    topic: string | null;
    stem: string;
    options: { key: string; text: string }[];
    chosen: string | null;
    answer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

