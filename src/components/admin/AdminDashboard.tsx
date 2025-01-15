import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Category, Product, Settings } from '../../lib/supabase'
import { CategoryManager } from './CategoryManager' // Fix import for CategoryManager
import { ProductManager } from './ProductManager'
import { SettingsManager } from './SettingsManager'
import { Menu, X, LogOut, Grid, Package, Settings as SettingsIcon, Home, TrendingUp, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ScrollArea } from '../ui/scroll-area'

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
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
    { id: 'dashboard', label: 'Обзор', icon: <Home className="w-5 h-5" /> },
    { id: 'categories', label: 'Категории', icon: <Grid className="w-5 h-5" /> },
    { id: 'products', label: 'Товары', icon: <Package className="w-5 h-5" /> },
    { id: 'settings', label: 'Настройки', icon: <SettingsIcon className="w-5 h-5" /> },
  ]

  const DashboardOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Всего товаров</h3>
            <ShoppingBag className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-700">{products.length}</p>
          <div className="mt-2 flex items-center text-sm text-green-500">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Активных товаров</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Категории</h3>
            <Grid className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-700">{categories.length}</p>
          <div className="mt-2 flex items-center text-sm text-purple-500">
            <span>Активных категорий</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Настройки магазина</h3>
            <SettingsIcon className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-xl font-medium text-gray-700 truncate">{settings?.site_name || 'Не задано'}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span>{settings?.whatsapp_number || 'WhatsApp не настроен'}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('products')}
            className="flex items-center space-x-3 p-4 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span>Добавить товар</span>
          </button>
          
          <button
            onClick={() => setActiveTab('categories')}
            className="flex items-center space-x-3 p-4 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
          >
            <Grid className="w-5 h-5" />
            <span>Добавить категорию</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center space-x-3 p-4 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Настройки</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-40`}
      >
        <ScrollArea className="h-full">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900">
                Админ панель
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {settings?.site_name || 'Управление магазином'}
              </p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardOverview />}
              
              {activeTab === 'categories' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <CategoryManager
                    categories={categories}
                    onUpdate={fetchData}
                  />
                </div>
              )}

              {activeTab === 'products' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <ProductManager
                    products={products}
                    categories={categories}
                    onUpdate={fetchData}
                  />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <SettingsManager
                    settings={settings}
                    onUpdate={fetchData}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

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
