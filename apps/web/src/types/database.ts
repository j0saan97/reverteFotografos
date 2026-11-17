export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      availability_blocks: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          photographer_id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          photographer_id: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          photographer_id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'availability_blocks_photographer_id_fkey'
            columns: ['photographer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      availability_rules: {
        Row: {
          end_time: string
          id: string
          photographer_id: string
          start_time: string
          weekday: number
        }
        Insert: {
          end_time: string
          id?: string
          photographer_id: string
          start_time: string
          weekday: number
        }
        Update: {
          end_time?: string
          id?: string
          photographer_id?: string
          start_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: 'availability_rules_photographer_id_fkey'
            columns: ['photographer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      booking_products: {
        Row: {
          active: boolean
          created_at: string
          deposit_cents: number | null
          description: string | null
          duration_minutes: number | null
          full_day: boolean
          id: string
          name: string
          photographer_id: string
          position: number
          price_cents: number | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          deposit_cents?: number | null
          description?: string | null
          duration_minutes?: number | null
          full_day?: boolean
          id?: string
          name: string
          photographer_id: string
          position?: number
          price_cents?: number | null
        }
        Update: {
          active?: boolean
          created_at?: string
          deposit_cents?: number | null
          description?: string | null
          duration_minutes?: number | null
          full_day?: boolean
          id?: string
          name?: string
          photographer_id?: string
          position?: number
          price_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'booking_products_photographer_id_fkey'
            columns: ['photographer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      bookings: {
        Row: {
          client_id: string
          client_note: string | null
          code: string
          created_at: string
          ends_at: string
          expires_at: string | null
          id: string
          photographer_id: string
          photographer_note: string | null
          product_id: string
          starts_at: string
          status: Database['public']['Enums']['booking_status']
          updated_at: string
        }
        Insert: {
          client_id: string
          client_note?: string | null
          code: string
          created_at?: string
          ends_at: string
          expires_at?: string | null
          id?: string
          photographer_id: string
          photographer_note?: string | null
          product_id: string
          starts_at: string
          status?: Database['public']['Enums']['booking_status']
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_note?: string | null
          code?: string
          created_at?: string
          ends_at?: string
          expires_at?: string | null
          id?: string
          photographer_id?: string
          photographer_note?: string | null
          product_id?: string
          starts_at?: string
          status?: Database['public']['Enums']['booking_status']
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_photographer_id_fkey'
            columns: ['photographer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'booking_products'
            referencedColumns: ['id']
          },
        ]
      }
      contact_requests: {
        Row: {
          created_at: string
          email: string
          event_date: string | null
          handled: boolean
          id: string
          message: string
          name: string
          phone: string | null
          session_type: string
        }
        Insert: {
          created_at?: string
          email: string
          event_date?: string | null
          handled?: boolean
          id?: string
          message: string
          name: string
          phone?: string | null
          session_type: string
        }
        Update: {
          created_at?: string
          email?: string
          event_date?: string | null
          handled?: boolean
          id?: string
          message?: string
          name?: string
          phone?: string | null
          session_type?: string
        }
        Relationships: []
      }
      downloads: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          ip: unknown
          photo_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          ip?: unknown
          photo_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          ip?: unknown
          photo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'downloads_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'downloads_photo_id_fkey'
            columns: ['photo_id']
            isOneToOne: false
            referencedRelation: 'photos'
            referencedColumns: ['id']
          },
        ]
      }
      galleries: {
        Row: {
          allow_download: boolean
          allow_selection: boolean
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          cover_photo_id: string | null
          created_at: string
          deleted_at: string | null
          expires_at: string | null
          has_pin: boolean | null
          id: string
          max_selection: number | null
          paid: boolean
          photographer_id: string
          pin_hash: string | null
          sent_at: string | null
          slug: string
          status: Database['public']['Enums']['gallery_status']
          title: string
          watermark_text: string | null
        }
        Insert: {
          allow_download?: boolean
          allow_selection?: boolean
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          cover_photo_id?: string | null
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          has_pin?: boolean | null
          id?: string
          max_selection?: number | null
          paid?: boolean
          photographer_id: string
          pin_hash?: string | null
          sent_at?: string | null
          slug: string
          status?: Database['public']['Enums']['gallery_status']
          title: string
          watermark_text?: string | null
        }
        Update: {
          allow_download?: boolean
          allow_selection?: boolean
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          cover_photo_id?: string | null
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          has_pin?: boolean | null
          id?: string
          max_selection?: number | null
          paid?: boolean
          photographer_id?: string
          pin_hash?: string | null
          sent_at?: string | null
          slug?: string
          status?: Database['public']['Enums']['gallery_status']
          title?: string
          watermark_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'galleries_cover_fk'
            columns: ['cover_photo_id']
            isOneToOne: false
            referencedRelation: 'photos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'galleries_photographer_id_fkey'
            columns: ['photographer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      gallery_access: {
        Row: {
          accepted_at: string | null
          client_id: string | null
          email: string
          gallery_id: string
          invited_at: string
          token_expires_at: string | null
          token_hash: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_id?: string | null
          email: string
          gallery_id: string
          invited_at?: string
          token_expires_at?: string | null
          token_hash?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_id?: string | null
          email?: string
          gallery_id?: string
          invited_at?: string
          token_expires_at?: string | null
          token_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'gallery_access_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gallery_access_gallery_id_fkey'
            columns: ['gallery_id']
            isOneToOne: false
            referencedRelation: 'galleries'
            referencedColumns: ['id']
          },
        ]
      }
      gallery_messages: {
        Row: {
          author_id: string
          body: string
          created_at: string
          gallery_id: string
          id: string
          photo_id: string | null
          read_at: string | null
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          gallery_id: string
          id?: string
          photo_id?: string | null
          read_at?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          gallery_id?: string
          id?: string
          photo_id?: string | null
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'gallery_messages_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gallery_messages_gallery_id_fkey'
            columns: ['gallery_id']
            isOneToOne: false
            referencedRelation: 'galleries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'gallery_messages_photo_id_fkey'
            columns: ['photo_id']
            isOneToOne: false
            referencedRelation: 'photos'
            referencedColumns: ['id']
          },
        ]
      }
      photos: {
        Row: {
          created_at: string
          filename: string
          gallery_id: string
          height: number | null
          id: string
          original_key: string
          position: number
          preview_key: string | null
          size_bytes: number | null
          status: Database['public']['Enums']['photo_status']
          thumb_key: string | null
          width: number | null
        }
        Insert: {
          created_at?: string
          filename: string
          gallery_id: string
          height?: number | null
          id?: string
          original_key: string
          position?: number
          preview_key?: string | null
          size_bytes?: number | null
          status?: Database['public']['Enums']['photo_status']
          thumb_key?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string
          filename?: string
          gallery_id?: string
          height?: number | null
          id?: string
          original_key?: string
          position?: number
          preview_key?: string | null
          size_bytes?: number | null
          status?: Database['public']['Enums']['photo_status']
          thumb_key?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'photos_gallery_id_fkey'
            columns: ['gallery_id']
            isOneToOne: false
            referencedRelation: 'galleries'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          brand_logo_key: string | null
          brand_name: string | null
          created_at: string
          display_name: string | null
          id: string
          role: Database['public']['Enums']['user_role']
        }
        Insert: {
          brand_logo_key?: string | null
          brand_name?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database['public']['Enums']['user_role']
        }
        Update: {
          brand_logo_key?: string | null
          brand_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database['public']['Enums']['user_role']
        }
        Relationships: []
      }
      selection_items: {
        Row: {
          comment: string | null
          created_at: string
          photo_id: string
          selection_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          photo_id: string
          selection_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          photo_id?: string
          selection_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'selection_items_photo_id_fkey'
            columns: ['photo_id']
            isOneToOne: false
            referencedRelation: 'photos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'selection_items_selection_id_fkey'
            columns: ['selection_id']
            isOneToOne: false
            referencedRelation: 'selections'
            referencedColumns: ['id']
          },
        ]
      }
      selections: {
        Row: {
          client_id: string
          client_note: string | null
          created_at: string
          gallery_id: string
          id: string
          reopened_at: string | null
          submitted_at: string | null
        }
        Insert: {
          client_id: string
          client_note?: string | null
          created_at?: string
          gallery_id: string
          id?: string
          reopened_at?: string | null
          submitted_at?: string | null
        }
        Update: {
          client_id?: string
          client_note?: string | null
          created_at?: string
          gallery_id?: string
          id?: string
          reopened_at?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'selections_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'selections_gallery_id_fkey'
            columns: ['gallery_id']
            isOneToOne: false
            referencedRelation: 'galleries'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      available_slots: {
        Args: { p_from: string; p_product: string; p_to: string }
        Returns: {
          ends_at: string
          starts_at: string
        }[]
      }
      business_tz: { Args: never; Returns: string }
      cancel_booking: {
        Args: { p_booking: string }
        Returns: {
          client_id: string
          client_note: string | null
          code: string
          created_at: string
          ends_at: string
          expires_at: string | null
          id: string
          photographer_id: string
          photographer_note: string | null
          product_id: string
          starts_at: string
          status: Database['public']['Enums']['booking_status']
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'bookings'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirm_booking: {
        Args: { p_booking: string }
        Returns: {
          client_id: string
          client_note: string | null
          code: string
          created_at: string
          ends_at: string
          expires_at: string | null
          id: string
          photographer_id: string
          photographer_note: string | null
          product_id: string
          starts_at: string
          status: Database['public']['Enums']['booking_status']
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'bookings'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      expire_pending_bookings: {
        Args: { p_photographer: string }
        Returns: undefined
      }
      has_gallery_access: { Args: { gid: string }; Returns: boolean }
      is_gallery_owner: { Args: { gid: string }; Returns: boolean }
      is_photographer: { Args: never; Returns: boolean }
      new_booking_code: { Args: never; Returns: string }
      request_booking: {
        Args: { p_note: string; p_product: string; p_starts_at: string }
        Returns: {
          client_id: string
          client_note: string | null
          code: string
          created_at: string
          ends_at: string
          expires_at: string | null
          id: string
          photographer_id: string
          photographer_note: string | null
          product_id: string
          starts_at: string
          status: Database['public']['Enums']['booking_status']
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'bookings'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      respond_booking: {
        Args: { p_accept: boolean; p_booking: string; p_note: string }
        Returns: {
          client_id: string
          client_note: string | null
          code: string
          created_at: string
          ends_at: string
          expires_at: string | null
          id: string
          photographer_id: string
          photographer_note: string | null
          product_id: string
          starts_at: string
          status: Database['public']['Enums']['booking_status']
          updated_at: string
        }
        SetofOptions: {
          from: '*'
          to: 'bookings'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_gallery_pin: {
        Args: { gallery_id: string; pin: string }
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | 'pending'
        | 'awaiting_payment'
        | 'payment_reported'
        | 'confirmed'
        | 'rejected'
        | 'cancelled'
        | 'expired'
      gallery_status: 'draft' | 'published' | 'archived'
      photo_status: 'uploading' | 'processing' | 'ready' | 'error'
      user_role: 'photographer' | 'client'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_status: [
        'pending',
        'awaiting_payment',
        'payment_reported',
        'confirmed',
        'rejected',
        'cancelled',
        'expired',
      ],
      gallery_status: ['draft', 'published', 'archived'],
      photo_status: ['uploading', 'processing', 'ready', 'error'],
      user_role: ['photographer', 'client'],
    },
  },
} as const
