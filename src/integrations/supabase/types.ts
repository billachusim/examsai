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
          answered_at: string
          attempt_id: string
          chosen: string | null
          is_correct: boolean
          question_id: string
          subject_slug: string
          topic: string | null
          user_id: string
        }
        Insert: {
          answered_at?: string
          attempt_id: string
          chosen?: string | null
          is_correct: boolean
          question_id: string
          subject_slug: string
          topic?: string | null
          user_id: string
        }
        Update: {
          answered_at?: string
          attempt_id?: string
          chosen?: string | null
          is_correct?: boolean
          question_id?: string
          subject_slug?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          exam: string
          id: string
          mode: string
          question_ids: string[]
          score: number | null
          started_at: string
          subjects: string[]
          submitted_at: string | null
          time_limit_seconds: number | null
          total: number
          user_id: string
        }
        Insert: {
          exam?: string
          id?: string
          mode: string
          question_ids: string[]
          score?: number | null
          started_at?: string
          subjects: string[]
          submitted_at?: string | null
          time_limit_seconds?: number | null
          total: number
          user_id: string
        }
        Update: {
          exam?: string
          id?: string
          mode?: string
          question_ids?: string[]
          score?: number | null
          started_at?: string
          subjects?: string[]
          submitted_at?: string | null
          time_limit_seconds?: number | null
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      daily_questions: {
        Row: {
          created_at: string | null
          faculty_id: string
          id: string
          question_date: string | null
          questions_count: number | null
        }
        Insert: {
          created_at?: string | null
          faculty_id: string
          id?: string
          question_date?: string | null
          questions_count?: number | null
        }
        Update: {
          created_at?: string | null
          faculty_id?: string
          id?: string
          question_date?: string | null
          questions_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_questions_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["faculty_id"]
          },
        ]
      }
      daily_usage: {
        Row: {
          day: string
          practice_questions: number
          tutor_messages: number
          user_id: string
        }
        Insert: {
          day?: string
          practice_questions?: number
          tutor_messages?: number
          user_id: string
        }
        Update: {
          day?: string
          practice_questions?: number
          tutor_messages?: number
          user_id?: string
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          expires_at: string
          plan: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          expires_at: string
          plan: string
          source: string
          updated_at?: string
          user_id: string
        }
        Update: {
          expires_at?: string
          plan?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          plan: string
          provider: string
          provider_transaction_id: string | null
          raw: Json | null
          reference: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          plan: string
          provider: string
          provider_transaction_id?: string | null
          raw?: Json | null
          reference: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          plan?: string
          provider?: string
          provider_transaction_id?: string | null
          raw?: Json | null
          reference?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activated: boolean | null
          created_at: string | null
          email: string
          exam_target: string
          faculty_id: string
          full_name: string
          has_paid: boolean | null
          id: string
          last_activity: string | null
          legacy_faculty_id: string | null
          name: string
          phone: string | null
          phone_number: string
          questions_asked_today: number | null
          school: string
          subjects: string[]
          subscription_expires_at: string | null
          subscription_type: string | null
          total_correct_answers: number | null
          total_questions_asked: number | null
          updated_at: string
        }
        Insert: {
          activated?: boolean | null
          created_at?: string | null
          email?: string
          exam_target?: string
          faculty_id: string
          full_name?: string
          has_paid?: boolean | null
          id?: string
          last_activity?: string | null
          legacy_faculty_id?: string | null
          name?: string
          phone?: string | null
          phone_number?: string
          questions_asked_today?: number | null
          school?: string
          subjects?: string[]
          subscription_expires_at?: string | null
          subscription_type?: string | null
          total_correct_answers?: number | null
          total_questions_asked?: number | null
          updated_at?: string
        }
        Update: {
          activated?: boolean | null
          created_at?: string | null
          email?: string
          exam_target?: string
          faculty_id?: string
          full_name?: string
          has_paid?: boolean | null
          id?: string
          last_activity?: string | null
          legacy_faculty_id?: string | null
          name?: string
          phone?: string | null
          phone_number?: string
          questions_asked_today?: number | null
          school?: string
          subjects?: string[]
          subscription_expires_at?: string | null
          subscription_type?: string | null
          total_correct_answers?: number | null
          total_questions_asked?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      question_reports: {
        Row: {
          created_at: string
          question_id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          question_id: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          question_id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answer: string
          created_at: string
          difficulty: string
          exam: string
          explanation: string
          flagged_count: number
          id: string
          options: Json
          reviewed: boolean
          source: string
          stem: string
          stem_hash: string | null
          subject_slug: string
          topic: string | null
          year: number | null
        }
        Insert: {
          answer: string
          created_at?: string
          difficulty?: string
          exam?: string
          explanation?: string
          flagged_count?: number
          id?: string
          options: Json
          reviewed?: boolean
          source?: string
          stem: string
          stem_hash?: string | null
          subject_slug: string
          topic?: string | null
          year?: number | null
        }
        Update: {
          answer?: string
          created_at?: string
          difficulty?: string
          exam?: string
          explanation?: string
          flagged_count?: number
          id?: string
          options?: Json
          reviewed?: boolean
          source?: string
          stem?: string
          stem_hash?: string | null
          subject_slug?: string
          topic?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_slug_fkey"
            columns: ["subject_slug"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["slug"]
          },
        ]
      }
      subjects: {
        Row: {
          exams: string[]
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          exams?: string[]
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          exams?: string[]
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      tutor_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          subject_slug: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          subject_slug: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          subject_slug?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_usage: {
        Args: { p_amount: number; p_kind: string; p_limit: number; uid: string }
        Returns: number
      }
      generate_faculty_id: { Args: never; Returns: string }
      get_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          accuracy: number
          answered: number
          correct: number
          first_name: string
          is_me: boolean
          rank: number
          school: string
        }[]
      }
      grant_premium: {
        Args: { p_days: number; p_plan: string; p_source: string; uid: string }
        Returns: string
      }
      is_premium: { Args: { uid: string }; Returns: boolean }
      report_question: {
        Args: { p_question_id: string; p_reason: string; p_user_id: string }
        Returns: undefined
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
