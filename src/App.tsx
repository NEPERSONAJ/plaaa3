import { useState } from 'react';
import { MessageCircle, ShoppingBag, Menu, Search, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const categories = [
  { id: 1, name: 'Платки', image: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=800&auto=format&fit=crop' },
  { id: 2, name: 'Сумки', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&auto=format&fit=crop' },
  { id: 3, name: 'Кроссовки', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop' },
  { id: 4, name: 'Посуда', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop' },
];

const products = [
  { id: 1, name: 'Шелковый платок "Весна"', price: 2990, category: 'Платки', image: 'https://images.unsplash.com/photo-1584155828260-3791b9be1c0e?w=800&auto=format&fit=crop' },
  { id: 2, name: 'Сумка "Элегант"', price: 5990, category: 'Сумки', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop' },
  // Add more products...
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product => 
    (!selectedCategory || product.category === selectedCategory) &&
    (!searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleWhatsAppClick = (productName: string) => {
    const message = `Здравствуйте! Интересует товар: ${productName}`;
    window.open(`https://wa.me/+1234567890?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#ECE5DD] text-[#111B21]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#075E54] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6" />
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            <h1 className="text-xl font-bold font-[Montserrat]">БутикЧат</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6" />
          <MessageCircle className="w-6 h-6" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="sticky top-16 z-40 bg-[#ECE5DD] p-4">
        <Input
          className="bg-white rounded-full px-6"
          placeholder="Поиск товаров..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <ScrollArea className="bg-white p-4">
        <div className="flex gap-4 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={cn(
                "flex-shrink-0 relative rounded-lg overflow-hidden group",
                "w-24 h-24 focus:outline-none"
              )}
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {category.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Products Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg overflow-hidden shadow-md"
          >
            <div className="relative pb-[100%]">
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full">
                <Heart className="w-5 h-5 text-[#075E54]" />
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm mb-1">{product.name}</h3>
              <p className="text-[#075E54] font-bold mb-2">
                {product.price.toLocaleString('ru-RU')} ₽
              </p>
              <Button
                onClick={() => handleWhatsAppClick(product.name)}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Написать
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;