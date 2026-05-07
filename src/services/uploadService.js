import { supabase } from '../lib/supabase'

export async function uploadFoto(file, fichaId) {
  try {
    const ext = file.name.split('.').pop()

    const fileName = `${fichaId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('fotos-fichas')
      .upload(fileName, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('fotos-fichas')
      .getPublicUrl(fileName)

    return data.publicUrl
  } catch (err) {
    console.error('[Upload] Erro:', err)
    return null
  }
}