import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../lib/supabase'
import { Plus, Pencil, Trash2, X, Check, MoveUp, MoveDown } from 'lucide-react'

export function CategoryManager({ categories, onUpdate }: { categories: Category[], onUpdate: () => void }) {
  const [newCategory, setNewCategory] = useState({
    name: '',
    image_url: '',
    display_order: 0
  })
  const [editing, setEditing] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory])
      
      if (error) throw error
      
      setNewCategory({ name: '', image_url: '', display_order: 0 })
      setShowForm(false)
      onUpdate()
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editing) return
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editing.name,
          image_url: editing.image_url,
          display_order: editing.display_order
        })
        .eq('id', id)
      
      if (error) throw error
      
      setEditing(null)
      onUpdate()
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены что хотите удалить эту категорию?')) return
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      onUpdate()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleMove = async (category: Category, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === category.id)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === categories.length - 1)
    ) {
      return
    }

    const otherIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const otherCategory = categories[otherIndex]

    try {
      const updates = [
        {
          id: category.id,
          display_order: otherCategory.display_order
        },
        {
          id: otherCategory.id,
          display_order: category.display_order
        }
      ]

      for (const update of updates) {
        const { error } = await supabase
          .from('categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id)
        
        if (error) throw error
      }

      onUpdate()
    } catch (error) {
      console.error('Error moving category:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Категории</h2>
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
              <span>Добавить категорию</span>
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
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
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
                value={newCategory.image_url}
                onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Порядок отображения
            </label>
            <input
              type="number"
              required
              value={newCategory.display_order}
              onChange={(e) => setNewCategory({ ...newCategory, display_order: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--whatsapp-dark)] hover:bg-[var(--whatsapp-teal)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--whatsapp-dark)]"
          >
            Добавить категорию
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <div key={category.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-48 object-cover"
              />
            </div>
            {editing?.id === category.id ? (
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                />
                <input
                  type="url"
                  value={editing.image_url}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                />
                <input
                  type="number"
                  value={editing.display_order}
                  onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdate(category.id)}
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
                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">Порядок: {category.display_order}</p>
                <div className="mt-4 flex justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditing(category)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить
                    </button>
                  </div>
                  <div className="flex space-x-1">
                    {index > 0 && (
                      <button
                        onClick={() => handleMove(category, 'up')}
                        className="inline-flex items-center p-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                    )}
                    {index < categories.length - 1 && (
                      <button
                        onClick={() => handleMove(category, 'down')}
                        className="inline-flex items-center p-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
