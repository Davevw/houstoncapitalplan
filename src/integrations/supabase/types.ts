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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          approved_at: string | null
          company: string
          created_at: string
          email: string
          id: string
          investor_type: string
          name: string
          status: string
        }
        Insert: {
          approved_at?: string | null
          company: string
          created_at?: string
          email: string
          id?: string
          investor_type: string
          name: string
          status?: string
        }
        Update: {
          approved_at?: string | null
          company?: string
          created_at?: string
          email?: string
          id?: string
          investor_type?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      design_requests: {
        Row: {
          clarifications: Json
          concept_name: string
          created_at: string
          description: string
          id: string
          priority_lots: string | null
          status: string
          submitted_by: string | null
          target_client_type: string
        }
        Insert: {
          clarifications?: Json
          concept_name: string
          created_at?: string
          description: string
          id?: string
          priority_lots?: string | null
          status?: string
          submitted_by?: string | null
          target_client_type: string
        }
        Update: {
          clarifications?: Json
          concept_name?: string
          created_at?: string
          description?: string
          id?: string
          priority_lots?: string | null
          status?: string
          submitted_by?: string | null
          target_client_type?: string
        }
        Relationships: []
      }
      design_scenarios: {
        Row: {
          created_at: string
          description: string | null
          district_summary: Json
          id: string
          lot_assignments: Json
          name: string
          slug: string
          status: string
          tagline: string | null
          target_profile: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          district_summary?: Json
          id?: string
          lot_assignments?: Json
          name: string
          slug: string
          status?: string
          tagline?: string | null
          target_profile?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          district_summary?: Json
          id?: string
          lot_assignments?: Json
          name?: string
          slug?: string
          status?: string
          tagline?: string | null
          target_profile?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lot_economics: {
        Row: {
          acreage: number | null
          adjusted_price_per_acre: number | null
          assumptions: Json
          base_price_per_acre: number | null
          capital_paydown_forecast: number | null
          created_at: string
          disposition: string | null
          district: string | null
          estimated_development_cost: number | null
          estimated_lot_value: number | null
          id: string
          lot_number: number
          position: string | null
          position_premium: number | null
          projected_net_proceeds: number | null
          projected_noi: number | null
          projected_revenue: number | null
          scenario_id: string
          simple_roi: number | null
          updated_at: string
        }
        Insert: {
          acreage?: number | null
          adjusted_price_per_acre?: number | null
          assumptions?: Json
          base_price_per_acre?: number | null
          capital_paydown_forecast?: number | null
          created_at?: string
          disposition?: string | null
          district?: string | null
          estimated_development_cost?: number | null
          estimated_lot_value?: number | null
          id?: string
          lot_number: number
          position?: string | null
          position_premium?: number | null
          projected_net_proceeds?: number | null
          projected_noi?: number | null
          projected_revenue?: number | null
          scenario_id: string
          simple_roi?: number | null
          updated_at?: string
        }
        Update: {
          acreage?: number | null
          adjusted_price_per_acre?: number | null
          assumptions?: Json
          base_price_per_acre?: number | null
          capital_paydown_forecast?: number | null
          created_at?: string
          disposition?: string | null
          district?: string | null
          estimated_development_cost?: number | null
          estimated_lot_value?: number | null
          id?: string
          lot_number?: number
          position?: string | null
          position_premium?: number | null
          projected_net_proceeds?: number | null
          projected_noi?: number | null
          projected_revenue?: number | null
          scenario_id?: string
          simple_roi?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lot_economics_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "design_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_documents: {
        Row: {
          category: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          name: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          category: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          name: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          name?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
