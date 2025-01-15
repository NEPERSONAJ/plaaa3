import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Category, Product, Settings } from '../../lib/supabase'
import { CategoryManager } from './CategoryManager'
import { ProductManager } from './ProductManager'
import { SettingsManager } from './SettingsManager'
import { Menu, X, LogOut, Grid, Package, Settings as SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')
      if (categoriesData) setCategories(categoriesData)

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
      if (productsData) setProducts(productsData)

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single()
      if (settingsData) setSettings(settingsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  const menuItems = [
    { id: 'categories', label: 'Категории', icon: <Grid className="w-5 h-5" /> },
    { id: 'products', label: 'Товары', icon: <Package className="w-5 h-5" /> },
    { id: 'settings', label: 'Настройки', icon: <SettingsIcon className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-[var(--whatsapp-light)]">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-[var(--whatsapp-dark)]">
              Админ панель
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-[var(--whatsapp-dark)] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--whatsapp-dark)]"></div>
            </div>
          ) : (
            <>
              {activeTab === 'categories' && (
                <CategoryManager
                  categories={categories}
                  onUpdate={fetchData}
                />
              )}

              {activeTab === 'products' && (
                <ProductManager
                  products={products}
                  categories={categories}
                  onUpdate={fetchData}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsManager
                  settings={settings}
                  onUpdate={fetchData}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
