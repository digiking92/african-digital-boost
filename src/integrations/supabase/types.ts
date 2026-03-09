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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audits: {
        Row: {
          action_plan: Json
          breakdown: Json
          city: string
          competitors: Json
          content_blueprint: Json
          country: string
          created_at: string | null
          email: string | null
          full_name: string
          gaps: Json
          id: string
          profession: string
          raw_search_results: Json | null
          reaudit_consented: boolean | null
          score: number
          share_token: string
          tier: string
        }
        Insert: {
          action_plan?: Json
          breakdown?: Json
          city: string
          competitors?: Json
          content_blueprint?: Json
          country: string
          created_at?: string | null
          email?: string | null
          full_name: string
          gaps?: Json
          id?: string
          profession: string
          raw_search_results?: Json | null
          reaudit_consented?: boolean | null
          score: number
          share_token: string
          tier: string
        }
        Update: {
          action_plan?: Json
          breakdown?: Json
          city?: string
          competitors?: Json
          content_blueprint?: Json
          country?: string
          created_at?: string | null
          email?: string | null
          full_name?: string
          gaps?: Json
          id?: string
          profession?: string
          raw_search_results?: Json | null
          reaudit_consented?: boolean | null
          score?: number
          share_token?: string
          tier?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          audit_id: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          offer_interest: string | null
          profession: string | null
          score: number | null
          source: string | null
          tier: string | null
        }
        Insert: {
          audit_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          offer_interest?: string | null
          profession?: string | null
          score?: number | null
          source?: string | null
          tier?: string | null
        }
        Update: {
          audit_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          offer_interest?: string | null
          profession?: string | null
          score?: number | null
          source?: string | null
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      reaudit_queue: {
        Row: {
          audit_id: string
          created_at: string | null
          email: string
          id: string
          scheduled_at: string
          sent: boolean | null
          sent_at: string | null
        }
        Insert: {
          audit_id: string
          created_at?: string | null
          email: string
          id?: string
          scheduled_at: string
          sent?: boolean | null
          sent_at?: string | null
        }
        Update: {
          audit_id?: string
          created_at?: string | null
          email?: string
          id?: string
          scheduled_at?: string
          sent?: boolean | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reaudit_queue_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      share_events: {
        Row: {
          audit_id: string | null
          created_at: string | null
          id: string
          platform: string
        }
        Insert: {
          audit_id?: string | null
          created_at?: string | null
          id?: string
          platform: string
        }
        Update: {
          audit_id?: string | null
          created_at?: string | null
          id?: string
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_events_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      audit_summary: {
        Row: {
          avg_score: number | null
          country: string | null
          day: string | null
          emails_captured: number | null
          profession: string | null
          tier: string | null
          total_audits: number | null
        }
        Relationships: []
      }
      leads_summary: {
        Row: {
          avg_score: number | null
          country: string | null
          latest_lead: string | null
          offer_interest: string | null
          total_leads: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_audit_by_share_token: {
        Args: { p_share_token: string }
        Returns: {
          action_plan: Json
          breakdown: Json
          city: string
          competitors: Json
          content_blueprint: Json
          country: string
          created_at: string | null
          email: string | null
          full_name: string
          gaps: Json
          id: string
          profession: string
          raw_search_results: Json | null
          reaudit_consented: boolean | null
          score: number
          share_token: string
          tier: string
        }[]
        SetofOptions: {
          from: "*"
          to: "audits"
          isOneToOne: false
          isSetofReturn: true
        }
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
