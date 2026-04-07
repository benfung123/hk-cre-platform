export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          name: string
          address: string
          district: string
          grade: string
          year_built: number | null
          total_sqft: number | null
          floors: number | null
          lat: number | null
          lng: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          district: string
          grade: string
          year_built?: number | null
          total_sqft?: number | null
          floors?: number | null
          lat?: number | null
          lng?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          district?: string
          grade?: string
          year_built?: number | null
          total_sqft?: number | null
          floors?: number | null
          lat?: number | null
          lng?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          property_id: string
          type: string
          price: number | null
          price_per_sqft: number | null
          date: string
          tenant_name: string | null
          floor_area: number | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          type: string
          price?: number | null
          price_per_sqft?: number | null
          date: string
          tenant_name?: string | null
          floor_area?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          type?: string
          price?: number | null
          price_per_sqft?: number | null
          date?: string
          tenant_name?: string | null
          floor_area?: number | null
          created_at?: string
        }
      }
      tenancies: {
        Row: {
          id: string
          property_id: string
          tenant_name: string
          floor: string | null
          unit: string | null
          lease_start: string | null
          lease_end: string | null
          industry: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          tenant_name: string
          floor?: string | null
          unit?: string | null
          lease_start?: string | null
          lease_end?: string | null
          industry?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          tenant_name?: string
          floor?: string | null
          unit?: string | null
          lease_start?: string | null
          lease_end?: string | null
          industry?: string | null
          created_at?: string
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
  }
}
