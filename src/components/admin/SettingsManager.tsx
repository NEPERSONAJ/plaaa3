import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Settings } from '../../lib/supabase'
import { Save } from 'lucide-react'

export function SettingsManager({
  settings,
  onUpdate,
}: {
  settings: Settings | null
  onUpdate: () => void
}) {
  const [formData, setFormData] = useState<Partial<Settings>>({
    site_name: '',
    whatsapp_number: '',
    privacy_policy: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name,
        whatsapp_number: settings.whatsapp_number,
        privacy_policy: settings.privacy_policy,
      })
    }
  }, [settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('settings')
          .update(formData)
          .eq('id', settings.id)

        if (error) throw error
      } else {
        // Create new settings
        const { error } = await supabase.from('settings').insert([formData])

        if (error) throw error
      }

      setMessage({
        type: 'success',
        text: 'Настройки успешно сохранены',
      })
      onUpdate()
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({
        type: 'error',
        text: 'Ошибка при сохранении настроек',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Настройки сайта</h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
        <div>
          <label
            htmlFor="site_name"
            className="block text-sm font-medium text-gray-700"
          >
            Название сайта
          </label>
          <input
            type="text"
            id="site_name"
            required
            value={formData.site_name}
            onChange={(e) =>
              setFormData({ ...formData, site_name: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="whatsapp_number"
            className="block text-sm font-medium text-gray-700"
          >
            Номер WhatsApp
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">+</span>
            </div>
            <input
              type="tel"
              id="whatsapp_number"
              required
              value={formData.whatsapp_number}
              onChange={(e) =>
                setFormData({ ...formData, whatsapp_number: e.target.value })
              }
              className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
              placeholder="7XXXXXXXXXX"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Введите номер в формате: 7XXXXXXXXXX (без +)
          </p>
        </div>

        <div>
          <label
            htmlFor="privacy_policy"
            className="block text-sm font-medium text-gray-700"
          >
            Политика конфиденциальности
          </label>
          <textarea
            id="privacy_policy"
            required
            value={formData.privacy_policy}
            onChange={(e) =>
              setFormData({ ...formData, privacy_policy: e.target.value })
            }
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--whatsapp-dark)] focus:ring-[var(--whatsapp-dark)] sm:text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--whatsapp-dark)] hover:bg-[var(--whatsapp-teal)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--whatsapp-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </form>
    </div>
  )
}
