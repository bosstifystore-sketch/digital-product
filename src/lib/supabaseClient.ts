import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jehhtiypvqhgkjbxhxtw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplaGh0aXlwdnFoZ2tqYnhoeHR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzgxNTgsImV4cCI6MjA5MDk1NDE1OH0.RtBLtM__kymKrT-IhoItSUMqCFitLdxMU3S1gPSNu_U'

export interface Coupon {
  id: string
  code: string
  discount_percentage: number
  is_active: boolean
  usage_limit: number | null
  used_count: number
  expires_at: string | null
  created_at: string
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  title: string
  description: string
  price: number
  images: string[]
  category: string
  stock_status: boolean
  created_at: string
}

export type Order = {
  id: string
  user_id: string
  product_id: string
  product_details: Record<string, unknown>
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
}

export type UserProfile = {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}
