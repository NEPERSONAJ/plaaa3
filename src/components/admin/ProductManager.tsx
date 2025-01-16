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

  const ImageInput = ({ 
    images, 
    onChange 
  }: { 
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

  const SpecificationsInput = ({
    specs,
    onChange,
  }: {
    specs: Specification[];
    onChange: (specs: Specification[]) => void;
  }) => {
    const addSpec = () => {
      onChange([...specs, { key: '', value: '' }]);
    };

    const removeSpec = (index: number) => {
      const newSpecs = [...specs];
      newSpecs.splice(index, 1);
      onChange(newSpecs);
    };

    const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
      const newSpecs = [...specs];
      newSpecs[index][field] = value;
      onChange(newSpecs);
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Характеристики
        </label>
        {specs.map((spec, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={spec.key}
              onChange={(e) => updateSpec(index, 'key', e.target.value)}
              placeholder="Название"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
            />
            <input
              type="text"
              value={spec.value}
              onChange={(e) => updateSpec(index, 'value', e.target.value)}
              placeholder="Значение"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
            />
            <button
              type="button"
              onClick={() => removeSpec(index)}
              className="p-2 text-red-600 hover:text-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSpec}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить характеристику
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

  const handleUpdate = async (id: string) => {
    if (!editing) return;
    try {
      const specsObject = editingSpecs.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value;
        }
        return acc;
      }, {} as Record<string, string>);

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
    if (!window.confirm('Вы уверены что хотите удалить этот товар?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      onUpdate();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const startEditing = (product: Product) => {
    setEditing(product);
    const specs = Object.entries(product.specifications || {}).map(
      ([key, value]) => ({ key, value })
    );
    setEditingSpecs(specs.length ? specs : [{ key: '', value: '' }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Товары</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--whatsapp-dark)] text-white hover:bg-[var(--whatsapp-teal)] transition-colors"
        >
          {showForm ? (
            <>
              <X className="w-5 h-5 mr-2" />
              <span>Отмена</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              <span>Добавить товар</span>
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Название
              </label>
              <input
                type="text"
                required
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Категория
              </label>
              <select
                required
                value={newProduct.category_id}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category_id: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Цена
            </label>
            <input
              type="number"
              required
              min="0"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: Number(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Описание
            </label>
            <textarea
              required
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
            />
          </div>

          <ImageInput
            images={newProduct.images}
            onChange={(images) => setNewProduct({ ...newProduct, images })}
          />

          <SpecificationsInput
            specs={specifications}
            onChange={setSpecifications}
          />

          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--whatsapp-dark)] hover:bg-[var(--whatsapp-teal)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--whatsapp-dark)]"
          >
            Добавить товар
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
            {editing?.id === product.id ? (
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                />
                <select
                  value={editing.category_id}
                  onChange={(e) =>
                    setEditing({ ...editing, category_id: e.target.value })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: Number(e.target.value) })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                />
                <textarea
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                />
                <ImageInput
                  images={editing.images}
                  onChange={(images) => setEditing({ ...editing, images })}
                />
                <SpecificationsInput
                  specs={editingSpecs}
                  onChange={setEditingSpecs}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdate(product.id)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[var(--whatsapp-dark)] hover:bg-[var(--whatsapp-teal)]"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Сохранить
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {categories.find((c) => c.id === product.category_id)?.name}
                </p>
                <p className="mt-1 text-lg font-bold text-[var(--whatsapp-dark)]">
                  {product.price.toLocaleString('ru-RU')} ₽
                </p>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => startEditing(product)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}