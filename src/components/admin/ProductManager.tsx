import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, Category } from '../../lib/supabase';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

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

  const ImageInput = ({ images, onChange }: { 
    images: string[], 
    onChange: (images: string[]) => void 
  }) => {
    const addImage = () => {
      onChange([...images, '']);
    };

    const removeImage = (index: number) => {
      const newImages = [...images];
      newImages.splice(index, 1);
      onChange(newImages);
    };

    const updateImage = (index: number, value: string) => {
      const newImages = [...images];
      newImages[index] = value;
      onChange(newImages);
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Изображения
        </label>
        {images.map((url, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => updateImage(index, e.target.value)}
              placeholder="URL изображения"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="p-2 text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addImage}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить изображение
        </button>
      </div>
    );
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const specsObject = specifications.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value;
        }
        return acc;
      }, {} as Record<string, string>);

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

  // ... rest of your existing ProductManager code ...

  return (
    <div className="space-y-6">
      {/* Form section */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* ... other form fields ... */}
          <ImageInput 
            images={newProduct.images}
            onChange={(images) => setNewProduct({ ...newProduct, images })}
          />
          {/* ... rest of the form ... */}
        </form>
      )}
      
      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Product display */}
            {editing?.id === product.id ? (
              <div className="p-4 space-y-4">
                {/* Editing form */}
                <ImageInput 
                  images={editing.images}
                  onChange={(images) => setEditing({ ...editing, images })}
                />
                {/* ... rest of editing form ... */}
              </div>
            ) : (
              <div className="p-4">
                {/* Product display */}
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                {/* ... rest of product display ... */}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}