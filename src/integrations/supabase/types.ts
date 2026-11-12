export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attempt_answers: {
        Row: {
          attempt_id: string
          question_id: string
          user_id: string
          subject_slug: string
          topic: string | null
          chosen: string | null
          is_correct: boolean
          answered_at: string
        }
        Insert: {
          attempt_id: string
          question_id: string
          user_id: string
          subject_slug: string
          topic?: string | null
          chosen?: string | null
          is_correct: boolean
          answered_at?: string
        }
        Update: {
          attempt_id?: string
          question_id?: string
          user_id?: string
          subject_slug?: string
          topic?: string | null
          chosen?: string | null
          is_correct?: boolean
          answered_at?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          id: string
          user_id: string
          mode: string
          exam: string
          subjects: string[]
          question_ids: string[]
          time_limit_seconds: number | null
          started_at: string
          submitted_at: string | null
          score: number | null
          total: number
        }
        Insert: {
          id?: string
          user_id: string
          mode: string
          exam?: string
          subjects: string[]
          question_ids: string[]
          time_limit_seconds?: number | null
          started_at?: string
          submitted_at?: string | null
          score?: number | null
          total: number
        }
        Update: {
          id?: string
          user_id?: string
          mode?: string
          exam?: string
          subjects?: string[]
          question_ids?: string[]
          time_limit_seconds?: number | null
          started_at?: string
          submitted_at?: string | null
          score?: number | null
          total?: number
        }
        Relationships: []
      }
      daily_usage: {
        Row: {
          user_id: string
          day: string
          tutor_messages: number
          practice_questions: number
        }
        Insert: {
          user_id: string
          day?: string
          tutor_messages?: number
          practice_questions?: number
        }
        Update: {
          user_id?: string
          day?: string
          tutor_messages?: number
          practice_questions?: number
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          user_id: string
          plan: string
          expires_at: string
          source: string
          updated_at: string
        }
        Insert: {
          user_id: string
          plan: string
          expires_at: string
          source: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          plan?: string
          expires_at?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          user_id: string | null
          provider: string
          reference: string
          plan: string
          amount: number | null
          currency: string | null
          status: string
          provider_transaction_id: string | null
          raw: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          provider: string
          reference: string
          plan: string
          amount?: number | null
          currency?: string | null
          status?: string
          provider_transaction_id?: string | null
          raw?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          provider?: string
          reference?: string
          plan?: string
          amount?: number | null
          currency?: string | null
          status?: string
          provider_transaction_id?: string | null
          raw?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          faculty_id: string
          full_name: string
          phone: string | null
          school: string | null
          exam_target: string
          subjects: string[]
          legacy_faculty_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          faculty_id: string
          full_name?: string
          phone?: string | null
          school?: string | null
          exam_target?: string
          subjects?: string[]
          legacy_faculty_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          faculty_id?: string
          full_name?: string
          phone?: string | null
          school?: string | null
          exam_target?: string
          subjects?: string[]
          legacy_faculty_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          slug: string
          name: string
          exams: string[]
          sort_order: number
        }
        Insert: {
          slug: string
          name: string
          exams?: string[]
          sort_order?: number
        }
        Update: {
          slug?: string
          name?: string
          exams?: string[]
          sort_order?: number
        }
        Relationships: []
      }
      tutor_messages: {
        Row: {
          id: string
          user_id: string
          subject_slug: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_slug: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_slug?: string
          role?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          rank: number
          first_name: string
          school: string
          correct: number
          answered: number
          accuracy: number
          is_me: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
