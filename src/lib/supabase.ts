import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Category = {
  id: string
  name: string
  image_url: string
  display_order: number
  created_at: string
}

export type Product = {
  id: string
  category_id: string
  name: string
  price: number
  image_url: string
  description: string
  specifications: Record<string, string>
  created_at: string
}

export type Settings = {
  id: string
  site_name: string
  whatsapp_number: string
  privacy_policy: string
  created_at: string
}
