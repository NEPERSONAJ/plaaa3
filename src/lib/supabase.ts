import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  created_at: string;
}

export interface Settings {
  id: string;
  site_name: string;
  whatsapp_number: string;
  privacy_policy: string;
  imgbb_api_key: string;
  created_at: string;
}