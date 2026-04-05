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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          date: string
          time: string
          venue: string
          city: string
          language: string
          price: number
          image: string | null
          lat: number
          lng: number
          total_seats: number
          available_seats: number
          family_friendly: boolean
          has_parking: boolean
          parking_slots: number
          artist: string | null
          tags: string[]
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          date: string
          time: string
          venue: string
          city: string
          language: string
          price: number
          image?: string | null
          lat: number
          lng: number
          total_seats: number
          available_seats: number
          family_friendly?: boolean
          has_parking?: boolean
          parking_slots?: number
          artist?: string | null
          tags?: string[]
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          date?: string
          time?: string
          venue?: string
          city?: string
          language?: string
          price?: number
          image?: string | null
          lat?: number
          lng?: number
          total_seats?: number
          available_seats?: number
          family_friendly?: boolean
          has_parking?: boolean
          parking_slots?: number
          artist?: string | null
          tags?: string[]
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          event_id: string
          seats: string[]
          total_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          seats: string[]
          total_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          seats?: string[]
          total_amount?: number
          created_at?: string
        }
      }
      parking_allocations: {
        Row: {
          id: string
          booking_id: string
          user_id: string
          event_id: string
          zone: string
          slot_number: number
          vehicle_type: string
          gate_hint: string
          fee: number
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          user_id: string
          event_id: string
          zone: string
          slot_number: number
          vehicle_type: string
          gate_hint: string
          fee: number
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          user_id?: string
          event_id?: string
          zone?: string
          slot_number?: number
          vehicle_type?: string
          gate_hint?: string
          fee?: number
          created_at?: string
        }
      }
      payment_attempts: {
        Row: {
          id: string
          user_id: string
          event_id: string
          amount: number
          status: string
          failure_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          amount: number
          status: string
          failure_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          amount?: number
          status?: string
          failure_reason?: string | null
          created_at?: string
        }
      }
      user_credits: {
        Row: {
          user_id: string
          balance: number
          updated_at: string
        }
        Insert: {
          user_id: string
          balance?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          balance?: number
          updated_at?: string
        }
      }
      credit_ledger: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          linked_attempt_id: string | null
          linked_booking_id: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          linked_attempt_id?: string | null
          linked_booking_id?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          linked_attempt_id?: string | null
          linked_booking_id?: string | null
          timestamp?: string
        }
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
