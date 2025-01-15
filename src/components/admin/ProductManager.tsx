import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, Category } from '../../lib/supabase';
import { Plus, Pencil, Trash2, X, Package, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { uploadToImgBB } from '../../utils/imgbb';

type Specification = {
  key: string;
  value: string;
};

export function ProductManager({
  products,
  categories,
  onUpdate,
}: {
  products: Product[];
  categories: Category[];
  onUpdate: () => void;
}) {
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    price: 0,
    images: [] as string[],
    description: '',
    specifications: {} as Record<string, string>,
  });
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [specifications, setSpecifications] = useState<Specification[]>([
    { key: '', value: '' },
  ]);
  const [editingSpecs, setEditingSpecs] = useState<Specification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const ImageInput = ({ 
    images, 
    onChange 
  }: { 
    images: string[], 
    onChange: (images: string[]) => void 
  }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      try {
        const file = event.target.files?.[0];
        if (!file) {
          console.log('No file selected');
          return;
        }

        console.log('Starting upload for file:', file.name, 'at index:', index);
        setUploading(true);

        const imageUrl = await uploadToImgBB(file);
        console.log('Upload successful, got URL:', imageUrl);

        const newImages = [...images];
        newImages[index] = imageUrl;
        onChange(newImages);
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please check if ImgBB API key is set in settings.');
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="space-y-2">
        {images.map((url, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="text"
              value={url}
              onChange={(e) => {
                const newImages = [...images];
                newImages[index] = e.target.value;
                onChange(newImages);
              }}
              placeholder="URL изображения"
              className="flex-1"
            />
            <label className="relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, index)}
                className="sr-only"
              />
              <Button
                type="button"
                variant="outline"
                size="default"
                disabled={uploading}
                className="relative pointer-events-none"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Загрузка...' : 'Загрузить'}
              </Button>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => {
                const newImages = images.filter((_, i) => i !== index);
                onChange(newImages);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...images, ''])}
          className="w-full border-dashed border-gray-300 hover:border-[var(--whatsapp-teal)] hover:text-[var(--whatsapp-teal)]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Добавить изображение
        </Button>
      </div>
    );
  };

  const SpecificationInput = ({
    specs,
    onChange,
  }: {
    specs: Specification[];
    onChange: (specs: Specification[]) => void;
  }) => {
    return (
      <div className="space-y-2">
        {specs.map((spec, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="text"
              value={spec.key}
              onChange={(e) => {
                const newSpecs = [...specs];
                newSpecs[index].key = e.target.value;
                onChange(newSpecs);
              }}
              placeholder="Характеристика"
              className="flex-1 bg-gray-50 border-gray-200 focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
            />
            <Input
              type="text"
              value={spec.value}
              onChange={(e) => {
                const newSpecs = [...specs];
                newSpecs[index].value = e.target.value;
                onChange(newSpecs);
              }}
              placeholder="Значение"
              className="flex-1 bg-gray-50 border-gray-200 focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => {
                const newSpecs = specs.filter((_, i) => i !== index);
                onChange(newSpecs);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...specs, { key: '', value: '' }])}
          className="w-full border-dashed border-gray-300 hover:border-[var(--whatsapp-teal)] hover:text-[var(--whatsapp-teal)]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Добавить характеристику
        </Button>
      </div>
    );
  };

  const ProductForm = ({
    product,
    specs,
    onSubmit,
    onCancel,
  }: {
    product: typeof newProduct;
    specs: Specification[];
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Название товара
          </label>
          <Input
            type="text"
            value={product.name}
            onChange={(e) =>
              product === newProduct
                ? setNewProduct({ ...newProduct, name: e.target.value })
                : setEditing({ ...editing!, name: e.target.value })
            }
            placeholder="Введите название товара"
            required
            className="bg-gray-50 border-gray-200 focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Категория
          </label>
          <select
            value={product.category_id}
            onChange={(e) =>
              product === newProduct
                ? setNewProduct({ ...newProduct, category_id: e.target.value })
                : setEditing({ ...editing!, category_id: e.target.value })
            }
            className="w-full h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Цена
          </label>
          <Input
            type="number"
            value={product.price}
            onChange={(e) =>
              product === newProduct
                ? setNewProduct({ ...newProduct, price: Number(e.target.value) })
                : setEditing({ ...editing!, price: Number(e.target.value) })
            }
            placeholder="0"
            min="0"
            required
            className="bg-gray-50 border-gray-200 focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Описание
          </label>
          <textarea
            value={product.description}
            onChange={(e) =>
              product === newProduct
                ? setNewProduct({ ...newProduct, description: e.target.value })
                : setEditing({ ...editing!, description: e.target.value })
            }
            rows={2}
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
            placeholder="Описание товара"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Изображения
        </label>
        <ImageInput
          images={product.images}
          onChange={(images) =>
            product === newProduct
              ? setNewProduct({ ...newProduct, images })
              : setEditing({ ...editing!, images })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Характеристики
        </label>
        <SpecificationInput
          specs={specs}
          onChange={(newSpecs) =>
            product === newProduct
              ? setSpecifications(newSpecs)
              : setEditingSpecs(newSpecs)
          }
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button 
          type="button" 
          onClick={onCancel} 
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800"
        >
          Отмена
        </Button>
        <Button 
          type="submit"
          size="sm"
          className="bg-[var(--whatsapp-dark)] hover:bg-[var(--whatsapp-teal)] text-white"
        >
          {product === newProduct ? 'Добавить' : 'Сохранить'}
        </Button>
      </div>
    </form>
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const specsObject = specifications.reduce(
      (acc, { key, value }) => (key ? { ...acc, [key]: value } : acc),
      {}
    );

    try {
      const { error } = await supabase.from('products').insert([
        {
          ...newProduct,
          specifications: specsObject,
        },
      ]);

      if (error) throw error;

      setNewProduct({
        name: '',
        category_id: '',
        price: 0,
        images: [],
        description: '',
        specifications: {},
      });
      setSpecifications([{ key: '', value: '' }]);
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editing) return;
    const specsObject = editingSpecs.reduce(
      (acc, { key, value }) => (key ? { ...acc, [key]: value } : acc),
      {}
    );

    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...editing,
          specifications: specsObject,
        })
        .eq('id', id);

      if (error) throw error;

      setEditing(null);
      setEditingSpecs([]);
      onUpdate();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[var(--whatsapp-dark)] text-white sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Package className="h-5 w-5" />
            <h1 className="text-lg font-medium">Управление товарами</h1>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[var(--whatsapp-teal)] hover:bg-[var(--whatsapp-teal-dark)] text-white"
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-2 bg-gray-50 border-b">
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 bg-white border-gray-200 focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)] rounded-full"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-10 rounded-full border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:border-[var(--whatsapp-teal)] focus:ring-1 focus:ring-[var(--whatsapp-teal)]"
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products List */}
      <div className="p-2">
        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {product.images && product.images[0] && (
                <div className="aspect-[4/3] relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-[var(--whatsapp-teal)] font-medium mt-0.5">
                      {product.price.toLocaleString()} ₽
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      onClick={() => {
                        setEditing(product);
                        setEditingSpecs(
                          Object.entries(product.specifications || {}).map(
                            ([key, value]) => ({ key, value })
                          )
                        );
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-[var(--whatsapp-teal)]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {product.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <Package className="h-3.5 w-3.5 mr-1" />
                  {categories.find((c) => c.id === product.category_id)?.name || 'Без категории'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center mt-4">
            <div className="text-gray-400 mb-3">
              <Package className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">Товары не найдены</h3>
            <p className="text-sm text-gray-500">
              {searchTerm
                ? 'Попробуйте изменить параметры поиска'
                : 'Добавьте первый товар, нажав кнопку "+"'}
            </p>
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md bg-white p-0 max-h-[95vh] flex flex-col mx-2">
          <div className="bg-[var(--whatsapp-dark)] text-white px-4 py-3 flex items-center justify-between">
            <DialogTitle className="text-base font-medium">
              Добавить товар
            </DialogTitle>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            <ProductForm
              product={newProduct}
              specs={specifications}
              onSubmit={handleAdd}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md bg-white p-0 max-h-[95vh] flex flex-col mx-2">
          <div className="bg-[var(--whatsapp-dark)] text-white px-4 py-3 flex items-center justify-between">
            <DialogTitle className="text-base font-medium">
              Редактировать товар
            </DialogTitle>
          </div>
          {editing && (
            <div className="overflow-y-auto flex-1 p-4">
              <ProductForm
                product={editing}
                specs={editingSpecs}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(editing.id);
                }}
                onCancel={() => setEditing(null)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}