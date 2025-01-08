import React, { useState, useEffect } from 'react';
import { MessageCircle, ShoppingBag, Menu, Search, X, Instagram, Send } from 'lucide-react';
import { cn } from './lib/utils';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { ScrollArea } from './components/ui/scroll-area';
import { Dialog, DialogContent } from './components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';
import { supabase } from './lib/supabase';
import type { Category, Product, Settings } from './lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Separator } from './components/ui/separator';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      if (categoriesData) setCategories(categoriesData);

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*');
      if (productsData) setProducts(productsData);

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single();
      if (settingsData) setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (product: Product) => {
    if (!settings?.whatsapp_number) return;
    
    const message = `
Здравствуйте! Интересует товар:
${product.name}
Цена: ${product.price.toLocaleString('ru-RU')} ₽
${product.description || ''}
    `.trim();
    window.open(`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleNextImage = () => {
    if (!selectedProduct) return;
    setCurrentImageIndex((prev) => 
      prev === selectedProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    if (!selectedProduct) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? selectedProduct.images.length - 1 : prev - 1
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevImage();
    if (e.key === 'ArrowRight') handleNextImage();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedProduct]);

  const filteredProducts = products.filter(product => 
    (!selectedCategory || product.category_id === selectedCategory) &&
    (!searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-dark"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-whatsapp-light text-gray-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-whatsapp-dark text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-whatsapp-teal">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-white p-0">
              <nav className="flex flex-col h-full bg-whatsapp-dark text-white">
                <div className="p-6 border-b border-whatsapp-teal/20">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6" />
                    <h2 className="text-xl font-bold">{settings?.site_name || 'БутикЧат'}</h2>
                  </div>
                </div>
                <ScrollArea className="flex-1 px-3">
                  <div className="space-y-1 py-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-whatsapp-teal font-medium text-base"
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchQuery('');
                      }}
                    >
                      Все товары
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-whatsapp-teal font-medium text-base"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSearchQuery('');
                        }}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-6 border-t border-whatsapp-teal/20 space-y-3">
                  <div className="flex justify-center space-x-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-whatsapp-teal"
                      onClick={() => window.open('https://instagram.com', '_blank')}
                    >
                      <Instagram className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-whatsapp-teal"
                      onClick={() => window.open('https://t.me', '_blank')}
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-whatsapp-teal"
                      onClick={() => window.open(`https://wa.me/${settings?.whatsapp_number}`, '_blank')}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-white hover:bg-whatsapp-teal font-medium"
                    onClick={() => window.open(`https://wa.me/${settings?.whatsapp_number}`, '_blank')}
                  >
                    Связаться с нами
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            <h1 className="text-xl font-bold">{settings?.site_name || 'БутикЧат'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-whatsapp-teal"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-whatsapp-teal"
            onClick={() => window.open(`https://wa.me/${settings?.whatsapp_number}`, '_blank')}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div className="sticky top-16 z-40 bg-whatsapp-light p-4">
          <Input
            className="bg-white rounded-full px-6"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Categories */}
      <ScrollArea className="bg-white/80 backdrop-blur-sm p-4 shadow-sm">
        <div className="flex gap-4 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "flex-shrink-0 relative rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-105",
                "w-20 h-20 sm:w-24 sm:h-24 focus:outline-none",
                "border border-white/20 shadow-sm hover:shadow-md",
                selectedCategory === category.id && "ring-2 ring-whatsapp-dark ring-offset-2"
              )}
            >
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex items-center justify-center group-hover:from-black/70 group-hover:to-black/30 transition-all duration-300">
                <span className="text-white text-xs sm:text-sm font-medium px-2 text-center drop-shadow-md">
                  {category.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-[1.02] border border-gray-100"
            >
              <div
                className="relative aspect-square cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {product.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                    {product.images.length} фото
                  </div>
                )}
              </div>
              <div className="p-3 sm:p-4 border-t border-gray-50">
                <h3 className="text-xs sm:text-sm font-medium mb-1.5 line-clamp-2 group-hover:text-whatsapp-dark transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-whatsapp-dark font-bold text-sm sm:text-base mb-3">
                  {product.price.toLocaleString('ru-RU')} ₽
                </p>
                <Button
                  onClick={() => handleWhatsAppClick(product)}
                  className="w-full bg-whatsapp-green hover:bg-whatsapp-teal text-white text-xs sm:text-sm py-1.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Заказать
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Dialog */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-4xl p-0 bg-white max-h-[90vh] overflow-hidden">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Image Gallery */}
              <div className="relative">
                <div className="relative aspect-square">
                  <img
                    src={selectedProduct.images[currentImageIndex]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedProduct.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
                {/* Thumbnails */}
                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-2 mt-2 px-2 overflow-x-auto">
                    {selectedProduct.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-300",
                          currentImageIndex === index 
                            ? "ring-2 ring-whatsapp-dark ring-offset-2"
                            : "opacity-50 hover:opacity-100"
                        )}
                      >
                        <img
                          src={image}
                          alt={`${selectedProduct.name} - фото ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Product Info */}
              <div className="p-6">
                <ScrollArea className="h-[calc(90vh-8rem)]">
                  <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
                  <p className="text-xl font-bold text-whatsapp-dark mb-4">
                    {selectedProduct.price.toLocaleString('ru-RU')} ₽
                  </p>
                  <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
                  
                  {Object.entries(selectedProduct.specifications || {}).length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Характеристики:</h3>
                      <dl className="grid grid-cols-2 gap-2">
                        {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                          <React.Fragment key={key}>
                            <dt className="text-gray-600">{key}:</dt>
                            <dd className="font-medium">{value}</dd>
                          </React.Fragment>
                        ))}
                      </dl>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => handleWhatsAppClick(selectedProduct)}
                    className="w-full bg-whatsapp-green hover:bg-whatsapp-teal text-white py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Заказать через WhatsApp
                  </Button>
                </ScrollArea>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <footer className="bg-whatsapp-dark text-white py-6 px-6 mt-8">
        <div className="text-center max-w-md mx-auto">
          <p className="mb-3 text-sm sm:text-base">© 2024 {settings?.site_name || 'БутикЧат'}. Все права защищены</p>
          <p className="text-sm opacity-90 mb-3">Сделано сыном с бесконечной любовью для мамы</p>
          <a
            href="https://nepersonaj.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm opacity-90 hover:opacity-100 underline hover:text-whatsapp-green transition-colors duration-300"
          >
            @NEPERSONAJ
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;