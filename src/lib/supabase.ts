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