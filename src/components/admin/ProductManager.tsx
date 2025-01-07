import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Product, Category } from '../../lib/supabase'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

type Specification = {
  key: string
  value: string
}

export function ProductManager({
  products,
  categories,
  onUpdate,
}: {
  products: Product[]
  categories: Category[]
  onUpdate: () => void
}) {
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    price: 0,
    image_url: '',
    description: '',
    specifications: {} as Record<string, string>,
  })
  const [editing, setEditing] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [specifications, setSpecifications] = useState<Specification[]>([
    { key: '', value: '' },
  ])
  const [editingSpecs, setEditingSpecs] = useState<Specification[]>([])

  const handleSpecificationChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newSpecs = [...specifications]
    newSpecs[index][field] = value
    setSpecifications(newSpecs)

    if (
      index === specifications.length - 1 &&
      (newSpecs[index].key || newSpecs[index].value)
    ) {
      setSpecifications([...newSpecs, { key: '', value: '' }])
    }
  }

  const handleEditingSpecChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newSpecs = [...editingSpecs]
    newSpecs[index][field] = value
    setEditingSpecs(newSpecs)

    if (
      index === editingSpecs.length - 1 &&
      (newSpecs[index].key || newSpecs[index].value)
    ) {
      setEditingSpecs([...newSpecs, { key: '', value: '' }])
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const specsObject = specifications.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value
        }
        return acc
      }, {} as Record<string, string>)

      const { error } = await supabase.from('products').insert([
        {
          ...newProduct,
          specifications: specsObject,
        },
      ])

      if (error) throw error

      setNewProduct({
        name: '',
        category_id: '',
        price: 0,
        image_url: '',
        description: '',
        specifications: {},
      })
      setSpecifications([{ key: '', value: '' }])
      setShowForm(false)
      onUpdate()
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editing) return
    try {
      const specsObject = editingSpecs.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value
        }
        return acc
      }, {} as Record<string, string>)

      const { error } = await supabase
        .from('products')
        .update({
          ...editing,
          specifications: specsObject,
        })
        .eq('id', id)

      if (error) throw error

      setEditing(null)
      setEditingSpecs([])
      onUpdate()
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены что хотите удалить этот товар?')) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)

      if (error) throw error

      onUpdate()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const startEditing = (product: Product) => {
    setEditing(product)
    const specs = Object.entries(product.specifications || {}).map(
      ([key, value]) => ({ key, value })
    )
    setEditingSpecs([...specs, { key: '', value: '' }])
  }

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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Цена
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL изображения
              </label>
              <input
                type="url"
                required
                value={newProduct.image_url}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image_url: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
              />
            </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Характеристики
            </label>
            <div className="space-y-2">
              {specifications.map((spec, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Название"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecificationChange(index, 'key', e.target.value)
                    }
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Значение"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecificationChange(index, 'value', e.target.value)
                    }
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
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
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </div>
            {editing?.id === product.id ? (
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
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
                  step="0.01"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: parseFloat(e.target.value) })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                />
                <input
                  type="url"
                  value={editing.image_url}
                  onChange={(e) =>
                    setEditing({ ...editing, image_url: e.target.value })
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
                <div className="space-y-2">
                  {editingSpecs.map((spec, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Название"
                        value={spec.key}
                        onChange={(e) =>
                          handleEditingSpecChange(index, 'key', e.target.value)
                        }
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Значение"
                        value={spec.value}
                        onChange={(e) =>
                          handleEditingSpecChange(index, 'value', e.target.value)
                        }
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                      />
                    </div>
                  ))}
                </div>
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
                <h3 className="text-lg font-medium text-gray-900">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {categories.find((c) => c.id === product.category_id)?.name}
                </p>
                <p className="text-lg font-bold text-[var(--whatsapp-dark)] mt-2">
                  {product.price.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-4 space-y-2">
                  {Object.entries(product.specifications || {}).map(
                    ([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key}:</span>{' '}
                        <span className="text-gray-600">{value}</span>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => startEditing(product)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
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
  )
}
