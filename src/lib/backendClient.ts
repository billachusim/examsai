import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { MeResponse } from "@/lib/api";

type Profile = NonNullable<MeResponse["profile"]>;

export type TutorMessage = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
  subject_slug: string;
  user_id: string;
  id: string;
};

export type LeaderboardRow = {
  rank: number;
  first_name: string;
  school: string;
  correct: number;
  answered: number;
  accuracy: number;
  is_me: boolean;
};

type BackendDatabase = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: never;
        Update: Partial<Pick<Profile, "full_name" | "phone" | "school" | "exam_target" | "subjects">>;
        Relationships: [];
      };
      tutor_messages: {
        Row: TutorMessage;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      get_leaderboard: { Args: { p_limit?: number }; Returns: LeaderboardRow[] };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// The pending real-backend migration defines these contracts. Reuse the managed
// client (and its session storage); generated types still reflect the old schema.
// This typing adapter does not apply the migration or make missing tables exist.
export const backendClient = supabase as unknown as SupabaseClient<BackendDatabase>;