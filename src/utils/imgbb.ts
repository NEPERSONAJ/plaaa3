import { supabase } from '../lib/supabase'

export async function uploadToImgBB(file: File): Promise<string> {
  try {
    // Получаем API ключ из настроек
    const { data: settings } = await supabase
      .from('settings')
      .select('imgbb_api_key')
      .single()

    if (!settings?.imgbb_api_key) {
      throw new Error('ImgBB API key not found in settings')
    }

    // Конвертируем файл в base64
    const base64 = await fileToBase64(file)

    // Создаем форму для отправки
    const formData = new FormData()
    formData.append('key', settings.imgbb_api_key)
    formData.append('image', base64.split(',')[1]) // Убираем префикс data:image/...

    // Отправляем запрос к ImgBB
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    console.log('ImgBB response:', data) // Добавляем лог для отладки

    if (!data.success) {
      throw new Error(data.error?.message || 'Failed to upload image')
    }

    // Возвращаем URL загруженного изображения
    return data.data.display_url // Используем display_url вместо url
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}
