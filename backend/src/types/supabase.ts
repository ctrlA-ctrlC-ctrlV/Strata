// TypeScript types generated from Supabase PostgreSQL schema
// Generated for MongoDB to Supabase migration
// Date: 2025-10-23

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Database table types
export interface Database {
  public: {
    Tables: {
      product_configurations: {
        Row: {
          id: string
          product_type: 'garden-room' | 'house-extension' | 'house-build'
          width_m: number
          depth_m: number
          height_m: number
          cladding_area_sqm: number
          bathroom_half: number
          bathroom_three_quarter: number
          electrical_switches: number
          electrical_sockets: number
          electrical_downlight: number
          electrical_heater: number | null
          electrical_undersink_heater: number | null
          electrical_elec_boiler: number | null
          internal_doors: number
          internal_wall_finish: 'none' | 'panel' | 'skimPaint'
          internal_wall_area_sqm: number | null
          heaters: number
          floor_type: 'none' | 'wooden' | 'tile'
          floor_area_sqm: number
          delivery_distance_km: number | null
          delivery_cost: number
          extras_esp_insulation: number | null
          extras_render: number | null
          extras_steel_door: number | null
          extras_other: Json
          estimate_currency: string
          estimate_subtotal_ex_vat: number
          estimate_vat_rate: number
          estimate_total_inc_vat: number
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_type: 'garden-room' | 'house-extension' | 'house-build'
          width_m: number
          depth_m: number
          height_m: number
          cladding_area_sqm: number
          bathroom_half?: number
          bathroom_three_quarter?: number
          electrical_switches?: number
          electrical_sockets?: number
          electrical_downlight?: number
          electrical_heater?: number | null
          electrical_undersink_heater?: number | null
          electrical_elec_boiler?: number | null
          internal_doors?: number
          internal_wall_finish?: 'none' | 'panel' | 'skimPaint'
          internal_wall_area_sqm?: number | null
          heaters?: number
          floor_type?: 'none' | 'wooden' | 'tile'
          floor_area_sqm: number
          delivery_distance_km?: number | null
          delivery_cost: number
          extras_esp_insulation?: number | null
          extras_render?: number | null
          extras_steel_door?: number | null
          extras_other?: Json
          estimate_currency?: string
          estimate_subtotal_ex_vat: number
          estimate_vat_rate: number
          estimate_total_inc_vat: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_type?: 'garden-room' | 'house-extension' | 'house-build'
          width_m?: number
          depth_m?: number
          height_m?: number
          cladding_area_sqm?: number
          bathroom_half?: number
          bathroom_three_quarter?: number
          electrical_switches?: number
          electrical_sockets?: number
          electrical_downlight?: number
          electrical_heater?: number | null
          electrical_undersink_heater?: number | null
          electrical_elec_boiler?: number | null
          internal_doors?: number
          internal_wall_finish?: 'none' | 'panel' | 'skimPaint'
          internal_wall_area_sqm?: number | null
          heaters?: number
          floor_type?: 'none' | 'wooden' | 'tile'
          floor_area_sqm?: number
          delivery_distance_km?: number | null
          delivery_cost?: number
          extras_esp_insulation?: number | null
          extras_render?: number | null
          extras_steel_door?: number | null
          extras_other?: Json
          estimate_currency?: string
          estimate_subtotal_ex_vat?: number
          estimate_vat_rate?: number
          estimate_total_inc_vat?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      glazing_elements: {
        Row: {
          id: string
          configuration_id: string
          element_type: 'window' | 'external_door' | 'skylight'
          width_m: number
          height_m: number
          created_at: string
        }
        Insert: {
          id?: string
          configuration_id: string
          element_type: 'window' | 'external_door' | 'skylight'
          width_m: number
          height_m: number
          created_at?: string
        }
        Update: {
          id?: string
          configuration_id?: string
          element_type?: 'window' | 'external_door' | 'skylight'
          width_m?: number
          height_m?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "glazing_elements_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "product_configurations"
            referencedColumns: ["id"]
          }
        ]
      }
      permitted_development_flags: {
        Row: {
          id: string
          configuration_id: string
          code: string
          label: string
          created_at: string
        }
        Insert: {
          id?: string
          configuration_id: string
          code: string
          label: string
          created_at?: string
        }
        Update: {
          id?: string
          configuration_id?: string
          code?: string
          label?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "permitted_development_flags_configuration_id_fkey"
            columns: ["configuration_id"]
            referencedRelation: "product_configurations"
            referencedColumns: ["id"]
          }
        ]
      }
      quote_requests: {
        Row: {
          id: string
          configuration_id: string
          customer_first_name: string
          customer_last_name: string | null
          customer_email: string
          customer_phone_country_prefix: string
          customer_phone_number: string
          customer_address_line1: string
          customer_address_line2: string | null
          customer_town: string | null
          customer_county: string | null
          customer_eircode: string
          desired_install_timeframe: string
          quote_number: string
          payment_status: 'pre-quote' | 'quoted' | 'deposit-paid' | 'installments' | 'paid' | 'overdue' | 'refunded'
          payment_total_paid: number
          payment_expected_installments: number | null
          payment_last_payment_at: string | null
          payment_created_at: string
          payment_updated_at: string
          retention_expires_at: string
          submitted_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          configuration_id: string
          customer_first_name: string
          customer_last_name?: string | null
          customer_email: string
          customer_phone_country_prefix: string
          customer_phone_number: string
          customer_address_line1: string
          customer_address_line2?: string | null
          customer_town?: string | null
          customer_county?: string | null
          customer_eircode: string
          desired_install_timeframe: string
          quote_number: string
          payment_status?: 'pre-quote' | 'quoted' | 'deposit-paid' | 'installments' | 'paid' | 'overdue' | 'refunded'
          payment_total_paid?: number
          payment_expected_installments?: number | null
          payment_last_payment_at?: string | null
          payment_created_at?: string
          payment_updated_at?: string
          retention_expires_at: string
          submitted_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          configuration_id?: string
          customer_first_name?: string
          customer_last_name?: string | null
          customer_email?: string
          customer_phone_country_prefix?: string
          customer_phone_number?: string
          customer_address_line1?: string
          customer_address_line2?: string | null
          customer_town?: string | null
          customer_county?: string | null
          customer_eircode?: string
          desired_install_timeframe?: string
          quote_number?: string
          payment_status?: 'pre-quote' | 'quoted' | 'deposit-paid' | 'installments' | 'paid' | 'overdue' | 'refunded'
          payment_total_paid?: number
          payment_expected_installments?: number | null
          payment_last_payment_at?: string | null
          payment_created_at?: string
          payment_updated_at?: string
          retention_expires_at?: string
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "product_configurations"
            referencedColumns: ["id"]
          }
        ]
      }
      payment_history: {
        Row: {
          id: string
          quote_request_id: string
          payment_type: 'DEPOSIT' | 'INSTALLMENT' | 'FINAL' | 'REFUND' | 'ADJUSTMENT'
          amount: number
          installment_number: number | null
          note: string | null
          recorded_by: string | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          quote_request_id: string
          payment_type: 'DEPOSIT' | 'INSTALLMENT' | 'FINAL' | 'REFUND' | 'ADJUSTMENT'
          amount: number
          installment_number?: number | null
          note?: string | null
          recorded_by?: string | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          quote_request_id?: string
          payment_type?: 'DEPOSIT' | 'INSTALLMENT' | 'FINAL' | 'REFUND' | 'ADJUSTMENT'
          amount?: number
          installment_number?: number | null
          note?: string | null
          recorded_by?: string | null
          timestamp?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_quote_request_id_fkey"
            columns: ["quote_request_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          }
        ]
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

// Convenience type aliases for easier usage
export type ProductConfiguration = Database['public']['Tables']['product_configurations']['Row']
export type ProductConfigurationInsert = Database['public']['Tables']['product_configurations']['Insert']
export type ProductConfigurationUpdate = Database['public']['Tables']['product_configurations']['Update']

export type GlazingElement = Database['public']['Tables']['glazing_elements']['Row']
export type GlazingElementInsert = Database['public']['Tables']['glazing_elements']['Insert']
export type GlazingElementUpdate = Database['public']['Tables']['glazing_elements']['Update']

export type PermittedDevelopmentFlag = Database['public']['Tables']['permitted_development_flags']['Row']
export type PermittedDevelopmentFlagInsert = Database['public']['Tables']['permitted_development_flags']['Insert']
export type PermittedDevelopmentFlagUpdate = Database['public']['Tables']['permitted_development_flags']['Update']

export type QuoteRequest = Database['public']['Tables']['quote_requests']['Row']
export type QuoteRequestInsert = Database['public']['Tables']['quote_requests']['Insert']
export type QuoteRequestUpdate = Database['public']['Tables']['quote_requests']['Update']

export type PaymentHistory = Database['public']['Tables']['payment_history']['Row']
export type PaymentHistoryInsert = Database['public']['Tables']['payment_history']['Insert']
export type PaymentHistoryUpdate = Database['public']['Tables']['payment_history']['Update']

// Enums for better type safety
export type ProductType = 'garden-room' | 'house-extension' | 'house-build'
export type ElementType = 'window' | 'external_door' | 'skylight'
export type InternalWallFinish = 'none' | 'panel' | 'skimPaint'
export type FloorType = 'none' | 'wooden' | 'tile'
export type PaymentStatus = 'pre-quote' | 'quoted' | 'deposit-paid' | 'installments' | 'paid' | 'overdue' | 'refunded'
export type PaymentType = 'DEPOSIT' | 'INSTALLMENT' | 'FINAL' | 'REFUND' | 'ADJUSTMENT'

// Custom extra item type for JSONB extras_other field
export interface ExtraItem {
  title: string
  cost: number
}

// Utility type for working with extras_other
export type ExtrasOther = ExtraItem[]