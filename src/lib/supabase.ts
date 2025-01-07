import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Product = {
  id: string
  category_id: string
  name: string
  price: number
  images: string[]
  description: string
  specifications: Record<string, string>
  created_at: string
}

export type Category = {
  id: string
  name: string
  image_url: string
  display_order: number
}

export type Settings = {
  id: string
  site_name: string
  whatsapp_number: string
  privacy_policy: string
}