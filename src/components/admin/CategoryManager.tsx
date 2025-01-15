import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../lib/supabase';
import { Plus, Pencil, Trash2, Upload, FolderIcon, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { uploadToImgBB } from '../../utils/imgbb';

interface CategoryManagerProps {
  categories: Category[];
  onUpdate: () => Promise<void>;
}

export function CategoryManager({ categories, onUpdate }: CategoryManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    description: '',
    image_url: '',
    display_order: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    try {
      const file = event.target.files?.[0];
      if (!file) {
        console.log('No file selected');
        return;
      }

      console.log('Starting upload for file:', file.name);
      setUploading(true);

      const imageUrl = await uploadToImgBB(file);
      console.log('Upload successful, got URL:', imageUrl);

      if (isEditing && editing) {
        setEditing({ ...editing, image_url: imageUrl });
      } else {
        setNewCategory({ ...newCategory, image_url: imageUrl });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please check if ImgBB API key is set in settings.');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Получаем максимальный display_order
      const { data: maxOrderData } = await supabase
        .from('categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrderData?.display_order || 0) + 1;

      const { error } = await supabase
        .from('categories')
        .insert([{ ...newCategory, display_order: nextOrder }]);
      
      if (error) throw error;
      
      setNewCategory({ name: '', description: '', image_url: '', display_order: 0 });
      setShowForm(false);
      await onUpdate();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editing) return;
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editing.name,
          description: editing.description,
          image_url: editing.image_url,
          display_order: editing.display_order,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setEditing(null);
      await onUpdate();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await onUpdate();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[var(--whatsapp-dark)] text-white sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <FolderIcon className="h-5 w-5" />
            <h1 className="text-lg font-medium">Категории</h1>
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

      {/* Search */}
      <div className="p-2 bg-gray-50 border-b">
        <div className="relative">
          <Input
            type="text"
            placeholder="Поиск категорий..."
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
      </div>

      {/* Categories List */}
      <div className="p-2">
        <div className="space-y-2">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          onClick={() => setEditing(category)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-[var(--whatsapp-teal)]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(category.id)}
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="bg-white rounded-lg p-8 text-center mt-4">
            <div className="text-gray-400 mb-3">
              <FolderIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              Категории не найдены
            </h3>
            <p className="text-sm text-gray-500">
              {searchTerm
                ? 'Попробуйте изменить параметры поиска'
                : 'Добавьте первую категорию, нажав кнопку "+"'}
            </p>
          </div>
        )}
      </div>

      {/* Add Category Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md bg-white p-0 max-h-[95vh] flex flex-col mx-2">
          <div className="bg-[var(--whatsapp-dark)] text-white px-4 py-3 flex items-center justify-between">
            <DialogTitle className="text-base font-medium">
              Добавить категорию
            </DialogTitle>
          </div>
          <div className="p-4">
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Название
                </label>
                <Input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Название категории"
                  className="bg-gray-50 border-gray-200 focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Описание
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, description: e.target.value })
                  }
                  placeholder="Описание категории"
                  rows={3}
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Изображение категории
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    type="text"
                    value={newCategory.image_url}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, image_url: e.target.value })
                    }
                    placeholder="URL изображения"
                    className="flex-1"
                  />
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e)}
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
                </div>
                {newCategory.image_url && (
                  <div className="mt-2">
                    <img
                      src={newCategory.image_url}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Порядок отображения
                </label>
                <Input
                  type="number"
                  value={newCategory.display_order}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, display_order: parseInt(e.target.value) })
                  }
                  placeholder="Порядок отображения"
                  className="bg-gray-50 border-gray-200 focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[var(--whatsapp-teal)] hover:bg-[var(--whatsapp-teal-dark)] text-white"
                >
                  Добавить
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md bg-white p-0 max-h-[95vh] flex flex-col mx-2">
          <div className="bg-[var(--whatsapp-dark)] text-white px-4 py-3 flex items-center justify-between">
            <DialogTitle className="text-base font-medium">
              Редактировать категорию
            </DialogTitle>
          </div>
          {editing && (
            <div className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(editing.id);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Название
                  </label>
                  <Input
                    type="text"
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    placeholder="Название категории"
                    className="bg-gray-50 border-gray-200 focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={editing.description || ''}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    placeholder="Описание категории"
                    rows={3}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Изображение категории
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      type="text"
                      value={editing.image_url}
                      onChange={(e) =>
                        setEditing({ ...editing, image_url: e.target.value })
                      }
                      placeholder="URL изображения"
                      className="flex-1"
                    />
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
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
                  </div>
                  {editing.image_url && (
                    <div className="mt-2">
                      <img
                        src={editing.image_url}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Порядок отображения
                  </label>
                  <Input
                    type="number"
                    value={editing.display_order}
                    onChange={(e) =>
                      setEditing({ ...editing, display_order: parseInt(e.target.value) })
                    }
                    placeholder="Порядок отображения"
                    className="bg-gray-50 border-gray-200 focus:border-[var(--whatsapp-teal)] focus:ring-[var(--whatsapp-teal)]"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={() => setEditing(null)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[var(--whatsapp-teal)] hover:bg-[var(--whatsapp-teal-dark)] text-white"
                  >
                    Сохранить
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
