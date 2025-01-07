import { useState } from 'react';
import { MessageCircle, ShoppingBag, Menu, Search, ChevronLeft, ChevronRight, Minimize2, Maximize2, X } from 'lucide-react';
import { cn } from './lib/utils';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { ScrollArea } from './components/ui/scroll-area';
import { Dialog, DialogContent } from './components/ui/dialog';

const categories = [
  { id: 1, name: 'Платки', image: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=800&auto=format&fit=crop' },
  { id: 2, name: 'Сумки', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&auto=format&fit=crop' },
  { id: 3, name: 'Кроссовки', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop' },
  { id: 4, name: 'Посуда', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop' },
];

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  description?: string;
  characteristics?: { [key: string]: string };
}

const products: Product[] = [
  {
    id: 1,
    name: 'Шелковый платок "Весна"',
    price: 2990,
    category: 'Платки',
    images: [
      'https://images.unsplash.com/photo-1584155828260-3791b9be1c0e?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584155828378-b88pefd9ea72?w=800&auto=format&fit=crop',
    ],
    description: 'Элегантный шелковый платок с весенним принтом. Идеально подходит для создания утонченного образа.',
    characteristics: {
      'Размер': '90x90 см',
      'Материал': '100% шелк',
      'Тип': 'Платок',
      'Сезон': 'Весна-Лето',
      'Узор': 'Цветочный',
      'Уход': 'Ручная стирка'
    }
  },
  {
    id: 2,
    name: 'Сумка "Элегант"',
    price: 5990,
    category: 'Сумки',
    images: [
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1591561954555-5c5e0c3ff2d9?w=800&auto=format&fit=crop',
    ],
    description: 'Стильная кожаная сумка с современным дизайном. Практичная и вместительная модель на каждый день.',
    characteristics: {
      'Размер': 'Средний (30x20x10 см)',
      'Материал': 'Натуральная кожа',
      'Цвет': 'Бежевый',
      'Тип': 'Сумка через плечо',
      'Застежка': 'Молния',
      'Отделения': '3 основных, 2 внутренних кармана',
      'Подкладка': 'Текстиль',
      'Фурнитура': 'Золотистая'
    }
  },
];

function ProductDialog({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "bg-white p-0 rounded-2xl overflow-hidden transition-all duration-300",
        isFullscreen ? "w-screen h-screen max-w-none rounded-none" : "sm:max-w-[500px]"
      )}>
        <div className="relative">
          <div className={cn(
            "relative group",
            isFullscreen ? "h-screen" : "h-[250px] sm:h-[300px]"
          )}>
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-contain bg-gray-50"
              onClick={!isFullscreen ? toggleFullscreen : undefined}
            />
            <button
              onClick={isFullscreen ? toggleFullscreen : onClose}
              className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all duration-300 z-10"
            >
              <X className="w-4 h-4" />
            </button>
            {!isFullscreen && (
              <div className={cn(
                "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                "bg-black/5"
              )}>
                <button
                  onClick={toggleFullscreen}
                  className="p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all duration-300 transform hover:scale-110"
                >
                  <Maximize2 className="w-6 h-6" />
                </button>
              </div>
            )}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all duration-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            {!isFullscreen && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      currentImageIndex === index 
                        ? "bg-white w-4" 
                        : "bg-white/50 hover:bg-white/80"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {!isFullscreen && (
          <div className="p-4 sm:p-5">
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-lg font-semibold leading-tight">{product.name}</h2>
                <p className="text-whatsapp-dark text-lg font-bold whitespace-nowrap">
                  {product.price.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              
              {product.description && (
                <p className="text-gray-600 text-sm">{product.description}</p>
              )}

              {product.characteristics && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(product.characteristics).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-gray-500">{key}</span>
                      <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => handleWhatsAppClick(product)}
                className="w-full bg-whatsapp-green hover:bg-whatsapp-teal text-white py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-sm mt-2"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Заказать
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product => 
    (!selectedCategory || product.category === selectedCategory) &&
    (!searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleWhatsAppClick = (product: Product) => {
    const message = `
Здравствуйте! Интересует товар:
🛍️ ${product.name}
💰 Цена: ${product.price.toLocaleString('ru-RU')} ₽
📝 ${product.description || ''}
    `.trim();
    window.open(`https://wa.me/89287777971?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-whatsapp-light text-gray-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-whatsapp-dark text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6" />
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            <h1 className="text-xl font-bold">БутикЧат</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6" />
          <MessageCircle className="w-6 h-6" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="sticky top-16 z-40 bg-whatsapp-light p-4">
        <Input
          className="bg-white rounded-full px-6"
          placeholder="Поиск товаров..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <ScrollArea className="bg-white/80 backdrop-blur-sm p-4 shadow-sm">
        <div className="flex gap-4 pb-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={cn(
                "flex-shrink-0 relative rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-105",
                "w-20 h-20 sm:w-24 sm:h-24 focus:outline-none",
                "border border-white/20 shadow-sm hover:shadow-md",
                selectedCategory === category.name && "ring-2 ring-whatsapp-dark ring-offset-2"
              )}
            >
              <img
                src={category.image}
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
        <ProductDialog
          product={selectedProduct}
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-whatsapp-dark text-white py-6 px-6 mt-8">
        <div className="text-center max-w-md mx-auto">
          <p className="mb-3 text-sm sm:text-base"> 2024 Все права защищены</p>
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